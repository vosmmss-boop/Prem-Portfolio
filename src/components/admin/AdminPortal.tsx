import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Branding,
  HeroSlide,
  Autobiography,
  EducationMilestone,
  ExperienceEntry,
  BlogArticle,
  FAQItem,
  UsefulLink,
  DownloadItem,
  GalleryItem,
  SocialChannelItem
} from '../../types';
import { getStorage, ref, uploadBytes, uploadBytesResumable, getDownloadURL, UploadTask } from 'firebase/storage';
import {
  app,
  storage,
  firebaseConfig,
  saveNodeData,
  checkSlugUniqueness,
  checkFirebaseConnection,
  pushAllContentToFirebase,
  uploadImageToFirebaseStorage,
  validateImageFile,
  sanitizeStorageFileName,
  formatFirebaseStorageError
} from '../../services/firebase';
import { generateSlug } from '../../utils/slugify';
import { UniversalRichTextEditor } from '../common/UniversalRichTextEditor';
import {
  Shield,
  Layers,
  User,
  GraduationCap,
  Briefcase,
  FileText,
  HelpCircle,
  Link2,
  Download,
  Image as ImageIcon,
  Camera,
  LogOut,
  ArrowLeft,
  Save,
  CloudUpload,
  Plus,
  Trash2,
  Edit,
  Upload,
  CheckCircle2,
  MapPin,
  BarChart3,
  Video,
  FileUp,
  Share2,
  Globe,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Database,
  X,
  DownloadCloud,
  Maximize2
} from 'lucide-react';
import { adjustAndProcessUploadedImage } from '../../utils/imageAdjuster';
import { FullScreenImageViewer } from '../common/FullScreenImageViewer';

interface AdminPortalProps {
  branding: Branding;
  onUpdateBranding: (b: Branding) => void;
  slides: HeroSlide[];
  onUpdateSlides: (s: HeroSlide[]) => void;
  autobiography: Autobiography;
  onUpdateAutobiography: (a: Autobiography) => void;
  education: EducationMilestone[];
  onUpdateEducation: (e: EducationMilestone[]) => void;
  experience: ExperienceEntry[];
  onUpdateExperience: (e: ExperienceEntry[]) => void;
  blogs: BlogArticle[];
  onUpdateBlogs: (b: BlogArticle[]) => void;
  faqs: FAQItem[];
  onUpdateFaqs: (f: FAQItem[]) => void;
  usefulLinks: UsefulLink[];
  onUpdateUsefulLinks: (l: UsefulLink[]) => void;
  downloads: DownloadItem[];
  onUpdateDownloads: (d: DownloadItem[]) => void;
  gallery: GalleryItem[];
  onUpdateGallery: (g: GalleryItem[]) => void;
  onBackToSite: () => void;
}

// Device file reader & automatic image adjuster helper
function readFileAsDataUrl(
  file: File,
  callback: (url: string, name: string, size: string) => void
) {
  // If file is an image, auto-adjust dimensions and optimize
  if (file.type.startsWith('image/')) {
    adjustAndProcessUploadedImage(file)
      .then((res) => {
        callback(res.dataUrl, res.name, res.size);
      })
      .catch(() => {
        // Fallback to standard reader if image canvas processing fails
        const reader = new FileReader();
        reader.onload = (e) => {
          const url = e.target?.result as string;
          const size =
            file.size > 1024 * 1024
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.round(file.size / 1024)} KB`;
          callback(url, file.name, size);
        };
        reader.readAsDataURL(file);
      });
  } else {
    // Non-image files (e.g. PDF downloads)
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      const size =
        file.size > 1024 * 1024
          ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.size / 1024)} KB`;
      callback(url, file.name, size);
    };
    reader.readAsDataURL(file);
  }
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  branding,
  onUpdateBranding,
  slides,
  onUpdateSlides,
  autobiography,
  onUpdateAutobiography,
  education,
  onUpdateEducation,
  experience,
  onUpdateExperience,
  blogs,
  onUpdateBlogs,
  faqs,
  onUpdateFaqs,
  usefulLinks,
  onUpdateUsefulLinks,
  downloads,
  onUpdateDownloads,
  gallery,
  onUpdateGallery,
  onBackToSite
}) => {
  const { isAdmin, login, logout } = useAuth();
  const { language } = useLanguage();

  // Login form state (empty defaults - no prefilled passwords)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab & Sync Status
  const [activeTab, setActiveTab] = useState('profile_stats');
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [firebaseStatus, setFirebaseStatus] = useState<'checking' | 'connected' | 'permission_denied' | 'offline'>('checking');
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [copiedRules, setCopiedRules] = useState(false);

  const showToast = (msg: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Test live Firebase connection on mount
  React.useEffect(() => {
    checkFirebaseConnection().then((res) => {
      if (res.connected) {
        setFirebaseStatus('connected');
      } else if (res.isPermissionDenied) {
        setFirebaseStatus('permission_denied');
      } else {
        setFirebaseStatus('offline');
      }
    });
  }, []);

  // Universal save handler that saves locally AND syncs to Firebase with explicit feedback
  const saveEntityWithGlobalSync = async (
    nodePath: string,
    storageKey: string,
    data: any,
    updater: (d: any) => void,
    moduleName: string
  ) => {
    updater(data);
    const result = await saveNodeData(nodePath, storageKey, data);
    if (result.syncedToFirebase) {
      setFirebaseStatus('connected');
      showToast(`✓ ${moduleName} saved locally and synced globally to Firebase!`, 'success');
    } else if (result.isPermissionDenied) {
      setFirebaseStatus('permission_denied');
      showToast(
        `⚠️ ${moduleName} saved locally, but Firebase Realtime Database blocked global sync (Permission Denied). Update Firebase Rules so all visitors can see this change.`,
        'warning'
      );
      setShowRulesModal(true);
    } else {
      showToast(`⚠️ ${moduleName} saved locally. Firebase sync warning: ${result.error || 'Network error'}`, 'warning');
    }
  };

  // Profile, stats and autobiography handler
  const saveProfileStatsWithGlobalSync = async (b: Branding, a: Autobiography) => {
    onUpdateBranding(b);
    onUpdateAutobiography(a);
    const resB = await saveNodeData('branding', 'dr_joshi_branding', b);
    const resA = await saveNodeData('autobiography', 'dr_joshi_autobiography', a);
    if (resB.syncedToFirebase && resA.syncedToFirebase) {
      setFirebaseStatus('connected');
      showToast('✓ Profile, stats and autobiography saved locally & synced globally to Firebase!', 'success');
    } else if (resB.isPermissionDenied || resA.isPermissionDenied) {
      setFirebaseStatus('permission_denied');
      showToast(
        '⚠️ Saved locally, but Firebase Realtime Database blocked global sync (Permission Denied). Update Firebase Rules so all visitors can see this change.',
        'warning'
      );
      setShowRulesModal(true);
    } else {
      showToast(`⚠️ Saved locally. Firebase sync warning: ${resB.error || resA.error || 'Check network'}`, 'warning');
    }
  };

  // Synchronized Branding & Logo handler (keeps Autobiography avatar in sync everywhere)
  const saveBrandingWithPhotoSync = async (newB: Branding) => {
    onUpdateBranding(newB);
    const resB = await saveNodeData('branding', 'dr_joshi_branding', newB);
    if (newB.logoUrl && newB.logoUrl !== autobiography.avatarUrl) {
      const updatedBio = { ...autobiography, avatarUrl: newB.logoUrl };
      onUpdateAutobiography(updatedBio);
      await saveNodeData('autobiography', 'dr_joshi_autobiography', updatedBio);
    }
    if (resB.syncedToFirebase) {
      setFirebaseStatus('connected');
      showToast('✓ Doctor logo & profile picture synced everywhere across the website & Firebase!', 'success');
    } else if (resB.isPermissionDenied) {
      setFirebaseStatus('permission_denied');
      showToast('⚠️ Logo saved locally, but Firebase write was denied. Update Firebase Rules.', 'warning');
      setShowRulesModal(true);
    } else {
      showToast('✓ Doctor logo & profile picture updated locally across the site.', 'success');
    }
  };

  // Synchronized Autobiography handler (keeps Branding logo in sync everywhere)
  const saveAutobiographyWithPhotoSync = async (newBio: Autobiography) => {
    onUpdateAutobiography(newBio);
    const resA = await saveNodeData('autobiography', 'dr_joshi_autobiography', newBio);
    if (newBio.avatarUrl && newBio.avatarUrl !== branding.logoUrl) {
      const updatedBranding = { ...branding, logoUrl: newBio.avatarUrl };
      onUpdateBranding(updatedBranding);
      await saveNodeData('branding', 'dr_joshi_branding', updatedBranding);
    }
    if (resA.syncedToFirebase) {
      setFirebaseStatus('connected');
      showToast('✓ Doctor portrait synced everywhere across the website & Firebase!', 'success');
    } else if (resA.isPermissionDenied) {
      setFirebaseStatus('permission_denied');
      showToast('⚠️ Portrait saved locally, but Firebase write was denied. Update Firebase Rules.', 'warning');
      setShowRulesModal(true);
    } else {
      showToast('✓ Doctor portrait updated locally across the site.', 'success');
    }
  };

  // Push all 10 modules simultaneously to Firebase
  const handleSyncAllToFirebase = async () => {
    setIsSyncingAll(true);
    const res = await pushAllContentToFirebase({
      branding,
      slides,
      autobiography,
      education,
      experience,
      blogs,
      faqs,
      usefulLinks,
      downloads,
      gallery
    });
    setIsSyncingAll(false);
    if (res.success) {
      setFirebaseStatus('connected');
      showToast(`✓ All ${res.pushedCount} content modules successfully pushed & published globally to Firebase!`, 'success');
      setShowRulesModal(false);
    } else {
      const isDenied = res.errors.some((e) => /permission/i.test(e));
      if (isDenied) {
        setFirebaseStatus('permission_denied');
        showToast('⚠️ Firebase write failed: Permission Denied. Follow the 1-click guide to publish rules in Firebase Console.', 'warning');
        setShowRulesModal(true);
      } else {
        showToast(`⚠️ Sync warning: ${res.errors[0] || 'Check network connection'}`, 'warning');
      }
    }
  };

  // Export complete site data as JSON
  const handleExportBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      branding,
      slides,
      autobiography,
      education,
      experience,
      blogs,
      faqs,
      usefulLinks,
      downloads,
      gallery
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drpremrajjoshi-site-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('✓ Complete portfolio backup exported as JSON file!', 'success');
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.branding) onUpdateBranding(json.branding);
        if (json.slides) onUpdateSlides(json.slides);
        if (json.autobiography) onUpdateAutobiography(json.autobiography);
        if (json.education) onUpdateEducation(json.education);
        if (json.experience) onUpdateExperience(json.experience);
        if (json.blogs) onUpdateBlogs(json.blogs);
        if (json.faqs) onUpdateFaqs(json.faqs);
        if (json.usefulLinks) onUpdateUsefulLinks(json.usefulLinks);
        if (json.downloads) onUpdateDownloads(json.downloads);
        if (json.gallery) onUpdateGallery(json.gallery);
        showToast('✓ Backup restored locally! Pushing globally to Firebase...', 'success');
        await handleSyncAllToFirebase();
      } catch (err: any) {
        showToast('Failed to parse backup JSON file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const recommendedRulesJson = `{
  "rules": {
    ".read": true,
    ".write": true
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(recommendedRulesJson);
    setCopiedRules(true);
    setTimeout(() => setCopiedRules(false), 3000);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    const res = await login(loginEmail, loginPass);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Authentication failed. Check credentials.');
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-neutral-200">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 font-editorial">
              Dr. Prem Raj Joshi CMS
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-mono">
              Secure Web Admin Portal (/webadminprem)
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Admin Username / Email
              </label>
              <input
                type="text"
                required
                placeholder="Enter admin username or email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter admin password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-xs">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
            >
              {isLoggingIn ? 'Verifying...' : 'Sign In to Web Admin'}
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              ← Back to Main Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  // CMS Content Management Tabs (Pure content editing, no patient inquiries!)
  const cmsTabs = [
    { id: 'active_feed', label: 'Active Live Feed', icon: Globe },
    { id: 'profile_stats', label: 'Profile, Location & Stats', icon: BarChart3 },
    { id: 'social_links', label: 'Social Media & Feed', icon: Share2 },
    { id: 'sliders', label: 'Hero Sliders', icon: Layers },
    { id: 'autobiography', label: 'Autobiography (EN/NP)', icon: User },
    { id: 'education', label: 'Education Journey', icon: GraduationCap },
    { id: 'experience', label: 'Experience Deployment', icon: Briefcase },
    { id: 'blogs', label: 'Blogs & Slugs', icon: FileText },
    { id: 'faq', label: 'FAQ Manager', icon: HelpCircle },
    { id: 'links', label: 'Useful Links', icon: Link2 },
    { id: 'downloads', label: 'Downloads (PDF Upload)', icon: Download },
    { id: 'logo_flag', label: 'Logo, Flag & YouTube', icon: Video },
    { id: 'gallery', label: 'Gallery Albums', icon: Camera }
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Top Admin Header */}
      <header className="bg-neutral-900 text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToSite}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Public Site</span>
          </button>
          <div className="h-5 w-px bg-neutral-700" />
          <div>
            <h1 className="text-sm font-bold tracking-tight">
              Dr. Prem Raj Joshi — CMS Management Portal
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono">
              Pure Content Engine · Slug: /webadminprem
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Real-time Global Sync Status Badge */}
          {firebaseStatus === 'connected' ? (
            <span className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Global Live Synced</span>
            </span>
          ) : firebaseStatus === 'permission_denied' ? (
            <button
              onClick={() => setShowRulesModal(true)}
              className="flex items-center gap-1.5 text-[11px] text-amber-300 font-mono bg-amber-950/80 hover:bg-amber-900/90 px-2.5 py-1 rounded-full border border-amber-500/50 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              <span>Permission Denied (Fix Rules)</span>
            </button>
          ) : (
            <span className="flex items-center gap-1.5 text-[11px] text-neutral-400 font-mono bg-neutral-800 px-2.5 py-1 rounded-full border border-neutral-700">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Checking RTDB...</span>
            </span>
          )}

          {/* Sync All Button */}
          <button
            onClick={handleSyncAllToFirebase}
            disabled={isSyncingAll}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Push all 10 modules simultaneously to Firebase Realtime Database"
          >
            <CloudUpload className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-bounce' : ''}`} />
            <span>{isSyncingAll ? 'Syncing All...' : 'Sync All to Live'}</span>
          </button>

          {/* Backup Export/Import */}
          <button
            onClick={handleExportBackup}
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors"
            title="Download full content backup as JSON"
          >
            <DownloadCloud className="w-4 h-4" />
          </button>

          <label
            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Restore content from backup JSON"
          >
            <FileUp className="w-4 h-4" />
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>

          <div className="h-5 w-px bg-neutral-700 hidden md:block" />

          <button
            onClick={logout}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-neutral-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Global Sync Action Required Warning Banner */}
      {firebaseStatus === 'permission_denied' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-300 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 text-amber-900 font-medium">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <strong className="font-bold">Global Sync Action Required:</strong> Firebase Realtime Database responded with <code className="bg-amber-200/70 px-1 py-0.5 rounded font-mono font-bold text-amber-950">Permission denied</code>.
              Your CMS changes are currently saved only in this browser and will not appear to visitors until Firebase security rules allow read/write.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRulesModal(true)}
              className="px-3.5 py-1.5 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded-lg text-xs transition-colors shadow-xs"
            >
              Fix Firebase Rules (1-Click Guide)
            </button>
            <button
              onClick={handleSyncAllToFirebase}
              disabled={isSyncingAll}
              className="px-3 py-1.5 bg-neutral-900 hover:bg-black text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
              <span>{isSyncingAll ? 'Testing...' : 'Test & Sync All'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Firebase Rules Configuration Modal */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-neutral-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-sm">Enable Global Firebase Updates (Rules Setup)</h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="text-neutral-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-neutral-800">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 leading-relaxed">
                <strong>Why is this needed?</strong> Your Firebase Realtime Database at <code className="font-mono text-[11px] font-bold">asia-southeast1</code> has locked security rules. Once you publish these 2 lines, every CMS update will instantly sync globally across all devices!
              </div>

              <div className="space-y-2">
                <span className="font-bold text-neutral-900 block">Step 1: Open Firebase Console Rules</span>
                <a
                  href="https://console.firebase.google.com/project/drsaap-52b17/database/drsaap-52b17-default-rtdb/rules"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-2xs"
                >
                  <span>Open Firebase Rules Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <span className="text-neutral-500 text-[11px] block">
                  (Project: <strong>drsaap-52b17</strong> · Database: <strong>drsaap-52b17-default-rtdb</strong>)
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Step 2: Replace Rules with the JSON below:</span>
                  <button
                    onClick={handleCopyRules}
                    className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold text-[11px]"
                  >
                    {copiedRules ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedRules ? 'Copied to Clipboard!' : 'Copy Rules JSON'}</span>
                  </button>
                </div>

                <pre className="bg-neutral-900 text-emerald-300 p-3 rounded-xl font-mono text-[11px] overflow-x-auto border border-neutral-800">
{recommendedRulesJson}
                </pre>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-neutral-900 block">Step 3: Click "Publish" in Firebase Console</span>
                <p className="text-neutral-600 text-[11px]">
                  Then click the green button below to test and push all 10 site modules immediately!
                </p>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-end gap-2">
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl font-semibold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={handleSyncAllToFirebase}
                  disabled={isSyncingAll}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
                  <span>{isSyncingAll ? 'Testing Connection...' : 'Test Connection & Sync All Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Admin Layout: Sidebar + Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-white border-r border-neutral-200 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-bold text-neutral-400 uppercase tracking-wider font-mono">
            Content Modules
          </div>
          {cmsTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-neutral-100">
          {toast && (
            <div
              className={`mb-6 p-4 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in ${
                toast.type === 'success'
                  ? 'bg-emerald-800 text-white'
                  : toast.type === 'warning'
                  ? 'bg-amber-600 text-white'
                  : 'bg-rose-700 text-white'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
              )}
              <span>{toast.msg}</span>
            </div>
          )}

          {/* Module 0: Active Live Feed Overview */}
          {activeTab === 'active_feed' && (
            <ActiveFeedOverview
              branding={branding}
              slides={slides}
              blogs={blogs}
              education={education}
              experience={experience}
              faqs={faqs}
              usefulLinks={usefulLinks}
              downloads={downloads}
              gallery={gallery}
              onSelectTab={(tabId) => setActiveTab(tabId)}
              onSyncAll={handleSyncAllToFirebase}
              isSyncingAll={isSyncingAll}
            />
          )}

          {/* Module 1: Profile, Location & Stats Manager */}
          {activeTab === 'profile_stats' && (
            <ProfileLocationStatsManager
              branding={branding}
              autobiography={autobiography}
              onSaveLocal={saveProfileStatsWithGlobalSync}
              onSaveLive={saveProfileStatsWithGlobalSync}
            />
          )}

          {/* Module: Social Media Redirecting Links Manager */}
          {activeTab === 'social_links' && (
            <SocialMediaLinksManager
              branding={branding}
              onSaveLocal={(b) => saveEntityWithGlobalSync('branding', 'dr_joshi_branding', b, onUpdateBranding, 'Social Media Links')}
              onSaveLive={(b) => saveEntityWithGlobalSync('branding', 'dr_joshi_branding', b, onUpdateBranding, 'Social Media Links')}
            />
          )}

          {/* Module 2: Hero Sliders */}
          {activeTab === 'sliders' && (
            <SlidersManager
              slides={slides}
              onSaveLocal={(newSlides) => saveEntityWithGlobalSync('slider_images', 'dr_joshi_slider_images', newSlides, onUpdateSlides, 'Hero Sliders')}
              onSaveLive={(newSlides) => saveEntityWithGlobalSync('slider_images', 'dr_joshi_slider_images', newSlides, onUpdateSlides, 'Hero Sliders')}
            />
          )}

          {/* Module 3: Autobiography */}
          {activeTab === 'autobiography' && (
            <AutobiographyManager
              autobiography={autobiography}
              onSaveLocal={saveAutobiographyWithPhotoSync}
              onSaveLive={saveAutobiographyWithPhotoSync}
            />
          )}

          {/* Module 4: Education Journey (Place Studied Image) */}
          {activeTab === 'education' && (
            <EducationManager
              education={education}
              onSaveLocal={(newEdu) => saveEntityWithGlobalSync('education', 'dr_joshi_education', newEdu, onUpdateEducation, 'Education Milestones')}
              onSaveLive={(newEdu) => saveEntityWithGlobalSync('education', 'dr_joshi_education', newEdu, onUpdateEducation, 'Education Milestones')}
            />
          )}

          {/* Module 5: Experience Deployment (Place Worked Image) */}
          {activeTab === 'experience' && (
            <ExperienceManager
              experience={experience}
              onSaveLocal={(newExp) => saveEntityWithGlobalSync('experience', 'dr_joshi_experience', newExp, onUpdateExperience, 'Work Experience')}
              onSaveLive={(newExp) => saveEntityWithGlobalSync('experience', 'dr_joshi_experience', newExp, onUpdateExperience, 'Work Experience')}
            />
          )}

          {/* Module 6: Blogs & Slugs */}
          {activeTab === 'blogs' && (
            <BlogsManager
              blogs={blogs}
              onSaveLocal={(newBlogs) => saveEntityWithGlobalSync('blogs', 'dr_joshi_blogs', newBlogs, onUpdateBlogs, 'Blog Articles')}
              onSaveLive={(newBlogs) => saveEntityWithGlobalSync('blogs', 'dr_joshi_blogs', newBlogs, onUpdateBlogs, 'Blog Articles')}
              onNotify={showToast}
            />
          )}

          {/* Module 7: FAQ Manager */}
          {activeTab === 'faq' && (
            <FAQManager
              faqs={faqs}
              onSaveLocal={(newFaqs) => saveEntityWithGlobalSync('faq', 'dr_joshi_faq', newFaqs, onUpdateFaqs, 'FAQs')}
              onSaveLive={(newFaqs) => saveEntityWithGlobalSync('faq', 'dr_joshi_faq', newFaqs, onUpdateFaqs, 'FAQs')}
            />
          )}

          {/* Module 8: Useful Links */}
          {activeTab === 'links' && (
            <LinksManager
              links={usefulLinks}
              onSaveLocal={(newL) => saveEntityWithGlobalSync('links', 'dr_joshi_links', newL, onUpdateUsefulLinks, 'Useful Links')}
              onSaveLive={(newL) => saveEntityWithGlobalSync('links', 'dr_joshi_links', newL, onUpdateUsefulLinks, 'Useful Links')}
            />
          )}

          {/* Module 9: Downloads (Direct PDF Upload) */}
          {activeTab === 'downloads' && (
            <DownloadsManager
              downloads={downloads}
              onSaveLocal={(newD) => saveEntityWithGlobalSync('downloads', 'dr_joshi_downloads', newD, onUpdateDownloads, 'Download Files')}
              onSaveLive={(newD) => saveEntityWithGlobalSync('downloads', 'dr_joshi_downloads', newD, onUpdateDownloads, 'Download Files')}
            />
          )}

          {/* Module 10: Logo, Flag & YouTube */}
          {activeTab === 'logo_flag' && (
            <LogoFlagManager
              branding={branding}
              onSaveLocal={saveBrandingWithPhotoSync}
              onSaveLive={saveBrandingWithPhotoSync}
            />
          )}

          {/* Module 11: Gallery */}
          {activeTab === 'gallery' && (
            <GalleryManager
              gallery={gallery}
              onSaveLocal={(newG) => saveEntityWithGlobalSync('gallery', 'dr_joshi_gallery', newG, onUpdateGallery, 'Gallery Photos')}
              onSaveLive={(newG) => saveEntityWithGlobalSync('gallery', 'dr_joshi_gallery', newG, onUpdateGallery, 'Gallery Photos')}
            />
          )}
        </main>
      </div>
    </div>
  );
};

// ==========================================
// 0. ACTIVE LIVE FEED OVERVIEW (Shows all currently active website feeds in CMS panel)
// ==========================================
const ActiveFeedOverview: React.FC<{
  branding: Branding;
  slides: HeroSlide[];
  blogs: BlogArticle[];
  education: EducationMilestone[];
  experience: ExperienceEntry[];
  faqs: FAQItem[];
  usefulLinks: UsefulLink[];
  downloads: DownloadItem[];
  gallery: GalleryItem[];
  onSelectTab: (tabId: string) => void;
  onSyncAll: () => void;
  isSyncingAll: boolean;
}> = ({
  branding,
  slides,
  blogs,
  education,
  experience,
  faqs,
  usefulLinks,
  downloads,
  gallery,
  onSelectTab,
  onSyncAll,
  isSyncingAll
}) => {
  const socialLinks = {
    facebook: branding.socialLinks?.facebook ?? 'https://facebook.com/drpremrajjoshi',
    instagram: branding.socialLinks?.instagram ?? 'https://instagram.com/drpremrajjoshi',
    tiktok: branding.socialLinks?.tiktok ?? 'https://tiktok.com/@drpremrajjoshi',
    twitter: branding.socialLinks?.twitter ?? 'https://twitter.com/drpremrajjoshi',
    youtube: branding.socialLinks?.youtube ?? 'https://youtube.com/@drpremrajjoshi',
    whatsapp: branding.socialLinks?.whatsapp ?? 'https://wa.me/9779848721200'
  };

  const activeSocialList = Object.entries(socialLinks).filter(([, url]) => Boolean(url && url.trim()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xl font-bold text-neutral-900 font-editorial">
              Active Website Live Feed Overview
            </h2>
          </div>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time snapshot of all active content feeds, published medical blogs, social channels, and media currently live on your public portal.
          </p>
        </div>

        <button
          onClick={onSyncAll}
          disabled={isSyncingAll}
          className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
        >
          <CloudUpload className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-bounce' : ''}`} />
          <span>{isSyncingAll ? 'Syncing Active Feeds...' : 'Sync All Active Feeds to Firebase'}</span>
        </button>
      </div>

      {/* Summary Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          onClick={() => onSelectTab('blogs')}
          className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs hover:border-emerald-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>ACTIVE BLOGS</span>
            <FileText className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{blogs.length}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Manage Articles →</span>
        </div>

        <div
          onClick={() => onSelectTab('social_links')}
          className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs hover:border-emerald-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>SOCIAL FEEDS</span>
            <Share2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{activeSocialList.length}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Manage Channels →</span>
        </div>

        <div
          onClick={() => onSelectTab('gallery')}
          className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs hover:border-emerald-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>GALLERY MEDIA</span>
            <Camera className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{gallery.length}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Manage Photos →</span>
        </div>

        <div
          onClick={() => onSelectTab('sliders')}
          className="bg-white border border-neutral-200 rounded-2xl p-4 shadow-2xs hover:border-emerald-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-xs text-neutral-500 font-mono">
            <span>HERO SLIDERS</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-neutral-900 mt-1">{slides.length}</div>
          <span className="text-[11px] text-emerald-700 font-semibold">Manage Sliders →</span>
        </div>
      </div>

      {/* Active Blogs Feed Section */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-bold text-neutral-900">
              Active Health Blogs Feed ({blogs.length} Published)
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('blogs')}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Edit / Add Blog</span>
            <span>→</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {blogs.map((b) => {
            const cover = b.cover_image || b.coverImage || '/assets/images/hero_ayurveda_clinic_1791392890876.jpg';
            return (
              <div
                key={b.id}
                className="border border-neutral-200 rounded-xl overflow-hidden bg-neutral-50 flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-16/9 bg-neutral-900 relative overflow-hidden">
                    <img
                      src={cover}
                      alt={b.titleEn}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/hero_ayurveda_clinic_1791392890876.jpg';
                      }}
                    />
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-800/90 text-white text-[10px] font-bold rounded-md">
                      {b.categoryEn}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-1">
                    <div className="text-[10px] font-mono text-neutral-400">
                      {b.publishDate} · {b.readTime}
                    </div>
                    <h4 className="font-bold text-xs text-neutral-900 line-clamp-2">{b.titleEn}</h4>
                    <p className="text-[11px] text-neutral-600 font-nepali line-clamp-1">{b.titleNp}</p>
                  </div>
                </div>
                <div className="px-3.5 py-2 bg-white border-t border-neutral-200 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-emerald-800 truncate">/blog/{b.slug}</span>
                  <button
                    onClick={() => onSelectTab('blogs')}
                    className="font-bold text-neutral-700 hover:text-emerald-700 shrink-0"
                  >
                    Edit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Social Media & Featured YouTube Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-neutral-900">
                Active Social Media Channels ({activeSocialList.length} Live)
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('social_links')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Configure Links →
            </button>
          </div>

          <div className="space-y-2.5">
            {activeSocialList.map(([platform, url]) => (
              <div
                key={platform}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 text-xs"
              >
                <div className="min-w-0 pr-3">
                  <span className="font-bold uppercase text-neutral-800 block text-[11px] font-mono">
                    {platform}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-mono truncate block">{url}</span>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 bg-white border border-neutral-300 hover:border-emerald-500 rounded-lg text-[11px] font-semibold text-neutral-700 flex items-center gap-1 shrink-0"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Active YouTube Video & Clinical Feed Summary */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-bold text-neutral-900">
                Active Featured YouTube Lecture & Portal Feeds
              </h3>
            </div>
            <button
              onClick={() => onSelectTab('logo_flag')}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Change Video →
            </button>
          </div>

          {branding.youtubeEmbedUrl ? (
            <div className="aspect-video rounded-xl overflow-hidden bg-black border border-neutral-200">
              <iframe
                src={branding.youtubeEmbedUrl}
                title="Active Featured YouTube Feed"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="p-4 bg-neutral-50 rounded-xl border text-xs text-neutral-500">
              No featured YouTube embed URL configured.
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
            <div
              onClick={() => onSelectTab('education')}
              className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:border-emerald-500"
            >
              <div className="text-base font-black text-neutral-900">{education.length}</div>
              <div className="text-[10px] font-semibold text-neutral-500">Education Items</div>
            </div>
            <div
              onClick={() => onSelectTab('experience')}
              className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:border-emerald-500"
            >
              <div className="text-base font-black text-neutral-900">{experience.length}</div>
              <div className="text-[10px] font-semibold text-neutral-500">Work Entries</div>
            </div>
            <div
              onClick={() => onSelectTab('faq')}
              className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:border-emerald-500"
            >
              <div className="text-base font-black text-neutral-900">{faqs.length}</div>
              <div className="text-[10px] font-semibold text-neutral-500">Active FAQs</div>
            </div>
            <div
              onClick={() => onSelectTab('downloads')}
              className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:border-emerald-500"
            >
              <div className="text-base font-black text-neutral-900">
                {downloads.length + usefulLinks.length}
              </div>
              <div className="text-[10px] font-semibold text-neutral-500">PDFs & Links</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1. PROFILE, LOCATION & STATS MANAGER
// ==========================================
const ProfileLocationStatsManager: React.FC<{
  branding: Branding;
  autobiography: Autobiography;
  onSaveLocal: (b: Branding, a: Autobiography) => void;
  onSaveLive: (b: Branding, a: Autobiography) => void;
}> = ({ branding, autobiography, onSaveLocal, onSaveLive }) => {
  const [bData, setBData] = useState<Branding>(branding);
  const [aData, setAData] = useState<Autobiography>(autobiography);

  React.useEffect(() => {
    setBData(branding);
    setAData(autobiography);
  }, [branding, autobiography]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Doctor Profile, Locations & Stats
          </h2>
          <p className="text-xs text-neutral-500">
            Manage contact details, current & permanent addresses, clinical metrics, and section titles.
          </p>
        </div>

        {/* Dual Save Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveLocal(bData, aData)}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => onSaveLive(bData, aData)}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Global Live Push (Firebase)</span>
          </button>
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-6">
        {/* Contact Info */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
            Contact & Registration Info
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Doctor Phone / WhatsApp</label>
              <input
                type="text"
                value={bData.phone}
                onChange={(e) => setBData({ ...bData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Official Email</label>
              <input
                type="email"
                value={bData.email}
                onChange={(e) => setBData({ ...bData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">NMC Registration</label>
              <input
                type="text"
                value={bData.nmcNumber}
                onChange={(e) => setBData({ ...bData, nmcNumber: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
              />
            </div>
          </div>
        </div>

        {/* Current & Permanent Locations */}
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
            Practice Locations (Current & Permanent)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Current Clinic Location (English)</label>
              <input
                type="text"
                value={bData.currentLocation?.en || ''}
                onChange={(e) => setBData({
                  ...bData,
                  currentLocation: { ...(bData.currentLocation || { en: '', np: '' }), en: e.target.value }
                })}
                placeholder="e.g. Maharajgunj Medical Zone, Kathmandu, Nepal"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Current Clinic Location (Nepali)</label>
              <input
                type="text"
                value={bData.currentLocation?.np || ''}
                onChange={(e) => setBData({
                  ...bData,
                  currentLocation: { ...(bData.currentLocation || { en: '', np: '' }), np: e.target.value }
                })}
                placeholder="जस्तै: महाराजगञ्ज, काठमाडौं, नेपाल"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-nepali"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Permanent Address (English)</label>
              <input
                type="text"
                value={bData.permanentAddress?.en || ''}
                onChange={(e) => setBData({
                  ...bData,
                  permanentAddress: { ...(bData.permanentAddress || { en: '', np: '' }), en: e.target.value }
                })}
                placeholder="e.g. Dhangadhi Sub-Metropolitan, Kailali, Nepal"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Permanent Address (Nepali)</label>
              <input
                type="text"
                value={bData.permanentAddress?.np || ''}
                onChange={(e) => setBData({
                  ...bData,
                  permanentAddress: { ...(bData.permanentAddress || { en: '', np: '' }), np: e.target.value }
                })}
                placeholder="जस्तै: धनगढी उपमहानगरपालिका, कैलाली, नेपाल"
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-nepali"
              />
            </div>
          </div>
        </div>

        {/* 3 Clinical Stats Management */}
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
            Clinical Trust Metrics / Stats
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            {/* Stat 1 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-800">Stat #1</label>
              <input
                type="text"
                value={bData.stats?.stat1Value ?? ''}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat1Value: e.target.value }
                })}
                placeholder="Value (e.g. 5.5+)"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-mono font-bold"
              />
              <input
                type="text"
                value={bData.stats?.stat1LabelEn ?? ''}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat1LabelEn: e.target.value }
                })}
                placeholder="Label EN"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white"
              />
              <input
                type="text"
                value={bData.stats?.stat1LabelNp ?? ''}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat1LabelNp: e.target.value }
                })}
                placeholder="Label NP"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-nepali"
              />
            </div>

            {/* Stat 2 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-800">Stat #2</label>
              <input
                type="text"
                value={bData.stats?.stat2Value ?? ''}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat2Value: e.target.value }
                })}
                placeholder="Value (e.g. 4,500+)"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-mono font-bold"
              />
              <input
                type="text"
                value={bData.stats?.stat2LabelEn ?? ''}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat2LabelEn: e.target.value }
                })}
                placeholder="Label EN"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white"
              />
              <input
                type="text"
                value={bData.stats?.stat2LabelNp ?? ''}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat2LabelNp: e.target.value }
                })}
                placeholder="Label NP"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-nepali"
              />
            </div>

            {/* Stat 3 */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-neutral-800">Stat #3</label>
              <input
                type="text"
                value={bData.stats?.stat3Value ?? ''}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat3Value: e.target.value }
                })}
                placeholder="Value (e.g. 18+)"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-mono font-bold"
              />
              <input
                type="text"
                value={bData.stats?.stat3LabelEn ?? ''}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat3LabelEn: e.target.value }
                })}
                placeholder="Label EN"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white"
              />
              <input
                type="text"
                value={bData.stats?.stat3LabelNp ?? ''}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat3LabelNp: e.target.value }
                })}
                placeholder="Label NP"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-nepali"
              />
            </div>
          </div>
        </div>

        {/* Section Kicker */}
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
            Profile Section Kicker (Frontend Header Label)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Kicker Label (English)</label>
              <input
                type="text"
                value={aData.kickerEn ?? ''}
                onChange={(e) => setAData({ ...aData, kickerEn: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Kicker Label (Nepali Unicode)</label>
              <input
                type="text"
                value={aData.kickerNp ?? ''}
                onChange={(e) => setAData({ ...aData, kickerNp: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-nepali"
              />
            </div>
          </div>
        </div>

        {/* Portal Tagline / About Description (Rich Text) */}
        <div className="space-y-3 pt-4 border-t border-neutral-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
            Portal Tagline & About Description (Rich Text)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UniversalRichTextEditor
              label="Portal Tagline / Bio Intro (English)"
              value={bData.tagline?.en || ''}
              onChange={(val) =>
                setBData({
                  ...bData,
                  tagline: { ...(bData.tagline || { en: '', np: '' }), en: val }
                })
              }
              minHeight={130}
              placeholder="Write English portal tagline or summary..."
            />
            <UniversalRichTextEditor
              label="Portal Tagline / Bio Intro (Nepali)"
              value={bData.tagline?.np || ''}
              onChange={(val) =>
                setBData({
                  ...bData,
                  tagline: { ...(bData.tagline || { en: '', np: '' }), np: val }
                })
              }
              isNepali={true}
              minHeight={130}
              placeholder="नेपालीमा पोर्टल परिचय लेख्नुहोस्..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1.5 SOCIAL MEDIA REDIRECTING LINKS & ACTIVE FEED MANAGER
// ==========================================
const DEFAULT_SOCIAL_CHANNELS: SocialChannelItem[] = [
  {
    id: 'facebook',
    platform: 'facebook',
    name: 'Facebook Page',
    handle: '@drpremrajjoshi',
    url: 'https://facebook.com/drpremrajjoshi',
    descriptionEn: 'Daily health columns, live Q&A, and community medical advisories.',
    descriptionNp: 'दैनिक स्वास्थ्य सल्लाह, लाइभ प्रश्नोत्तर तथा जनचेतनामूलक पोस्टहरू।',
    active: true
  },
  {
    id: 'youtube',
    platform: 'youtube',
    name: 'YouTube Channel',
    handle: 'Dr. Prem Raj Joshi',
    url: 'https://youtube.com/@drpremrajjoshi',
    descriptionEn: 'In-depth video lectures on Dinacharya, herbal medicines, and disease care.',
    descriptionNp: 'रोग निदान, जडीबुटीको पहिचान र घरेलु उपचार सम्बन्धी भिडियोहरू।',
    active: true
  },
  {
    id: 'instagram',
    platform: 'instagram',
    name: 'Instagram',
    handle: '@drpremrajjoshi',
    url: 'https://instagram.com/drpremrajjoshi',
    descriptionEn: 'Visual infographics on Ayurvedic diet, medicinal herbs, and lifestyle.',
    descriptionNp: 'आयुर्वेदिक खानपान र जडीबुटी सम्बन्धी जानकारीमूलक फोटो र रिल्स।',
    active: true
  },
  {
    id: 'tiktok',
    platform: 'tiktok',
    name: 'TikTok',
    handle: '@drpremrajjoshi',
    url: 'https://tiktok.com/@drpremrajjoshi',
    descriptionEn: 'Short 60-second health tips, myths vs. facts in Nepali language.',
    descriptionNp: 'एक मिनेटका छरिता स्वास्थ्य टिप्स र भ्रम निवारण भिडियोहरू।',
    active: true
  },
  {
    id: 'twitter',
    platform: 'twitter',
    name: 'X (Twitter)',
    handle: '@drpremrajjoshi',
    url: 'https://twitter.com/drpremrajjoshi',
    descriptionEn: 'Public health opinions, medical policy reflections, and research tweets.',
    descriptionNp: 'जनस्वास्थ्य, चिकित्सा नीति र अनुसन्धान सम्बन्धी संक्षिप्त विचारहरू।',
    active: true
  },
  {
    id: 'whatsapp',
    platform: 'whatsapp',
    name: 'Direct WhatsApp',
    handle: '+977-9848721200',
    url: 'https://wa.me/9779848721200',
    descriptionEn: 'Direct clinic desk for appointment verification and prescription coordination.',
    descriptionNp: 'अपोइन्टमेन्ट तथा औषधि डेलिभरी समन्वयका लागि प्रत्यक्ष च्याट।',
    active: true
  }
];

const SocialMediaLinksManager: React.FC<{
  branding: Branding;
  onSaveLocal: (b: Branding) => void;
  onSaveLive: (b: Branding) => void;
}> = ({ branding, onSaveLocal, onSaveLive }) => {
  const [bData, setBData] = useState<Branding>(branding);

  React.useEffect(() => {
    setBData(branding);
  }, [branding]);

  const socialLinks = {
    facebook: bData.socialLinks ? (bData.socialLinks.facebook ?? '') : 'https://facebook.com/drpremrajjoshi',
    instagram: bData.socialLinks ? (bData.socialLinks.instagram ?? '') : 'https://instagram.com/drpremrajjoshi',
    tiktok: bData.socialLinks ? (bData.socialLinks.tiktok ?? '') : 'https://tiktok.com/@drpremrajjoshi',
    twitter: bData.socialLinks ? (bData.socialLinks.twitter ?? '') : 'https://twitter.com/drpremrajjoshi',
    youtube: bData.socialLinks ? (bData.socialLinks.youtube ?? '') : 'https://youtube.com/@drpremrajjoshi',
    whatsapp: bData.socialLinks ? (bData.socialLinks.whatsapp ?? '') : 'https://wa.me/9779848721200'
  };

  const channels: SocialChannelItem[] =
    bData.socialChannels && bData.socialChannels.length > 0
      ? bData.socialChannels
      : DEFAULT_SOCIAL_CHANNELS.map((c) => ({
          ...c,
          url: (socialLinks as Record<string, string>)[c.platform] ?? c.url,
          active: Boolean(((socialLinks as Record<string, string>)[c.platform] ?? c.url).trim())
        }));

  const updateLink = (key: keyof typeof socialLinks, value: string) => {
    const nextLinks = {
      ...socialLinks,
      [key]: value
    };
    const nextChannels = channels.map((c) =>
      c.platform === key ? { ...c, url: value, active: Boolean(value.trim()) } : c
    );
    setBData({
      ...bData,
      socialLinks: nextLinks,
      socialChannels: nextChannels
    });
  };

  const updateChannelItem = (id: string, patch: Partial<SocialChannelItem>) => {
    const nextChannels = channels.map((c) => (c.id === id ? { ...c, ...patch } : c));
    const nextLinks = { ...socialLinks };
    for (const ch of nextChannels) {
      if (ch.platform in nextLinks) {
        (nextLinks as any)[ch.platform] = ch.active ? ch.url : '';
      }
    }
    setBData({
      ...bData,
      socialLinks: nextLinks,
      socialChannels: nextChannels
    });
  };

  const activeFeedChannels = channels.filter((c) => c.active && Boolean(c.url && c.url.trim()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Social Media Handles & Active Feed Cards
          </h2>
          <p className="text-xs text-neutral-500">
            Edit destination URLs, handles, and rich-text descriptions for the active social media feed shown on the public website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveLocal(bData)}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => onSaveLive(bData)}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Global Live Push (Firebase)</span>
          </button>
        </div>
      </div>

      {/* Live Preview of Active Feed in CMS Panel */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-800 font-mono">
              Active Social Feed Preview ({activeFeedChannels.length} Active on Public Website)
            </h3>
          </div>
          <span className="text-[11px] text-neutral-500 font-mono">
            Section: #socialmedia
          </span>
        </div>

        {activeFeedChannels.length === 0 ? (
          <div className="p-4 bg-neutral-50 rounded-xl text-xs text-neutral-500 text-center">
            No active social channels enabled. Enter a URL or toggle a channel active below.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeFeedChannels.map((chan) => (
              <div
                key={chan.id}
                className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold font-mono uppercase">
                      Active Feed
                    </span>
                    <a
                      href={chan.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neutral-400 hover:text-emerald-700"
                      title="Test live link"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900">{chan.name}</h4>
                  <span className="text-xs font-mono text-emerald-700 font-medium block mb-1.5">
                    {chan.handle}
                  </span>
                  <div
                    className="text-xs text-neutral-600 line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: chan.descriptionEn }}
                  />
                </div>
                <div className="pt-2 border-t border-neutral-200/80 flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span className="truncate max-w-[180px]">{chan.url}</span>
                  <span className="text-emerald-700 font-bold">LIVE</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick URL Editor */}
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
          Quick Redirect URLs (Header & Footer Icons)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-blue-700 mb-1">Facebook Page URL</label>
            <input
              type="url"
              value={socialLinks.facebook}
              onChange={(e) => updateLink('facebook', e.target.value)}
              placeholder="https://facebook.com/yourpage"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-pink-700 mb-1">Instagram Profile URL</label>
            <input
              type="url"
              value={socialLinks.instagram}
              onChange={(e) => updateLink('instagram', e.target.value)}
              placeholder="https://instagram.com/yourhandle"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-900 mb-1">TikTok Channel URL</label>
            <input
              type="url"
              value={socialLinks.tiktok}
              onChange={(e) => updateLink('tiktok', e.target.value)}
              placeholder="https://tiktok.com/@yourhandle"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-sky-600 mb-1">X (Twitter) Profile URL</label>
            <input
              type="url"
              value={socialLinks.twitter}
              onChange={(e) => updateLink('twitter', e.target.value)}
              placeholder="https://twitter.com/yourhandle"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-red-600 mb-1">YouTube Channel URL</label>
            <input
              type="url"
              value={socialLinks.youtube}
              onChange={(e) => updateLink('youtube', e.target.value)}
              placeholder="https://youtube.com/@yourchannel"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-emerald-700 mb-1">Direct WhatsApp Chat URL</label>
            <input
              type="url"
              value={socialLinks.whatsapp}
              onChange={(e) => updateLink('whatsapp', e.target.value)}
              placeholder="https://wa.me/9779848721200"
              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-mono"
            />
          </div>
        </div>

        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-mono">
          ✓ Clean Single-Click Redirect: Links update everywhere instantly on both Header & Social Handles section.
        </div>
      </div>

      {/* Detailed Active Feed Card Customization (Handles & Bilingual Rich Text Descriptions) */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700 font-mono">
          Customize Individual Social Feed Cards (Handle, Visibility & Descriptions)
        </h3>
        {channels.map((chan) => (
          <div
            key={chan.id}
            className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={chan.active}
                  onChange={(e) => updateChannelItem(chan.id, { active: e.target.checked })}
                  className="w-4 h-4 accent-emerald-700 rounded cursor-pointer"
                />
                <span className="font-bold text-sm text-neutral-900">{chan.name}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    chan.active ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200 text-neutral-600'
                  }`}
                >
                  {chan.active ? 'ACTIVE ON SITE' : 'HIDDEN'}
                </span>
              </div>
              <a
                href={chan.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-mono"
              >
                <span>Test Link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Channel Title
                </label>
                <input
                  type="text"
                  value={chan.name}
                  onChange={(e) => updateChannelItem(chan.id, { name: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Display Handle (e.g. @drpremrajjoshi)
                </label>
                <input
                  type="text"
                  value={chan.handle}
                  onChange={(e) => updateChannelItem(chan.id, { handle: e.target.value })}
                  className="w-full p-2 text-xs border rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                  Destination URL
                </label>
                <input
                  type="url"
                  value={chan.url}
                  onChange={(e) =>
                    updateChannelItem(chan.id, {
                      url: e.target.value,
                      active: Boolean(e.target.value.trim())
                    })
                  }
                  className="w-full p-2 text-xs border rounded-lg font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UniversalRichTextEditor
                label="Feed Card Description (English)"
                value={chan.descriptionEn}
                onChange={(val) => updateChannelItem(chan.id, { descriptionEn: val })}
                minHeight={95}
                allowImages={false}
                allowTables={false}
              />
              <UniversalRichTextEditor
                label="Feed Card Description (Nepali Unicode)"
                value={chan.descriptionNp}
                onChange={(val) => updateChannelItem(chan.id, { descriptionNp: val })}
                isNepali={true}
                minHeight={95}
                allowImages={false}
                allowTables={false}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 2. HERO SLIDERS (With Direct Image Upload)
// ==========================================
const SlidersManager: React.FC<{
  slides: HeroSlide[];
  onSaveLocal: (s: HeroSlide[]) => void;
  onSaveLive: (s: HeroSlide[]) => void;
}> = ({ slides, onSaveLocal, onSaveLive }) => {
  const [items, setItems] = useState<HeroSlide[]>(slides);

  React.useEffect(() => {
    setItems(slides);
  }, [slides]);

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      imageUrl: '/src/assets/images/hero_ayurveda_clinic_1791392890876.jpg',
      titleEn: 'New Hero Slide Title',
      titleNp: 'नयाँ मुख्य शीर्षक',
      subtitleEn: 'Subtitle in English',
      subtitleNp: 'नेपाली उपशीर्षक',
      ctaTextEn: 'Book Appointment',
      ctaTextNp: 'अपोइन्टमेन्ट लिनुहोस्',
      ctaLink: '#appointment',
      order: items.length + 1
    };
    setItems([...items, newSlide]);
  };

  const handleUploadImage = (id: string, file: File) => {
    readFileAsDataUrl(file, (dataUrl) => {
      setItems(items.map((s) => (s.id === id ? { ...s, imageUrl: dataUrl } : s)));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Hero Carousel Sliders
          </h2>
          <p className="text-xs text-neutral-500">
            Upload custom background images directly from your device, edit bilingual overlays, and adjust CTAs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSlide}
            className="px-3.5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Slide</span>
          </button>
          <button
            onClick={() => onSaveLocal(items)}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => onSaveLive(items)}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Global Live Push</span>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {items.map((slide, idx) => (
          <div key={slide.id} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-mono font-bold text-emerald-800">
                Slide #{idx + 1}
              </span>
              <button
                onClick={() => setItems(items.filter((s) => s.id !== slide.id))}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Headline (English)</label>
                <input
                  type="text"
                  value={slide.titleEn}
                  onChange={(e) => setItems(items.map((s) => s.id === slide.id ? { ...s, titleEn: e.target.value } : s))}
                  className="w-full px-3 py-2 text-xs border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Headline (Nepali)</label>
                <input
                  type="text"
                  value={slide.titleNp}
                  onChange={(e) => setItems(items.map((s) => s.id === slide.id ? { ...s, titleNp: e.target.value } : s))}
                  className="w-full px-3 py-2 text-xs border rounded-lg font-nepali"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Subtitle (English)</label>
                <textarea
                  rows={2}
                  value={slide.subtitleEn}
                  onChange={(e) => setItems(items.map((s) => s.id === slide.id ? { ...s, subtitleEn: e.target.value } : s))}
                  className="w-full p-2 text-xs border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Subtitle (Nepali)</label>
                <textarea
                  rows={2}
                  value={slide.subtitleNp}
                  onChange={(e) => setItems(items.map((s) => s.id === slide.id ? { ...s, subtitleNp: e.target.value } : s))}
                  className="w-full p-2 text-xs border rounded-lg font-nepali"
                />
              </div>

              {/* Direct Image Upload from Device */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-xs font-semibold text-neutral-700">Slide Image (Upload from Device or URL)</label>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="w-24 h-16 rounded-lg overflow-hidden bg-neutral-100 border shrink-0">
                    <img src={slide.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  </div>
                  <input
                    type="text"
                    value={slide.imageUrl}
                    onChange={(e) => setItems(items.map((s) => s.id === slide.id ? { ...s, imageUrl: e.target.value } : s))}
                    className="flex-1 px-3 py-2 text-xs border rounded-lg font-mono"
                    placeholder="Image URL or upload file below..."
                  />
                  <label className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Device Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadImage(slide.id, file);
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 3. AUTOBIOGRAPHY MANAGER (With Avatar Upload)
// ==========================================
const AutobiographyManager: React.FC<{
  autobiography: Autobiography;
  onSaveLocal: (a: Autobiography) => void;
  onSaveLive: (a: Autobiography) => void;
}> = ({ autobiography, onSaveLocal, onSaveLive }) => {
  const [data, setData] = useState<Autobiography>(autobiography);

  React.useEffect(() => {
    setData(autobiography);
  }, [autobiography]);

  const handleAvatarUpload = (file: File) => {
    readFileAsDataUrl(file, (dataUrl) => {
      setData({ ...data, avatarUrl: dataUrl });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Doctor Autobiography & Full Bio Prose
          </h2>
          <p className="text-xs text-neutral-500">
            Upload doctor portrait, manage English/Nepali biographical prose and medical philosophy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onSaveLocal(data)}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl"
          >
            Save Draft
          </button>
          <button
            onClick={() => onSaveLive(data)}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Global Live Push
          </button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-5">
        {/* Profile Picture Upload */}
        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 shrink-0">
            <img src={data.avatarUrl} alt="Dr. Joshi" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-bold text-neutral-800 block">Doctor Profile Portrait</span>
            <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 cursor-pointer hover:bg-neutral-100">
              <Upload className="w-3.5 h-3.5 text-emerald-700" />
              <span>Upload New Photo from Device</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleAvatarUpload(f);
                }}
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <UniversalRichTextEditor
              label="Brief Summary (English)"
              value={data.summaryEn}
              onChange={(val) => setData({ ...data, summaryEn: val })}
              minHeight={150}
              draftKey="autobiography_summary_en"
              placeholder="Write brief biography summary in English..."
            />
          </div>

          <div>
            <UniversalRichTextEditor
              label="Brief Summary (Nepali Unicode)"
              value={data.summaryNp}
              onChange={(val) => setData({ ...data, summaryNp: val })}
              isNepali={true}
              minHeight={150}
              draftKey="autobiography_summary_np"
              placeholder="संक्षिप्त जीवनी नेपालीमा लेख्नुहोस्..."
            />
          </div>

          <div>
            <UniversalRichTextEditor
              label="Medical Philosophy (English)"
              value={data.philosophyEn || ''}
              onChange={(val) => setData({ ...data, philosophyEn: val })}
              minHeight={130}
              draftKey="autobiography_philosophy_en"
              placeholder="Medical philosophy quote in English..."
            />
          </div>

          <div>
            <UniversalRichTextEditor
              label="Medical Philosophy (Nepali Unicode)"
              value={data.philosophyNp || ''}
              onChange={(val) => setData({ ...data, philosophyNp: val })}
              isNepali={true}
              minHeight={130}
              draftKey="autobiography_philosophy_np"
              placeholder="चिकित्सा दर्शन नेपालीमा..."
            />
          </div>

          <div className="md:col-span-2">
            <UniversalRichTextEditor
              label="Full Autobiography Narrative (English)"
              value={data.fullBioEn}
              onChange={(val) => setData({ ...data, fullBioEn: val })}
              minHeight={260}
              draftKey="autobiography_full_en"
              placeholder="Write full autobiography narrative in English..."
            />
          </div>

          <div className="md:col-span-2">
            <UniversalRichTextEditor
              label="Full Autobiography Narrative (Nepali Unicode)"
              value={data.fullBioNp}
              onChange={(val) => setData({ ...data, fullBioNp: val })}
              isNepali={true}
              minHeight={260}
              draftKey="autobiography_full_np"
              placeholder="पूर्ण आत्मकथा नेपालीमा लेख्नुहोस्..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. EDUCATION MANAGER (With Place Studied Image Upload)
// ==========================================
const EducationManager: React.FC<{
  education: EducationMilestone[];
  onSaveLocal: (e: EducationMilestone[]) => void;
  onSaveLive: (e: EducationMilestone[]) => void;
}> = ({ education, onSaveLocal, onSaveLive }) => {
  const [items, setItems] = useState<EducationMilestone[]>(education);

  React.useEffect(() => {
    setItems(education);
  }, [education]);

  const handleAdd = () => {
    const newM: EducationMilestone = {
      id: `edu-${Date.now()}`,
      slug: `milestone-${Date.now().toString(36)}`,
      degreeEn: 'Degree Name',
      degreeNp: 'उपाधि',
      institutionEn: 'Institution Name',
      institutionNp: 'शिक्षण संस्था',
      year: '2022 - 2026',
      descriptionEn: 'Academic details.',
      descriptionNp: 'विवरण।'
    };
    setItems([newM, ...items]);
  };

  const handleUploadImage = (id: string, file: File) => {
    readFileAsDataUrl(file, (dataUrl) => {
      setItems(items.map((i) => (i.id === id ? { ...i, imageUrl: dataUrl } : i)));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Education Journey & Academic Places
          </h2>
          <p className="text-xs text-neutral-500">
            Add degrees, institutions, and upload photos of campus buildings where you studied.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="px-3.5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Degree</span>
          </button>
          <button
            onClick={() => onSaveLocal(items)}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl"
          >
            Save Draft
          </button>
          <button
            onClick={() => onSaveLive(items)}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Global Live Push
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-mono font-bold text-emerald-800">
                Slug: /journey/{item.slug}
              </span>
              <button
                onClick={() => setItems(items.filter((x) => x.id !== item.id))}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Degree (EN)</label>
                <input
                  type="text"
                  value={item.degreeEn}
                  onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, degreeEn: e.target.value } : x))}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Institution (EN)</label>
                <input
                  type="text"
                  value={item.institutionEn}
                  onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, institutionEn: e.target.value } : x))}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Year Period</label>
                <input
                  type="text"
                  value={item.year}
                  onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, year: e.target.value } : x))}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg font-mono"
                />
              </div>

              {/* Direct Image Upload for Institution / Campus Studied */}
              <div className="sm:col-span-3 flex flex-col sm:flex-row items-center gap-3 bg-neutral-50 p-3 rounded-xl border">
                {item.imageUrl && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-white border shrink-0">
                    <img src={item.imageUrl} alt="campus" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-neutral-700 block">Photo of University / Campus Studied:</span>
                  <span className="text-[10px] text-neutral-400 font-mono truncate block">{item.imageUrl || 'No photo uploaded'}</span>
                </div>
                <label className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Upload Campus Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadImage(item.id, f);
                    }}
                  />
                </label>
              </div>

              <div className="sm:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <UniversalRichTextEditor
                  label="Academic Description & Details (English)"
                  value={item.descriptionEn}
                  onChange={(val) =>
                    setItems(items.map((x) => (x.id === item.id ? { ...x, descriptionEn: val } : x)))
                  }
                  minHeight={140}
                  placeholder="Describe academic curriculum, rotations, and achievements..."
                />
                <UniversalRichTextEditor
                  label="Academic Description & Details (Nepali Unicode)"
                  value={item.descriptionNp}
                  onChange={(val) =>
                    setItems(items.map((x) => (x.id === item.id ? { ...x, descriptionNp: val } : x)))
                  }
                  isNepali={true}
                  minHeight={140}
                  placeholder="शैक्षिक विवरण नेपालीमा..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 5. EXPERIENCE MANAGER (With Place Worked Image Upload)
// ==========================================
const ExperienceManager: React.FC<{
  experience: ExperienceEntry[];
  onSaveLocal: (e: ExperienceEntry[]) => void;
  onSaveLive: (e: ExperienceEntry[]) => void;
}> = ({ experience, onSaveLocal, onSaveLive }) => {
  const [items, setItems] = useState<ExperienceEntry[]>(experience);

  React.useEffect(() => {
    setItems(experience);
  }, [experience]);

  const handleAdd = () => {
    const newE: ExperienceEntry = {
      id: `exp-${Date.now()}`,
      slug: `experience-${Date.now().toString(36)}`,
      roleEn: 'Clinical Role',
      roleNp: 'भूमिका',
      organizationEn: 'Hospital / Clinic',
      organizationNp: 'अस्पताल',
      period: '2023 - Present',
      locationEn: 'Kathmandu, Nepal',
      locationNp: 'काठमाडौं, नेपाल',
      descriptionEn: 'Clinical duties.',
      descriptionNp: 'विवरण।'
    };
    setItems([newE, ...items]);
  };

  const handleUploadImage = (id: string, file: File) => {
    readFileAsDataUrl(file, (dataUrl) => {
      setItems(items.map((i) => (i.id === id ? { ...i, imageUrl: dataUrl } : i)));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Work Experience & Hospital Practice Places
          </h2>
          <p className="text-xs text-neutral-500">
            Add clinical positions and upload photos of clinics or hospitals where you worked.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="px-3.5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience</span>
          </button>
          <button
            onClick={() => onSaveLocal(items)}
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl"
          >
            Save Draft
          </button>
          <button
            onClick={() => onSaveLive(items)}
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Global Live Push
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-mono font-bold text-emerald-800">
                Slug: /experience/{item.slug}
              </span>
              <button
                onClick={() => setItems(items.filter((x) => x.id !== item.id))}
                className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Role (EN)</label>
                <input
                  type="text"
                  value={item.roleEn}
                  onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, roleEn: e.target.value } : x))}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Organization (EN)</label>
                <input
                  type="text"
                  value={item.organizationEn}
                  onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, organizationEn: e.target.value } : x))}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Period & Location</label>
                <input
                  type="text"
                  value={item.period}
                  onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, period: e.target.value } : x))}
                  className="w-full px-2.5 py-1.5 text-xs border rounded-lg font-mono"
                />
              </div>

              {/* Direct Image Upload for Hospital / Clinic Worked */}
              <div className="sm:col-span-3 flex flex-col sm:flex-row items-center gap-3 bg-neutral-50 p-3 rounded-xl border">
                {item.imageUrl && (
                  <div className="w-16 h-12 rounded-lg overflow-hidden bg-white border shrink-0">
                    <img src={item.imageUrl} alt="workplace" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 text-xs">
                  <span className="font-semibold text-neutral-700 block">Photo of Hospital / Clinic Where You Worked:</span>
                  <span className="text-[10px] text-neutral-400 font-mono truncate block">{item.imageUrl || 'No photo uploaded'}</span>
                </div>
                <label className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Upload Clinic Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadImage(item.id, f);
                    }}
                  />
                </label>
              </div>

              <div className="sm:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <UniversalRichTextEditor
                  label="Experience Description, Responsibilities & Details (English)"
                  value={item.descriptionEn}
                  onChange={(val) =>
                    setItems(items.map((x) => (x.id === item.id ? { ...x, descriptionEn: val } : x)))
                  }
                  minHeight={140}
                  placeholder="Describe clinical responsibilities, case management, and duties..."
                />
                <UniversalRichTextEditor
                  label="Experience Description, Responsibilities & Details (Nepali Unicode)"
                  value={item.descriptionNp}
                  onChange={(val) =>
                    setItems(items.map((x) => (x.id === item.id ? { ...x, descriptionNp: val } : x)))
                  }
                  isNepali={true}
                  minHeight={140}
                  placeholder="कार्य अनुभव र जिम्मेवारीहरू नेपालीमा..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 6. BLOGS & SLUGS (With Firebase Storage Cover Image Upload & Rich Text Editor)
// ==========================================
const DEFAULT_BLOG_COVER = '/assets/images/hero_ayurveda_clinic_1791392890876.jpg';

const BlogsManager: React.FC<{
  blogs: BlogArticle[];
  onSaveLocal: (b: BlogArticle[]) => void;
  onSaveLive: (b: BlogArticle[]) => void;
  onNotify?: (msg: string, type?: 'success' | 'warning' | 'error') => void;
}> = ({ blogs, onSaveLocal, onSaveLive, onNotify }) => {
  const [items, setItems] = useState<BlogArticle[]>(blogs);
  const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [coverUploadProgress, setCoverUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showCorsGuide, setShowCorsGuide] = useState(false);
  const [previewImage, setPreviewImage] = useState<{ url: string; title?: string } | null>(null);
  const activeCoverTaskRef = React.useRef<UploadTask | null>(null);

  React.useEffect(() => {
    setItems(blogs);
  }, [blogs]);

  const handleCreateNew = () => {
    const newBlog: BlogArticle = {
      id: `blog-${Date.now()}`,
      slug: `health-article-${Date.now().toString(36)}`,
      titleEn: 'New Health Article',
      titleNp: 'नयाँ स्वास्थ्य लेख',
      excerptEn: 'Short summary.',
      excerptNp: 'संक्षिप्त सार।',
      contentEn: '<p>Full article body.</p>',
      contentNp: '<p>लेखको पूर्ण विवरण।</p>',
      categoryEn: 'Digestive Health',
      categoryNp: 'पाचन स्वास्थ्य',
      authorEn: 'Dr. Prem Raj Joshi (BAMS)',
      authorNp: 'डा. प्रेम राज जोशी (BAMS)',
      publishDate: new Date().toISOString().slice(0, 10),
      readTime: '4 min read',
      coverImage: DEFAULT_BLOG_COVER,
      cover_image: DEFAULT_BLOG_COVER
    };
    setEditingBlog(newBlog);
    setSlugError(null);
    setUploadError(null);
    setCoverUploadProgress(0);
  };

  const handleUploadCover = async (file: File) => {
    if (!editingBlog) return;

    // 1. Validate file type & size before starting upload
    const validation = validateImageFile(file, 10);
    if (!validation.valid) {
      const msg = validation.error || 'Invalid image file.';
      setUploadError(msg);
      if (onNotify) onNotify(`⚠️ ${msg}`, 'error');
      return;
    }

    setIsUploadingCover(true);
    setCoverUploadProgress(1);
    setUploadError(null);

    try {
      // 2. Use the shared Firebase Storage instance & uploadBytesResumable / uploadBytes / getDownloadURL
      const activeStorage = storage || (app ? getStorage(app) : getStorage());
      const safeFileName = sanitizeStorageFileName(file.name);
      const storagePath = `blog_covers/${Date.now()}_${safeFileName}`;
      const storageRef = ref(activeStorage, storagePath);

      // Upload via resilient resumable upload helper with multi-bucket & RTDB cloud fallback
      const uploadResult = await uploadImageToFirebaseStorage(file, 'blog_covers', {
        maxSizeMB: 10,
        customFileName: `${Date.now()}_${safeFileName}`,
        onProgress: (pct) => setCoverUploadProgress(pct),
        onTaskCreated: (task) => {
          activeCoverTaskRef.current = task;
        }
      });

      const downloadURL = uploadResult.downloadURL || (await getDownloadURL(storageRef));

      // 3. Save download URL into both cover_image and coverImage using functional state update
      // so concurrent edits in the Rich Text Editor are never overwritten!
      setEditingBlog((prev) =>
        prev
          ? {
              ...prev,
              cover_image: downloadURL,
              coverImage: downloadURL
            }
          : null
      );

      if (onNotify) {
        onNotify(
          uploadResult.usedFallback
            ? '✓ Cover image optimized & saved directly to Firebase Realtime Database (Storage bucket 404/CORS bypassed)!'
            : '✓ Cover image uploaded to Firebase Storage (`blog_covers/`)!',
          'success'
        );
      }
    } catch (err: any) {
      console.error('Firebase Storage cover upload failed:', err);
      const formatted = formatFirebaseStorageError(err);
      if (!formatted.isCanceled) {
        setUploadError(formatted.message);
        if (formatted.isCorsOr404) {
          setShowCorsGuide(true);
        }
        if (onNotify) {
          onNotify(`⚠️ ${formatted.message}`, 'error');
        }
      }
    } finally {
      activeCoverTaskRef.current = null;
      setIsUploadingCover(false);
      setCoverUploadProgress(0);
    }
  };

  const handleCancelCoverUpload = () => {
    if (activeCoverTaskRef.current) {
      try {
        activeCoverTaskRef.current.cancel();
      } catch {
        // ignore
      }
    }
    activeCoverTaskRef.current = null;
    setIsUploadingCover(false);
    setCoverUploadProgress(0);
  };

  const handleRemoveCoverImage = () => {
    setEditingBlog((prev) =>
      prev
        ? {
            ...prev,
            cover_image: DEFAULT_BLOG_COVER,
            coverImage: DEFAULT_BLOG_COVER
          }
        : null
    );
    setUploadError(null);
  };

  const handleSaveItem = () => {
    if (!editingBlog || isUploadingCover) return;
    const isUnique = checkSlugUniqueness(editingBlog.slug, items, editingBlog.id);
    if (!isUnique) {
      const duplicateMsg = `Slug "${editingBlog.slug}" is already in use! Please choose a unique slug.`;
      setSlugError(duplicateMsg);
      if (onNotify) onNotify(`⚠️ ${duplicateMsg}`, 'error');
      return;
    }

    const finalCoverUrl = editingBlog.cover_image || editingBlog.coverImage || DEFAULT_BLOG_COVER;
    const normalizedBlog: BlogArticle = {
      ...editingBlog,
      cover_image: finalCoverUrl,
      coverImage: finalCoverUrl
    };

    const updated = items.some((b) => b.id === normalizedBlog.id)
      ? items.map((b) => (b.id === normalizedBlog.id ? normalizedBlog : b))
      : [normalizedBlog, ...items];

    setItems(updated);
    onSaveLive(updated);
    setEditingBlog(null);
    setUploadError(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Health Blogs & Unique Slugs
          </h2>
          <p className="text-xs text-neutral-500">
            Publish articles with the Word-like Rich Text Editor, upload PC cover photos directly to Firebase Storage, and auto-verify unique slug keys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateNew}
            className="px-3.5 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Article</span>
          </button>
          <button
            onClick={() =>
              onSaveLocal(
                items.map((b) => ({
                  ...b,
                  cover_image: b.cover_image || b.coverImage,
                  coverImage: b.cover_image || b.coverImage
                }))
              )
            }
            className="px-4 py-2 bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold rounded-xl"
          >
            Save Draft
          </button>
          <button
            onClick={() =>
              onSaveLive(
                items.map((b) => ({
                  ...b,
                  cover_image: b.cover_image || b.coverImage,
                  coverImage: b.cover_image || b.coverImage
                }))
              )
            }
            className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
          >
            Global Live Push
          </button>
        </div>
      </div>

      {editingBlog && (
        <div className="bg-white border-2 border-emerald-600 rounded-2xl p-6 shadow-md space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Title (EN)</label>
              <input
                type="text"
                value={editingBlog.titleEn}
                onChange={(e) => {
                  const val = e.target.value;
                  const autoSlug = generateSlug(val);
                  setEditingBlog((prev) => (prev ? { ...prev, titleEn: val, slug: autoSlug } : null));
                  const uniq = checkSlugUniqueness(autoSlug, items, editingBlog.id);
                  setSlugError(uniq ? null : 'Slug already exists');
                }}
                className="w-full p-2 text-xs border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Title (Nepali Unicode)</label>
              <input
                type="text"
                value={editingBlog.titleNp}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditingBlog((prev) => (prev ? { ...prev, titleNp: val } : null));
                }}
                className="w-full p-2 text-xs border rounded-lg font-nepali"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Unique Slug (/blog/slug)</label>
              <input
                type="text"
                value={editingBlog.slug}
                onChange={(e) => {
                  const cl = generateSlug(e.target.value);
                  setEditingBlog((prev) => (prev ? { ...prev, slug: cl } : null));
                  const uniq = checkSlugUniqueness(cl, items, editingBlog.id);
                  setSlugError(uniq ? null : 'Slug already exists');
                }}
                className={`w-full p-2 text-xs border rounded-lg font-mono ${slugError ? 'border-rose-500 bg-rose-50' : ''}`}
              />
              {slugError && <p className="text-[10px] text-rose-600 font-bold mt-1">{slugError}</p>}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Category (EN)</label>
                <input
                  type="text"
                  value={editingBlog.categoryEn}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingBlog((prev) => (prev ? { ...prev, categoryEn: val } : null));
                  }}
                  className="w-full p-2 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Read Time</label>
                <input
                  type="text"
                  value={editingBlog.readTime}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEditingBlog((prev) => (prev ? { ...prev, readTime: val } : null));
                  }}
                  className="w-full p-2 text-xs border rounded-lg font-mono"
                />
              </div>
            </div>

            {/* Direct PC Cover Image Upload via Firebase Storage with Progress, Cancel, Remove & Error Alert */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                <div
                  className="w-24 h-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0 relative group cursor-pointer border border-neutral-300 shadow-2xs"
                  onClick={() =>
                    !isUploadingCover &&
                    setPreviewImage({
                      url: editingBlog.cover_image || editingBlog.coverImage,
                      title: editingBlog.titleEn
                    })
                  }
                  title="Click to view full screen"
                >
                  <img
                    src={editingBlog.cover_image || editingBlog.coverImage}
                    alt="cover"
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform ${
                      isUploadingCover ? 'opacity-40' : ''
                    }`}
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallbackApplied) {
                        target.dataset.fallbackApplied = 'true';
                        target.src = DEFAULT_BLOG_COVER;
                      }
                    }}
                  />
                  {isUploadingCover ? (
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span className="text-[9px] font-mono mt-0.5">{coverUploadProgress}%</span>
                    </div>
                  ) : (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <span className="text-xs font-bold text-neutral-800 block">
                    Article Cover Photo (Firebase Storage `cover_image`):
                  </span>
                  {isUploadingCover ? (
                    <div className="space-y-1">
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Uploading to `blog_covers/...` ({coverUploadProgress}%)</span>
                      </span>
                      <div className="w-full max-w-xs h-1.5 bg-emerald-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 transition-all duration-200"
                          style={{ width: `${coverUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[10px] text-neutral-500 font-mono truncate block">
                      {editingBlog.cover_image || editingBlog.coverImage}
                    </span>
                  )}

                  <div className="flex flex-wrap items-center gap-3 pt-0.5">
                    <button
                      type="button"
                      disabled={isUploadingCover}
                      onClick={() =>
                        setPreviewImage({
                          url: editingBlog.cover_image || editingBlog.coverImage,
                          title: editingBlog.titleEn
                        })
                      }
                      className="text-[11px] text-emerald-700 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Preview Full Screen</span>
                    </button>

                    {(editingBlog.cover_image || editingBlog.coverImage) !== DEFAULT_BLOG_COVER && !isUploadingCover && (
                      <button
                        type="button"
                        onClick={handleRemoveCoverImage}
                        className="text-[11px] text-rose-600 font-semibold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Remove Cover Image</span>
                      </button>
                    )}

                    {isUploadingCover && (
                      <button
                        type="button"
                        onClick={handleCancelCoverUpload}
                        className="text-[11px] text-rose-700 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel Upload</span>
                      </button>
                    )}
                  </div>
                </div>

                <label
                  className={`px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors shadow-2xs ${
                    isUploadingCover
                      ? 'opacity-60 cursor-not-allowed'
                      : 'hover:bg-neutral-100 cursor-pointer'
                  }`}
                >
                  {isUploadingCover ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Upload PC Cover</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    disabled={isUploadingCover}
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadCover(f);
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {uploadError && (
                <div
                  role="alert"
                  className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{uploadError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setUploadError(null)}
                      className="text-rose-500 hover:text-rose-800 p-0.5"
                      aria-label="Dismiss upload error"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {showCorsGuide && (
                    <div className="p-2.5 bg-white border border-rose-200 rounded-lg text-[11px] text-neutral-800 space-y-1.5">
                      <p className="font-bold text-neutral-900">
                        How to apply Firebase Storage CORS for `https://hi.drpremrajjoshi.com.np`:
                      </p>
                      <p>
                        Run this command in Google Cloud Shell or your terminal using the included <code className="font-mono font-bold">cors.json</code> file:
                      </p>
                      <pre className="bg-neutral-900 text-emerald-300 p-2 rounded font-mono text-[10px] overflow-x-auto">
{`gcloud storage buckets update gs://${firebaseConfig.storageBucket} --cors-file=cors.json`}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Excerpt / Summary (EN & NP) */}
            <div>
              <UniversalRichTextEditor
                label="Article Summary / Excerpt (English)"
                value={editingBlog.excerptEn}
                onChange={(val) =>
                  setEditingBlog((prev) => (prev ? { ...prev, excerptEn: val } : null))
                }
                minHeight={110}
                allowTables={false}
                placeholder="Write a concise summary for article cards and SEO..."
              />
            </div>

            <div>
              <UniversalRichTextEditor
                label="Article Summary / Excerpt (Nepali Unicode)"
                value={editingBlog.excerptNp}
                onChange={(val) =>
                  setEditingBlog((prev) => (prev ? { ...prev, excerptNp: val } : null))
                }
                isNepali={true}
                minHeight={110}
                allowTables={false}
                placeholder="लेखको संक्षिप्त सार नेपालीमा..."
              />
            </div>

            {/* Rich Article Content (English) */}
            <div className="md:col-span-2">
              <UniversalRichTextEditor
                label="Article Content (English — Microsoft Word-Like Rich Text Editor)"
                value={editingBlog.contentEn}
                onChange={(val) =>
                  setEditingBlog((prev) => (prev ? { ...prev, contentEn: val } : null))
                }
                minHeight={280}
                draftKey={`blog_en_${editingBlog.id}`}
                onNotify={onNotify}
                placeholder="Write full formatted medical article in English..."
              />
            </div>

            {/* Rich Article Content (Nepali Unicode) */}
            <div className="md:col-span-2">
              <UniversalRichTextEditor
                label="Article Content (Nepali Unicode — Microsoft Word-Like Rich Text Editor)"
                value={editingBlog.contentNp}
                onChange={(val) =>
                  setEditingBlog((prev) => (prev ? { ...prev, contentNp: val } : null))
                }
                isNepali={true}
                minHeight={260}
                draftKey={`blog_np_${editingBlog.id}`}
                onNotify={onNotify}
                placeholder="लेखको पूर्ण विवरण नेपालीमा लेख्नुहोस्..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                handleCancelCoverUpload();
                setEditingBlog(null);
                setUploadError(null);
              }}
              className="px-4 py-2 bg-neutral-100 rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveItem}
              disabled={isUploadingCover}
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5"
            >
              {isUploadingCover && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{isUploadingCover ? 'Uploading Cover...' : 'Confirm Article'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Blog list */}
      <div className="space-y-3">
        {items.map((b) => {
          const itemCover = b.cover_image || b.coverImage || DEFAULT_BLOG_COVER;
          return (
            <div key={b.id} className="bg-white p-4 rounded-xl border flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 shrink-0 relative group cursor-pointer"
                  onClick={() => setPreviewImage({ url: itemCover, title: b.titleEn })}
                  title="Click to view full screen"
                >
                  <img
                    src={itemCover}
                    alt={b.titleEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.fallbackApplied) {
                        target.dataset.fallbackApplied = 'true';
                        target.src = DEFAULT_BLOG_COVER;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-neutral-900">{b.titleEn}</h4>
                  <span className="text-[11px] text-emerald-800 font-mono font-semibold">/blog/{b.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewImage({ url: itemCover, title: b.titleEn })}
                  className="p-1.5 rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 cursor-pointer"
                  title="Preview Cover Fullscreen"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setEditingBlog({
                      ...b,
                      cover_image: itemCover,
                      coverImage: itemCover
                    });
                    setUploadError(null);
                  }}
                  className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-emerald-100 cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setItems(items.filter((x) => x.id !== b.id))} className="p-1.5 rounded-lg bg-neutral-100 text-rose-600 hover:bg-rose-100 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Lightbox for Admin Image Preview */}
      {previewImage && (
        <FullScreenImageViewer
          isOpen={true}
          imageUrl={previewImage.url}
          title={previewImage.title || 'Image Preview'}
          subtitle="Admin CMS Preview"
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
};

// ==========================================
// 7. FAQ MANAGER
// ==========================================
const FAQManager: React.FC<{
  faqs: FAQItem[];
  onSaveLocal: (f: FAQItem[]) => void;
  onSaveLive: (f: FAQItem[]) => void;
}> = ({ faqs, onSaveLocal, onSaveLive }) => {
  const [items, setItems] = useState<FAQItem[]>(faqs);

  React.useEffect(() => {
    setItems(faqs);
  }, [faqs]);

  const handleAdd = () => {
    const newF: FAQItem = {
      id: `faq-${Date.now()}`,
      categoryEn: 'Consultation',
      categoryNp: 'परामर्श',
      questionEn: 'New Question in English?',
      questionNp: 'नयाँ प्रश्न नेपालीमा?',
      answerEn: 'Clear answer.',
      answerNp: 'स्पष्ट उत्तर।',
      order: items.length + 1
    };
    setItems([...items, newF]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-neutral-900 font-editorial">Frequently Asked Questions</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleAdd} className="px-3 py-1.5 bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1">
            <Plus className="w-3 h-3" /> Add FAQ
          </button>
          <button onClick={() => onSaveLocal(items)} className="px-3.5 py-1.5 bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl">
            Save Draft
          </button>
          <button onClick={() => onSaveLive(items)} className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl">
            Global Live Push
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((faq) => (
          <div key={faq.id} className="bg-white p-5 rounded-xl border space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={faq.categoryEn}
                  onChange={(e) =>
                    setItems(items.map((x) => (x.id === faq.id ? { ...x, categoryEn: e.target.value } : x)))
                  }
                  placeholder="Category (EN)"
                  className="px-2 py-1 text-[11px] font-mono text-emerald-800 font-bold border rounded bg-emerald-50/40"
                />
                <input
                  type="text"
                  value={faq.categoryNp}
                  onChange={(e) =>
                    setItems(items.map((x) => (x.id === faq.id ? { ...x, categoryNp: e.target.value } : x)))
                  }
                  placeholder="Category (NP)"
                  className="px-2 py-1 text-[11px] font-nepali text-emerald-800 font-bold border rounded bg-emerald-50/40"
                />
              </div>
              <button onClick={() => setItems(items.filter((x) => x.id !== faq.id))} className="text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Question (English)</label>
                <input
                  type="text"
                  value={faq.questionEn}
                  onChange={(e) => setItems(items.map((x) => x.id === faq.id ? { ...x, questionEn: e.target.value } : x))}
                  className="w-full p-2 text-xs border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Question (Nepali Unicode)</label>
                <input
                  type="text"
                  value={faq.questionNp}
                  onChange={(e) => setItems(items.map((x) => x.id === faq.id ? { ...x, questionNp: e.target.value } : x))}
                  className="w-full p-2 text-xs border rounded-lg font-nepali"
                />
              </div>
              <div>
                <UniversalRichTextEditor
                  label="Answer (English — Rich Text)"
                  value={faq.answerEn}
                  onChange={(val) =>
                    setItems(items.map((x) => (x.id === faq.id ? { ...x, answerEn: val } : x)))
                  }
                  minHeight={130}
                  placeholder="Write detailed FAQ answer in English..."
                />
              </div>
              <div>
                <UniversalRichTextEditor
                  label="Answer (Nepali Unicode — Rich Text)"
                  value={faq.answerNp}
                  onChange={(val) =>
                    setItems(items.map((x) => (x.id === faq.id ? { ...x, answerNp: val } : x)))
                  }
                  isNepali={true}
                  minHeight={130}
                  placeholder="विस्तृत उत्तर नेपालीमा लेख्नुहोस्..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 8. USEFUL LINKS
// ==========================================
const LinksManager: React.FC<{
  links: UsefulLink[];
  onSaveLocal: (l: UsefulLink[]) => void;
  onSaveLive: (l: UsefulLink[]) => void;
}> = ({ links, onSaveLocal, onSaveLive }) => {
  const [items, setItems] = useState<UsefulLink[]>(links);

  React.useEffect(() => {
    setItems(links);
  }, [links]);

  const handleAdd = () => {
    const newL: UsefulLink = {
      id: `link-${Date.now()}`,
      titleEn: 'New Portal',
      titleNp: 'नयाँ पोर्टल',
      url: 'https://example.com',
      categoryEn: 'Regulatory',
      categoryNp: 'नियामक'
    };
    setItems([...items, newL]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-neutral-900 font-editorial">Useful Institutional Links (Footer)</h2>
        <div className="flex gap-2">
          <button onClick={handleAdd} className="px-3 py-1.5 bg-neutral-200 text-xs font-bold rounded-xl">Add Link</button>
          <button onClick={() => onSaveLocal(items)} className="px-3 py-1.5 bg-neutral-200 text-xs font-bold rounded-xl">Save Draft</button>
          <button onClick={() => onSaveLive(items)} className="px-4 py-1.5 bg-emerald-700 text-white text-xs font-bold rounded-xl">Global Live Push</button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((l) => (
          <div key={l.id} className="bg-white p-4 rounded-xl border space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <input
                type="text"
                value={l.titleEn}
                onChange={(e) => setItems(items.map((x) => x.id === l.id ? { ...x, titleEn: e.target.value } : x))}
                placeholder="Link Title (English)"
                className="flex-1 min-w-[180px] p-2 text-xs border rounded-lg"
              />
              <input
                type="text"
                value={l.titleNp}
                onChange={(e) => setItems(items.map((x) => x.id === l.id ? { ...x, titleNp: e.target.value } : x))}
                placeholder="Link Title (Nepali)"
                className="flex-1 min-w-[180px] p-2 text-xs border rounded-lg font-nepali"
              />
              <input
                type="text"
                value={l.url}
                onChange={(e) => setItems(items.map((x) => x.id === l.id ? { ...x, url: e.target.value } : x))}
                placeholder="https://..."
                className="w-full sm:w-1/3 p-2 text-xs border rounded-lg font-mono"
              />
              <button onClick={() => setItems(items.filter((x) => x.id !== l.id))} className="text-rose-600 p-1">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <UniversalRichTextEditor
                label="Link Description (English — Optional)"
                value={l.descriptionEn || ''}
                onChange={(val) =>
                  setItems(items.map((x) => (x.id === l.id ? { ...x, descriptionEn: val } : x)))
                }
                minHeight={95}
                allowImages={false}
                allowTables={false}
                placeholder="Optional institutional link description..."
              />
              <UniversalRichTextEditor
                label="Link Description (Nepali — Optional)"
                value={l.descriptionNp || ''}
                onChange={(val) =>
                  setItems(items.map((x) => (x.id === l.id ? { ...x, descriptionNp: val } : x)))
                }
                isNepali={true}
                minHeight={95}
                allowImages={false}
                allowTables={false}
                placeholder="संस्थागत लिङ्कको संक्षिप्त विवरण..."
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 9. DOWNLOADS (Direct Device PDF Upload)
// ==========================================
const DownloadsManager: React.FC<{
  downloads: DownloadItem[];
  onSaveLocal: (d: DownloadItem[]) => void;
  onSaveLive: (d: DownloadItem[]) => void;
}> = ({ downloads, onSaveLocal, onSaveLive }) => {
  const [items, setItems] = useState<DownloadItem[]>(downloads);

  React.useEffect(() => {
    setItems(downloads);
  }, [downloads]);

  const handleAdd = () => {
    const newD: DownloadItem = {
      id: `dl-${Date.now()}`,
      titleEn: 'New Patient Guide (PDF)',
      titleNp: 'नयाँ निर्देशिका',
      fileName: 'Patient_Guide.pdf',
      fileSize: '1.2 MB',
      fileUrl: '#guide',
      categoryEn: 'Patient Guide',
      categoryNp: 'निर्देशिका'
    };
    setItems([...items, newD]);
  };

  const handleUploadPdf = (id: string, file: File) => {
    readFileAsDataUrl(file, (dataUrl, fileName, fileSize) => {
      setItems(items.map((d) => (d.id === id ? {
        ...d,
        fileName,
        fileSize,
        fileUrl: dataUrl
      } : d)));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Downloads Manager (Direct PDF Device Upload)
          </h2>
          <p className="text-xs text-neutral-500">
            Upload PDF files directly from your computer/device so visitors can download them effortlessly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleAdd} className="px-3.5 py-2 bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Guide
          </button>
          <button onClick={() => onSaveLocal(items)} className="px-4 py-2 bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl">
            Save Draft
          </button>
          <button onClick={() => onSaveLive(items)} className="px-5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs">
            Global Live Push
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white border rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-xs font-mono font-bold text-emerald-800">
                File: {item.fileName} ({item.fileSize})
              </span>
              <button onClick={() => setItems(items.filter((x) => x.id !== item.id))} className="text-rose-600 text-xs flex items-center gap-1">
                <Trash2 className="w-3.5 h-3.5" /> Remove
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Guide Title (English)</label>
                <input
                  type="text"
                  value={item.titleEn}
                  onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, titleEn: e.target.value } : x))}
                  className="w-full p-2 text-xs border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Guide Title (Nepali)</label>
                <input
                  type="text"
                  value={item.titleNp}
                  onChange={(e) => setItems(items.map((x) => x.id === item.id ? { ...x, titleNp: e.target.value } : x))}
                  className="w-full p-2 text-xs border rounded-lg font-nepali"
                />
              </div>

              {/* Direct PDF Upload Button */}
              <div className="sm:col-span-2 flex items-center justify-between bg-neutral-50 p-3 rounded-xl border">
                <div>
                  <span className="text-xs font-bold text-neutral-800 block">PDF Asset File:</span>
                  <span className="text-[11px] text-neutral-500 font-mono">{item.fileName} · {item.fileSize}</span>
                </div>

                <label className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs">
                  <FileUp className="w-4 h-4" />
                  <span>Upload PDF From Device</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadPdf(item.id, f);
                    }}
                  />
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 10. LOGO, FLAG & YOUTUBE VIDEO
// ==========================================
const LogoFlagManager: React.FC<{
  branding: Branding;
  onSaveLocal: (b: Branding) => void;
  onSaveLive: (b: Branding) => void;
}> = ({ branding, onSaveLocal, onSaveLive }) => {
  const [data, setData] = useState<Branding>(branding);

  React.useEffect(() => {
    setData(branding);
  }, [branding]);

  const handleUploadLogo = (file: File) => {
    readFileAsDataUrl(file, (dataUrl) => {
      setData({ ...data, logoUrl: dataUrl });
    });
  };

  const handleUploadFlag = (file: File) => {
    readFileAsDataUrl(file, (dataUrl) => {
      setData({ ...data, flagUrl: dataUrl });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Logo, Flag & YouTube Video Embed
          </h2>
          <p className="text-xs text-neutral-500">
            Upload custom doctor logo/favicon, Nepal national flag, and paste your own YouTube video embed URL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onSaveLocal(data)} className="px-4 py-2 bg-neutral-200 text-xs font-bold rounded-xl">Save Draft</button>
          <button onClick={() => onSaveLive(data)} className="px-5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs">Global Live Push</button>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-6 shadow-xs space-y-6">
        {/* Doctor Logo / Dynamic Favicon */}
        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border">
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-600 bg-white shrink-0">
            <img src={data.logoUrl} alt="logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-neutral-800 block">Doctor Profile Logo & Dynamic Favicon</span>
            <span className="text-[11px] text-neutral-500">Automatically links as &lt;link rel="icon"&gt; on browser tab</span>
          </div>
          <label className="px-3.5 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 cursor-pointer hover:bg-neutral-100 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span>Upload Device Logo</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUploadLogo(f);
            }} />
          </label>
        </div>

        {/* Nepal Flag */}
        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl border">
          <div className="w-14 h-14 p-1 bg-white border rounded-lg shrink-0 flex items-center justify-center">
            <img src={data.flagUrl} alt="flag" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex-1">
            <span className="text-xs font-bold text-neutral-800 block">Nepal National Flag Asset</span>
          </div>
          <label className="px-3.5 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 cursor-pointer hover:bg-neutral-100 flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5 text-emerald-700" />
            <span>Upload Flag</span>
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUploadFlag(f);
            }} />
          </label>
        </div>

        {/* Custom YouTube Video Embed */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-neutral-800">
            Featured YouTube Video Embed URL (e.g. https://www.youtube.com/embed/VIDEO_ID)
          </label>
          <input
            type="text"
            value={data.youtubeEmbedUrl || ''}
            onChange={(e) => setData({ ...data, youtubeEmbedUrl: e.target.value })}
            placeholder="https://www.youtube.com/embed/..."
            className="w-full p-2.5 text-xs border rounded-xl font-mono"
          />
          <p className="text-[11px] text-neutral-400">
            Paste any YouTube embed link here to show your clinical health lecture on the public site gallery.
          </p>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 11. GALLERY (With Direct Device Image Upload)
// ==========================================
const GalleryManager: React.FC<{
  gallery: GalleryItem[];
  onSaveLocal: (g: GalleryItem[]) => void;
  onSaveLive: (g: GalleryItem[]) => void;
}> = ({ gallery, onSaveLocal, onSaveLive }) => {
  const [items, setItems] = useState<GalleryItem[]>(gallery);

  React.useEffect(() => {
    setItems(gallery);
  }, [gallery]);

  const handleAdd = () => {
    const newG: GalleryItem = {
      id: `gal-${Date.now()}`,
      slug: `photo-${Date.now().toString(36)}`,
      titleEn: 'New Gallery Photo',
      titleNp: 'नयाँ तस्बिर',
      type: 'photo',
      mediaUrl: '/src/assets/images/hero_ayurveda_clinic_1791392890876.jpg',
      captionEn: 'Clinical event caption.',
      date: new Date().toISOString().slice(0, 10)
    };
    setItems([...items, newG]);
  };

  const handleUploadPhoto = (id: string, file: File) => {
    readFileAsDataUrl(file, (dataUrl) => {
      setItems(items.map((g) => (g.id === id ? { ...g, mediaUrl: dataUrl } : g)));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Gallery Albums & Photos
          </h2>
          <p className="text-xs text-neutral-500">
            Upload clinic photos, health camps, and botanical expedition images directly from your device.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleAdd} className="px-3.5 py-2 bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Add Photo
          </button>
          <button onClick={() => onSaveLocal(items)} className="px-4 py-2 bg-neutral-200 text-neutral-800 text-xs font-bold rounded-xl">Save Draft</button>
          <button onClick={() => onSaveLive(items)} className="px-5 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs">Global Live Push</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {items.map((g) => (
          <div key={g.id} className="bg-white p-4 rounded-xl border space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-neutral-600">{g.date}</span>
              <button onClick={() => setItems(items.filter((x) => x.id !== g.id))} className="text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="aspect-16/9 rounded-lg overflow-hidden bg-neutral-100 border relative group">
              <img src={g.mediaUrl} alt={g.titleEn} className="w-full h-full object-cover" />
              <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-opacity">
                <Upload className="w-4 h-4 mr-1.5" />
                <span>Replace from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadPhoto(g.id, f);
                  }}
                />
              </label>
            </div>

            <input
              type="text"
              value={g.titleEn}
              onChange={(e) => setItems(items.map((x) => x.id === g.id ? { ...x, titleEn: e.target.value } : x))}
              placeholder="Title (English)"
              className="w-full p-1.5 text-xs border rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

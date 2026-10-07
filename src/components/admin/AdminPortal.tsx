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
  GalleryItem
} from '../../types';
import { saveNodeData, checkSlugUniqueness } from '../../services/firebase';
import { generateSlug } from '../../utils/slugify';
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
  FileUp
} from 'lucide-react';

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

// Device file reader helper
function readFileAsDataUrl(
  file: File,
  callback: (url: string, name: string, size: string) => void
) {
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

  // Login form state
  const [loginEmail, setLoginEmail] = useState('admin@prem');
  const [loginPass, setLoginPass] = useState('Prem@admin');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState('profile_stats');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
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
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-[11px] text-neutral-600 space-y-0.5 font-mono">
              <p className="font-bold text-neutral-800">Default Credentials:</p>
              <p>Username: <span className="text-emerald-700 font-semibold">admin@prem</span></p>
              <p>Password: <span className="text-emerald-700 font-semibold">Prem@admin</span></p>
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
    { id: 'profile_stats', label: 'Profile, Location & Stats', icon: BarChart3 },
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
      <header className="bg-neutral-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-neutral-800">
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

        <div className="flex items-center gap-4">
          <span className="text-xs text-neutral-400 hidden md:inline">
            Logged in as <strong className="text-white">admin@prem</strong>
          </span>
          <button
            onClick={logout}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-neutral-700"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

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
          {toastMsg && (
            <div className="mb-6 p-4 bg-emerald-800 text-white rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>{toastMsg}</span>
            </div>
          )}

          {/* Module 1: Profile, Location & Stats Manager */}
          {activeTab === 'profile_stats' && (
            <ProfileLocationStatsManager
              branding={branding}
              autobiography={autobiography}
              onSaveLocal={(b, a) => {
                onUpdateBranding(b);
                onUpdateAutobiography(a);
                localStorage.setItem('dr_joshi_branding', JSON.stringify(b));
                localStorage.setItem('dr_joshi_autobiography', JSON.stringify(a));
                showToast('Saved locally in draft mode.');
              }}
              onSaveLive={async (b, a) => {
                onUpdateBranding(b);
                onUpdateAutobiography(a);
                await saveNodeData('branding', 'dr_joshi_branding', b);
                await saveNodeData('autobiography', 'dr_joshi_autobiography', a);
                showToast('Global Live Push: Pushed directly to Firebase Realtime Database!');
              }}
            />
          )}

          {/* Module 2: Hero Sliders */}
          {activeTab === 'sliders' && (
            <SlidersManager
              slides={slides}
              onSaveLocal={(newSlides) => {
                onUpdateSlides(newSlides);
                localStorage.setItem('dr_joshi_slider_images', JSON.stringify(newSlides));
                showToast('Hero sliders saved locally.');
              }}
              onSaveLive={async (newSlides) => {
                onUpdateSlides(newSlides);
                await saveNodeData('slider_images', 'dr_joshi_slider_images', newSlides);
                showToast('Global Live Push: Hero slides synced to Firebase!');
              }}
            />
          )}

          {/* Module 3: Autobiography */}
          {activeTab === 'autobiography' && (
            <AutobiographyManager
              autobiography={autobiography}
              onSaveLocal={(newBio) => {
                onUpdateAutobiography(newBio);
                localStorage.setItem('dr_joshi_autobiography', JSON.stringify(newBio));
                showToast('Autobiography saved locally.');
              }}
              onSaveLive={async (newBio) => {
                onUpdateAutobiography(newBio);
                await saveNodeData('autobiography', 'dr_joshi_autobiography', newBio);
                showToast('Global Live Push: Autobiography pushed to Firebase!');
              }}
            />
          )}

          {/* Module 4: Education Journey (Place Studied Image) */}
          {activeTab === 'education' && (
            <EducationManager
              education={education}
              onSaveLocal={(newEdu) => {
                onUpdateEducation(newEdu);
                localStorage.setItem('dr_joshi_education', JSON.stringify(newEdu));
                showToast('Education milestones saved locally.');
              }}
              onSaveLive={async (newEdu) => {
                onUpdateEducation(newEdu);
                await saveNodeData('education', 'dr_joshi_education', newEdu);
                showToast('Global Live Push: Education milestones pushed to Firebase!');
              }}
            />
          )}

          {/* Module 5: Experience Deployment (Place Worked Image) */}
          {activeTab === 'experience' && (
            <ExperienceManager
              experience={experience}
              onSaveLocal={(newExp) => {
                onUpdateExperience(newExp);
                localStorage.setItem('dr_joshi_experience', JSON.stringify(newExp));
                showToast('Experience entries saved locally.');
              }}
              onSaveLive={async (newExp) => {
                onUpdateExperience(newExp);
                await saveNodeData('experience', 'dr_joshi_experience', newExp);
                showToast('Global Live Push: Work experience pushed to Firebase!');
              }}
            />
          )}

          {/* Module 6: Blogs & Slugs */}
          {activeTab === 'blogs' && (
            <BlogsManager
              blogs={blogs}
              onSaveLocal={(newBlogs) => {
                onUpdateBlogs(newBlogs);
                localStorage.setItem('dr_joshi_blogs', JSON.stringify(newBlogs));
                showToast('Blog articles saved locally.');
              }}
              onSaveLive={async (newBlogs) => {
                onUpdateBlogs(newBlogs);
                await saveNodeData('blogs', 'dr_joshi_blogs', newBlogs);
                showToast('Global Live Push: Blogs synced with unique slug validation to Firebase!');
              }}
            />
          )}

          {/* Module 7: FAQ Manager */}
          {activeTab === 'faq' && (
            <FAQManager
              faqs={faqs}
              onSaveLocal={(newFaqs) => {
                onUpdateFaqs(newFaqs);
                localStorage.setItem('dr_joshi_faq', JSON.stringify(newFaqs));
                showToast('FAQs saved locally.');
              }}
              onSaveLive={async (newFaqs) => {
                onUpdateFaqs(newFaqs);
                await saveNodeData('faq', 'dr_joshi_faq', newFaqs);
                showToast('Global Live Push: FAQs pushed to Firebase!');
              }}
            />
          )}

          {/* Module 8: Useful Links */}
          {activeTab === 'links' && (
            <LinksManager
              links={usefulLinks}
              onSaveLocal={(newL) => {
                onUpdateUsefulLinks(newL);
                localStorage.setItem('dr_joshi_links', JSON.stringify(newL));
                showToast('Useful links saved locally.');
              }}
              onSaveLive={async (newL) => {
                onUpdateUsefulLinks(newL);
                await saveNodeData('links', 'dr_joshi_links', newL);
                showToast('Global Live Push: Useful links pushed to Firebase!');
              }}
            />
          )}

          {/* Module 9: Downloads (Direct PDF Upload) */}
          {activeTab === 'downloads' && (
            <DownloadsManager
              downloads={downloads}
              onSaveLocal={(newD) => {
                onUpdateDownloads(newD);
                localStorage.setItem('dr_joshi_downloads', JSON.stringify(newD));
                showToast('Downloads saved locally.');
              }}
              onSaveLive={async (newD) => {
                onUpdateDownloads(newD);
                await saveNodeData('downloads', 'dr_joshi_downloads', newD);
                showToast('Global Live Push: PDF download assets pushed to Firebase!');
              }}
            />
          )}

          {/* Module 10: Logo, Flag & YouTube */}
          {activeTab === 'logo_flag' && (
            <LogoFlagManager
              branding={branding}
              onSaveLocal={(newB) => {
                onUpdateBranding(newB);
                localStorage.setItem('dr_joshi_branding', JSON.stringify(newB));
                showToast('Branding & video saved locally.');
              }}
              onSaveLive={async (newB) => {
                onUpdateBranding(newB);
                await saveNodeData('branding', 'dr_joshi_branding', newB);
                showToast('Global Live Push: Branding & YouTube pushed to Firebase!');
              }}
            />
          )}

          {/* Module 11: Gallery */}
          {activeTab === 'gallery' && (
            <GalleryManager
              gallery={gallery}
              onSaveLocal={(newG) => {
                onUpdateGallery(newG);
                localStorage.setItem('dr_joshi_gallery', JSON.stringify(newG));
                showToast('Gallery saved locally.');
              }}
              onSaveLive={async (newG) => {
                onUpdateGallery(newG);
                await saveNodeData('gallery', 'dr_joshi_gallery', newG);
                showToast('Global Live Push: Gallery photos pushed to Firebase!');
              }}
            />
          )}
        </main>
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
              <label className="block text-xs font-bold text-neutral-800">Stat #1 (Medical Degree)</label>
              <input
                type="text"
                value={bData.stats?.stat1Value || '5.5+'}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat1Value: e.target.value }
                })}
                placeholder="Value (e.g. 5.5+)"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-mono font-bold"
              />
              <input
                type="text"
                value={bData.stats?.stat1LabelEn || 'Years Medical Degree'}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat1LabelEn: e.target.value }
                })}
                placeholder="Label EN"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white"
              />
              <input
                type="text"
                value={bData.stats?.stat1LabelNp || 'वर्षे चिकित्सा अध्ययन'}
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
              <label className="block text-xs font-bold text-neutral-800">Stat #2 (Patients Treated)</label>
              <input
                type="text"
                value={bData.stats?.stat2Value || '4,500+'}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat2Value: e.target.value }
                })}
                placeholder="Value (e.g. 4,500+)"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-mono font-bold"
              />
              <input
                type="text"
                value={bData.stats?.stat2LabelEn || 'Patients Treated'}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat2LabelEn: e.target.value }
                })}
                placeholder="Label EN"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white"
              />
              <input
                type="text"
                value={bData.stats?.stat2LabelNp || 'बिरामीहरूको उपचार'}
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
              <label className="block text-xs font-bold text-neutral-800">Stat #3 (Rural Camps)</label>
              <input
                type="text"
                value={bData.stats?.stat3Value || '18+'}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat3Value: e.target.value }
                })}
                placeholder="Value (e.g. 18+)"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white font-mono font-bold"
              />
              <input
                type="text"
                value={bData.stats?.stat3LabelEn || 'Rural Camps'}
                onChange={(e) => setBData({
                  ...bData,
                  stats: { ...(bData.stats || {} as any), stat3LabelEn: e.target.value }
                })}
                placeholder="Label EN"
                className="w-full px-2.5 py-1.5 text-xs border rounded bg-white"
              />
              <input
                type="text"
                value={bData.stats?.stat3LabelNp || 'ग्रामीण स्वास्थ्य शिविर'}
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
                value={aData.kickerEn || 'About Me'}
                onChange={(e) => setAData({ ...aData, kickerEn: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Kicker Label (Nepali Unicode)</label>
              <input
                type="text"
                value={aData.kickerNp || 'मेरो बारेमा'}
                onChange={(e) => setAData({ ...aData, kickerNp: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-lg font-nepali"
              />
            </div>
          </div>
        </div>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Brief Summary (English)</label>
            <textarea
              rows={4}
              value={data.summaryEn}
              onChange={(e) => setData({ ...data, summaryEn: e.target.value })}
              className="w-full p-2.5 text-xs border rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Brief Summary (Nepali)</label>
            <textarea
              rows={4}
              value={data.summaryNp}
              onChange={(e) => setData({ ...data, summaryNp: e.target.value })}
              className="w-full p-2.5 text-xs border rounded-xl font-nepali"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Autobiography Narrative (English)</label>
            <textarea
              rows={8}
              value={data.fullBioEn}
              onChange={(e) => setData({ ...data, fullBioEn: e.target.value })}
              className="w-full p-2.5 text-xs border rounded-xl whitespace-pre-line"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Autobiography Narrative (Nepali)</label>
            <textarea
              rows={8}
              value={data.fullBioNp}
              onChange={(e) => setData({ ...data, fullBioNp: e.target.value })}
              className="w-full p-2.5 text-xs border rounded-xl font-nepali whitespace-pre-line"
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
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ==========================================
// 6. BLOGS & SLUGS (With Cover Image Upload)
// ==========================================
const BlogsManager: React.FC<{
  blogs: BlogArticle[];
  onSaveLocal: (b: BlogArticle[]) => void;
  onSaveLive: (b: BlogArticle[]) => void;
}> = ({ blogs, onSaveLocal, onSaveLive }) => {
  const [items, setItems] = useState<BlogArticle[]>(blogs);
  const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  const handleCreateNew = () => {
    const newBlog: BlogArticle = {
      id: `blog-${Date.now()}`,
      slug: `health-article-${Date.now().toString(36)}`,
      titleEn: 'New Health Article',
      titleNp: 'नयाँ स्वास्थ्य लेख',
      excerptEn: 'Short summary.',
      excerptNp: 'संक्षिप्त सार।',
      contentEn: 'Full article body.',
      contentNp: 'लेखको पूर्ण विवरण।',
      categoryEn: 'Digestive Health',
      categoryNp: 'पाचन स्वास्थ्य',
      authorEn: 'Dr. Prem Raj Joshi (BAMS)',
      authorNp: 'डा. प्रेम राज जोशी (BAMS)',
      publishDate: new Date().toISOString().slice(0, 10),
      readTime: '4 min read',
      coverImage: '/src/assets/images/hero_ayurveda_clinic_1791392890876.jpg'
    };
    setEditingBlog(newBlog);
    setSlugError(null);
  };

  const handleUploadCover = (file: File) => {
    if (!editingBlog) return;
    readFileAsDataUrl(file, (dataUrl) => {
      setEditingBlog({ ...editingBlog, coverImage: dataUrl });
    });
  };

  const handleSaveItem = () => {
    if (!editingBlog) return;
    const isUnique = checkSlugUniqueness(editingBlog.slug, items, editingBlog.id);
    if (!isUnique) {
      alert(`Slug "${editingBlog.slug}" is already in use!`);
      return;
    }
    const updated = items.some((b) => b.id === editingBlog.id)
      ? items.map((b) => (b.id === editingBlog.id ? editingBlog : b))
      : [editingBlog, ...items];
    setItems(updated);
    setEditingBlog(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 font-editorial">
            Health Blogs & Unique Slugs
          </h2>
          <p className="text-xs text-neutral-500">
            Publish articles, upload device cover photos, and auto-verify unique slug keys.
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

      {editingBlog && (
        <div className="bg-white border-2 border-emerald-600 rounded-2xl p-6 shadow-md space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Title (EN)</label>
              <input
                type="text"
                value={editingBlog.titleEn}
                onChange={(e) => {
                  const autoSlug = generateSlug(e.target.value);
                  setEditingBlog({ ...editingBlog, titleEn: e.target.value, slug: autoSlug });
                  const uniq = checkSlugUniqueness(autoSlug, items, editingBlog.id);
                  setSlugError(uniq ? null : 'Slug already exists');
                }}
                className="w-full p-2 text-xs border rounded-lg"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Unique Slug (/blog/slug)</label>
              <input
                type="text"
                value={editingBlog.slug}
                onChange={(e) => {
                  const cl = generateSlug(e.target.value);
                  setEditingBlog({ ...editingBlog, slug: cl });
                  const uniq = checkSlugUniqueness(cl, items, editingBlog.id);
                  setSlugError(uniq ? null : 'Slug already exists');
                }}
                className={`w-full p-2 text-xs border rounded-lg font-mono ${slugError ? 'border-rose-500 bg-rose-50' : ''}`}
              />
              {slugError && <p className="text-[10px] text-rose-600 font-bold mt-1">{slugError}</p>}
            </div>

            {/* Direct Cover Image Upload */}
            <div className="md:col-span-2 flex items-center gap-4 bg-neutral-50 p-3 rounded-xl border">
              <div className="w-20 h-14 rounded-lg overflow-hidden bg-neutral-200 shrink-0">
                <img src={editingBlog.coverImage} alt="cover" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <span className="text-xs font-bold text-neutral-800 block">Article Cover Photo:</span>
                <span className="text-[10px] text-neutral-400 font-mono truncate block">{editingBlog.coverImage}</span>
              </div>
              <label className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-100 rounded-lg text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1.5">
                <Upload className="w-3.5 h-3.5 text-emerald-700" />
                <span>Upload Device Cover</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleUploadCover(f);
                  }}
                />
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Article Content (English)</label>
              <textarea
                rows={6}
                value={editingBlog.contentEn}
                onChange={(e) => setEditingBlog({ ...editingBlog, contentEn: e.target.value })}
                className="w-full p-2.5 text-xs border rounded-lg whitespace-pre-line"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setEditingBlog(null)} className="px-4 py-2 bg-neutral-100 rounded-lg text-xs">
              Cancel
            </button>
            <button onClick={handleSaveItem} className="px-5 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold">
              Confirm Article
            </button>
          </div>
        </div>
      )}

      {/* Blog list */}
      <div className="space-y-3">
        {items.map((b) => (
          <div key={b.id} className="bg-white p-4 rounded-xl border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                <img src={b.coverImage} alt={b.titleEn} className="w-full h-full object-cover" />
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm text-neutral-900">{b.titleEn}</h4>
                <span className="text-[11px] text-emerald-800 font-mono font-semibold">/blog/{b.slug}</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setEditingBlog(b)} className="p-1.5 rounded-lg bg-neutral-100 text-neutral-700 hover:bg-emerald-100">
                <Edit className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setItems(items.filter((x) => x.id !== b.id))} className="p-1.5 rounded-lg bg-neutral-100 text-rose-600 hover:bg-rose-100">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
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

      <div className="space-y-3">
        {items.map((faq) => (
          <div key={faq.id} className="bg-white p-4 rounded-xl border space-y-2">
            <div className="flex justify-between">
              <span className="text-[11px] font-mono text-emerald-800 font-bold">{faq.categoryEn}</span>
              <button onClick={() => setItems(items.filter((x) => x.id !== faq.id))} className="text-rose-600">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={faq.questionEn}
                onChange={(e) => setItems(items.map((x) => x.id === faq.id ? { ...x, questionEn: e.target.value } : x))}
                className="p-1.5 text-xs border rounded"
              />
              <textarea
                rows={2}
                value={faq.answerEn}
                onChange={(e) => setItems(items.map((x) => x.id === faq.id ? { ...x, answerEn: e.target.value } : x))}
                className="p-1.5 text-xs border rounded"
              />
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

      <div className="space-y-3">
        {items.map((l) => (
          <div key={l.id} className="bg-white p-4 rounded-xl border flex items-center justify-between gap-3">
            <input
              type="text"
              value={l.titleEn}
              onChange={(e) => setItems(items.map((x) => x.id === l.id ? { ...x, titleEn: e.target.value } : x))}
              className="flex-1 p-1.5 text-xs border rounded"
            />
            <input
              type="text"
              value={l.url}
              onChange={(e) => setItems(items.map((x) => x.id === l.id ? { ...x, url: e.target.value } : x))}
              className="w-1/3 p-1.5 text-xs border rounded font-mono"
            />
            <button onClick={() => setItems(items.filter((x) => x.id !== l.id))} className="text-rose-600">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
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

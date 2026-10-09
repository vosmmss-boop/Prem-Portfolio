import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PatientInquiry, InquiryStatus, Branding, InquiryMessage } from '../../types';
import {
  updatePatientInquiry,
  deletePatientInquiry,
  getLocal,
  mergeAndNormalizeInquiries,
  STORAGE_KEYS
} from '../../services/firebase';
import { initialPatientInquiries } from '../../data/initialData';
import {
  Inbox,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Printer,
  Trash2,
  X,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  LogOut,
  Shield,
  FileText,
  Paperclip,
  Download,
  Star,
  Send,
  MessageCircle,
  Copy,
  Check,
  Stethoscope
} from 'lucide-react';

interface InquiriesPortalProps {
  inquiries: PatientInquiry[];
  onUpdateInquiries: (inqs: PatientInquiry[]) => void;
  onBackToSite: () => void;
  branding?: Branding;
}

export const InquiriesPortal: React.FC<InquiriesPortalProps> = ({
  inquiries,
  onUpdateInquiries,
  onBackToSite,
  branding
}) => {
  const { isAdmin, login, logout } = useAuth();
  const { language } = useLanguage();

  // Login form state if unauthenticated
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Filter & Search
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCard, setSelectedCard] = useState<PatientInquiry | null>(null);

  // Doctor note editing inside modal
  const [doctorNotes, setDoctorNotes] = useState('');
  const [prescribedAdvice, setPrescribedAdvice] = useState('');
  const [editStatus, setEditStatus] = useState<InquiryStatus>('Pending');
  const [doctorMessageInput, setDoctorMessageInput] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    const res = await login(loginEmail, loginPass);
    setIsLoggingIn(false);
    if (!res.success) {
      setLoginError(res.error || 'Invalid credentials');
    }
  };

  // Ensure any local inquiries in localStorage are merged on mount or tab focus so nothing is ever hidden
  useEffect(() => {
    const syncLatestLocal = () => {
      const localList = getLocal<PatientInquiry[]>(STORAGE_KEYS.INQUIRIES, initialPatientInquiries);
      const merged = mergeAndNormalizeInquiries(localList, inquiries);
      if (merged.length !== inquiries.length) {
        onUpdateInquiries(merged);
      }
    };
    syncLatestLocal();
    window.addEventListener('focus', syncLatestLocal);
    return () => window.removeEventListener('focus', syncLatestLocal);
  }, [inquiries, onUpdateInquiries]);

  // Normalize all inquiries safely so missing properties never hide a card
  const safeInquiries = React.useMemo(
    () => mergeAndNormalizeInquiries(inquiries, []),
    [inquiries]
  );

  // Filter inquiries safely with null-coalescing
  const filteredInquiries = safeInquiries.filter((inq) => {
    const itemStatus = inq.status || 'Pending';
    const matchesStatus = statusFilter === 'all' || itemStatus === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    if (!q) return matchesStatus;

    const fullName = String(inq.fullName || '').toLowerCase();
    const phone = String(inq.phone || '').toLowerCase();
    const trackingId = String(inq.trackingId || inq.id || '').toLowerCase();
    const district = String(inq.district || '').toLowerCase();
    const province = String(inq.province || '').toLowerCase();
    const problemDetails = String(inq.problemDetails || '').toLowerCase();

    const matchesSearch =
      fullName.includes(q) ||
      phone.includes(q) ||
      trackingId.includes(q) ||
      district.includes(q) ||
      province.includes(q) ||
      problemDetails.includes(q);
    return matchesStatus && matchesSearch;
  });

  const handleOpenCard = (inq: PatientInquiry) => {
    setSelectedCard(inq);
    setDoctorNotes(inq.doctorNotes || '');
    setPrescribedAdvice(inq.prescribedAdvice || '');
    setEditStatus(inq.status || 'Pending');
    setDoctorMessageInput('');
  };

  const handleSaveModal = async () => {
    if (!selectedCard) return;
    const updatedCard: PatientInquiry = {
      ...selectedCard,
      doctorNotes,
      prescribedAdvice,
      status: editStatus
    };
    const updated = mergeAndNormalizeInquiries([updatedCard], safeInquiries);
    onUpdateInquiries(updated);
    const result = await updatePatientInquiry(updatedCard);
    setSelectedCard(updatedCard);
    if (result.syncedToFirebase) {
      showToast('✓ Patient record saved & synced globally to Firebase!');
    } else if (result.isPermissionDenied) {
      showToast('⚠️ Saved locally, but Firebase rejected write (Permission Denied). Update Firebase Rules.');
    } else {
      showToast('Patient record saved locally.');
    }
  };

  // Doctor sends message directly to the patient's tracker
  const handleSendDoctorMessage = async () => {
    if (!selectedCard || !doctorMessageInput.trim()) return;

    setIsSendingMessage(true);
    const newMsg: InquiryMessage = {
      id: `msg-${Date.now()}`,
      sender: 'doctor',
      senderName: "Dr. Prem Raj Joshi's Clinical Team",
      message: doctorMessageInput.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedCard: PatientInquiry = {
      ...selectedCard,
      doctorNotes,
      prescribedAdvice,
      status: editStatus,
      messages: [...(selectedCard.messages || []), newMsg]
    };

    const updated = mergeAndNormalizeInquiries([updatedCard], safeInquiries);
    onUpdateInquiries(updated);
    const result = await updatePatientInquiry(updatedCard);
    setSelectedCard(updatedCard);
    setDoctorMessageInput('');
    setIsSendingMessage(false);

    if (result.syncedToFirebase) {
      showToast('✓ Message sent to patient and updated live in Firebase!');
    } else {
      showToast('Message sent and saved locally.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this patient record permanently?')) {
      const updated = safeInquiries.filter((i) => i.id !== id && i.trackingId !== id);
      onUpdateInquiries(updated);
      const result = await deletePatientInquiry(id);
      if (selectedCard?.id === id) setSelectedCard(null);
      if (result.syncedToFirebase) {
        showToast('✓ Record deleted locally and removed globally from Firebase.');
      } else {
        showToast('Record deleted locally.');
      }
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-neutral-200">
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-emerald-600 bg-white mx-auto mb-3 shadow-xs">
              <img
                src={branding?.logoUrl || '/src/assets/images/doctor_portrait_1791392878397.jpg'}
                alt="Dr. Prem Raj Joshi"
                className="w-full h-full object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 font-editorial">
              Patient Inquiries Portal
            </h2>
            <p className="text-xs text-neutral-500 mt-1 font-mono">
              Direct Doctor Access (/inq-prem)
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Doctor / Desk ID
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="doctor or admin@premrajjoshi.com.np"
                className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
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
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isLoggingIn ? 'Signing In...' : 'Access Inquiries Portal'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onBackToSite}
              className="text-xs text-neutral-500 hover:text-neutral-900 font-semibold"
            >
              ← Return to Public Website
            </button>
          </div>
        </div>
      </div>
    );
  }

  const doctorPhoto = branding?.logoUrl || '/src/assets/images/doctor_portrait_1791392878397.jpg';

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header with synchronized avatar */}
      <header className="bg-neutral-900 text-white px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 border-b border-neutral-800">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onBackToSite}
            className="p-1.5 rounded-lg bg-neutral-800 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Public Site</span>
          </button>
          <div className="h-5 w-px bg-neutral-700 shrink-0" />
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-emerald-400 bg-white shrink-0">
              <img src={doctorPhoto} alt="Dr. Joshi" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-base font-bold tracking-tight font-editorial leading-tight truncate">
                Patient Inquiries & Consultation Desk
              </h1>
              <p className="text-[10px] text-emerald-400 font-mono truncate">
                Live Connected · /inq-prem
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-2.5 sm:px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 md:p-8 space-y-6 flex-1">
        {toastMsg && (
          <div className="p-3.5 bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/90 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['all', 'Pending', 'In Review', 'Confirmed', 'Completed', 'Cancelled'].map((st) => {
              const count =
                st === 'all'
                  ? safeInquiries.length
                  : safeInquiries.filter((i) => (i.status || 'Pending') === st).length;
              return (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-emerald-800 text-white'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {st === 'all' ? `All (${count})` : `${st} (${count})`}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Tracking ID, Name, Phone..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInquiries.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-3xl border border-neutral-200 p-8">
              <Inbox className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-600">No patient inquiries match your filters.</p>
              <button
                onClick={() => { setStatusFilter('all'); setSearchTerm(''); }}
                className="mt-3 text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredInquiries.map((inq) => (
              <div
                key={inq.id}
                onClick={() => handleOpenCard(inq)}
                className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Bar: Tracking ID & Status */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {inq.trackingId || inq.id}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        inq.status === 'Pending'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : inq.status === 'In Review'
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : inq.status === 'Confirmed'
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : inq.status === 'Completed'
                          ? 'bg-purple-100 text-purple-900 border border-purple-300'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {inq.status}
                    </span>
                  </div>

                  {/* Patient Name */}
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 group-hover:text-emerald-800 transition-colors font-editorial leading-snug">
                      {inq.fullName}
                    </h3>
                    <div className="text-xs text-neutral-500 font-medium">
                      Age: <strong className="text-neutral-700">{inq.age}</strong> yrs · Gender: <strong className="text-neutral-700">{inq.gender}</strong>
                    </div>
                  </div>

                  {/* Contact & Location Badges */}
                  <div className="space-y-1 text-xs text-neutral-600 font-mono">
                    <p className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{inq.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{inq.district || 'Nepal'}, {inq.province}</span>
                    </p>
                  </div>

                  {/* Request Type & Tags */}
                  <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-bold rounded border border-emerald-200/60">
                      {inq.requestType}
                    </span>
                    {inq.attachment && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded border border-amber-200">
                        <Paperclip className="w-3 h-3 text-amber-600" />
                        <span>Attached</span>
                      </span>
                    )}
                    {(inq.messages || []).length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-sky-50 text-sky-800 text-[10px] font-bold rounded border border-sky-200">
                        <MessageCircle className="w-3 h-3 text-sky-600" />
                        <span>{(inq.messages || []).length} msg</span>
                      </span>
                    )}
                    {inq.patientReview && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded border border-amber-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{inq.patientReview.rating}★ Review</span>
                      </span>
                    )}
                  </div>

                  {/* Symptoms Snippet */}
                  <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-700 line-clamp-2 leading-relaxed border border-neutral-100 font-nepali">
                    {inq.problemDetails}
                  </div>
                </div>

                {/* Footer action hint */}
                <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-900">
                  <span>View & Respond</span>
                  <span>→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full Patient Detail Modal with Doctor Communication */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Modal Top */}
            <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold font-editorial">
                    Patient: {selectedCard.fullName}
                  </h3>
                  <button
                    onClick={() => handleCopyId(selectedCard.trackingId || selectedCard.id)}
                    className="px-2 py-0.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-300 font-mono text-[11px] rounded border border-neutral-700 flex items-center gap-1 cursor-pointer"
                    title="Copy unique tracking ID"
                  >
                    <span>{selectedCard.trackingId || selectedCard.id}</span>
                    {copiedId ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
                <span className="text-[11px] text-neutral-400 font-mono">
                  Submitted {new Date(selectedCard.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-neutral-800 flex-1">
              {/* Patient Basic Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-neutral-50 p-4 rounded-2xl border border-neutral-200">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Patient Name</span>
                  <strong className="text-sm text-neutral-900">{selectedCard.fullName}</strong>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Age / Gender</span>
                  <span>{selectedCard.age} yrs · {selectedCard.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Phone Number</span>
                  <span className="font-mono font-bold text-emerald-800">{selectedCard.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Email</span>
                  <span>{selectedCard.email || 'None provided'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Request Type</span>
                  <span className="font-bold text-neutral-900">{selectedCard.requestType}</span>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Preferred Timing</span>
                  <span>{selectedCard.preferredDate || 'Flexible'}</span>
                </div>
                <div className="col-span-2 sm:col-span-3">
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Nepal Address</span>
                  <span className="font-medium text-neutral-800">
                    {selectedCard.toleName ? `Tole: ${selectedCard.toleName}, ` : ''}
                    {selectedCard.wardNo ? `Ward No: ${selectedCard.wardNo}, ` : ''}
                    {selectedCard.municipality}, {selectedCard.district}, {selectedCard.province}
                  </span>
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <span className="font-bold text-neutral-900 block mb-1">Health Symptoms & Chief Complaints:</span>
                <div className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-xl leading-relaxed whitespace-pre-line text-neutral-800 text-xs font-nepali">
                  {selectedCard.problemDetails}
                </div>
              </div>

              {/* Uploaded Patient Content: Prescription / Lab Report */}
              {selectedCard.attachment && (
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 flex items-center gap-1.5 text-xs">
                      <Paperclip className="w-4 h-4 text-emerald-700" />
                      <span>Uploaded Patient Content (Prescription / Lab Document):</span>
                    </span>
                    <span className="text-[11px] font-mono text-neutral-500 bg-neutral-200 px-2 py-0.5 rounded">
                      {selectedCard.attachment.size || 'Attachment'}
                    </span>
                  </div>

                  {selectedCard.attachment.url &&
                  (selectedCard.attachment.type?.includes('image') || selectedCard.attachment.url.startsWith('data:image/')) ? (
                    <div className="space-y-3">
                      <div className="max-h-72 overflow-hidden rounded-xl border border-neutral-200 bg-white flex items-center justify-center p-2 shadow-2xs">
                        <img
                          src={selectedCard.attachment.url}
                          alt="Patient uploaded prescription"
                          className="max-h-64 object-contain rounded-lg"
                        />
                      </div>
                      <a
                        href={selectedCard.attachment.url}
                        download={selectedCard.attachment.name || 'prescription_image.jpg'}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Full File ({selectedCard.attachment.name})</span>
                      </a>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-rose-600 shrink-0" />
                        <div>
                          <p className="font-bold text-neutral-900 text-xs">{selectedCard.attachment.name}</p>
                          <p className="text-[10px] text-neutral-400 font-mono">{selectedCard.attachment.size || 'PDF Document'}</p>
                        </div>
                      </div>
                      <a
                        href={selectedCard.attachment.url}
                        download={selectedCard.attachment.name || 'patient_record.pdf'}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Document</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Doctor Clinical Notes & Status Editor */}
              <div className="space-y-4 pt-2 border-t border-neutral-200">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-bold text-neutral-900">Doctor Clinical Notes & Diagnosis:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-600 font-semibold">Status:</span>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as InquiryStatus)}
                      className="px-2.5 py-1 text-xs border border-neutral-300 rounded-lg bg-white font-bold text-neutral-900"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Review">In Review</option>
                      <option value="Confirmed">Confirmed</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <textarea
                  rows={2}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Enter medical evaluation notes, Prakriti analysis, diagnosis..."
                  className="w-full p-3 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />

                <span className="font-bold text-neutral-900 block">Prescribed Ayurvedic Herbs / Diet Advice:</span>
                <textarea
                  rows={2}
                  value={prescribedAdvice}
                  onChange={(e) => setPrescribedAdvice(e.target.value)}
                  placeholder="e.g. Amalaki Churna with warm water before meals, avoid spicy dishes..."
                  className="w-full p-3 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              {/* Messages / Communication with Patient */}
              <div className="space-y-3 pt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-700" />
                    <span>Direct Communication with Patient (Shown in Patient Tracking):</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">
                    {(selectedCard.messages || []).length} messages
                  </span>
                </div>

                <div className="bg-neutral-50 rounded-2xl p-3 border border-neutral-200 space-y-2.5 max-h-48 overflow-y-auto">
                  {(selectedCard.messages || []).length === 0 ? (
                    <p className="text-xs text-neutral-400 italic text-center py-1">
                      No message history yet. Send an update or confirmation below.
                    </p>
                  ) : (
                    (selectedCard.messages || []).map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          msg.sender === 'doctor' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs shadow-2xs ${
                            msg.sender === 'doctor'
                              ? 'bg-emerald-800 text-white rounded-br-xs'
                              : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-xs'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className={`text-[10px] font-bold ${msg.sender === 'doctor' ? 'text-emerald-200' : 'text-emerald-700'}`}>
                              {msg.senderName}
                            </span>
                            <span className={`text-[9px] ${msg.sender === 'doctor' ? 'text-emerald-300' : 'text-neutral-400'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="font-nepali whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Send Doctor Message to Patient */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={doctorMessageInput}
                    onChange={(e) => setDoctorMessageInput(e.target.value)}
                    placeholder="Type appointment time, prescription details or advice for patient..."
                    className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendDoctorMessage();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleSendDoctorMessage}
                    disabled={isSendingMessage || !doctorMessageInput.trim()}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </div>
              </div>

              {/* Patient Review & Rating (if submitted) */}
              {selectedCard.patientReview && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-neutral-900 flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>Patient Feedback Review:</span>
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {Array.from({ length: selectedCard.patientReview.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-700 font-nepali italic">
                    "{selectedCard.patientReview.comment}"
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                <button
                  onClick={() => handleDelete(selectedCard.id)}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Record</span>
                </button>

                <button
                  onClick={handleSaveModal}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
                >
                  Save Notes & Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

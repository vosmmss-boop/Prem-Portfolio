import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import {
  PatientInquiry,
  InquiryType,
  InquiryAttachment,
  InquiryMessage,
  PatientReview
} from '../../types';
import {
  submitPatientInquiry,
  updatePatientInquiry,
  getLocal,
  STORAGE_KEYS
} from '../../services/firebase';
import { initialPatientInquiries } from '../../data/initialData';
import {
  MessageSquare,
  X,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  MapPin,
  HeartHandshake,
  Paperclip,
  FileText,
  Upload,
  Search,
  Copy,
  Check,
  Star,
  MessageCircle,
  Stethoscope,
  AlertCircle
} from 'lucide-react';

interface NamasteWidgetProps {
  doctorPhone?: string;
  doctorImage?: string;
  inquiries?: PatientInquiry[];
  onInquirySubmitted?: (inquiry: PatientInquiry) => void;
  onInquiryUpdated?: (inquiry: PatientInquiry) => void;
  isOpenExternal?: boolean;
  onCloseExternal?: () => void;
  defaultTab?: 'book' | 'track';
}

const PROVINCES_NEPAL = [
  'Koshi Province',
  'Madhesh Province',
  'Bagmati Province',
  'Gandaki Province',
  'Lumbini Province',
  'Karnali Province',
  'Sudurpashchim Province'
];

export const NamasteWidget: React.FC<NamasteWidgetProps> = ({
  doctorPhone = '9779848721200',
  doctorImage,
  inquiries: propInquiries,
  onInquirySubmitted,
  onInquiryUpdated,
  isOpenExternal,
  onCloseExternal,
  defaultTab = 'book'
}) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'book' | 'track'>(defaultTab);

  // Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [province, setProvince] = useState(PROVINCES_NEPAL[2]); // Bagmati
  const [district, setDistrict] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [wardNo, setWardNo] = useState('');
  const [toleName, setToleName] = useState('');
  const [requestType, setRequestType] = useState<InquiryType>('Appointment');
  const [problemDetails, setProblemDetails] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [attachment, setAttachment] = useState<InquiryAttachment | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [generatedTrackingId, setGeneratedTrackingId] = useState('');
  const [copiedId, setCopiedId] = useState(false);

  // Tracking Tab State
  const [trackSearchQuery, setTrackSearchQuery] = useState('');
  const [foundInquiry, setFoundInquiry] = useState<PatientInquiry | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Patient Message & Review in Tracking Tab
  const [patientReplyText, setPatientReplyText] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmittedSuccess, setReviewSubmittedSuccess] = useState(false);

  // Sync external open triggers (e.g. from header button or #track link)
  useEffect(() => {
    if (isOpenExternal !== undefined) {
      setIsOpen(isOpenExternal);
    }
  }, [isOpenExternal]);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  // Handle direct file upload from user device (image or PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachment({
        name: file.name,
        url: result,
        size: sizeStr,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !problemDetails.trim()) {
      alert(
        language === 'np'
          ? 'कृपया सबै आवश्यक विवरण भर्नुहोस्।'
          : 'Please fill all required fields (Name, Phone, Symptoms).'
      );
      return;
    }

    setIsSubmitting(true);

    // Generate unique, memorable tracking code e.g. PRJ-842109
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const trackingId = `PRJ-${randomCode}`;

    const newInquiry: PatientInquiry = {
      id: `inq-${Date.now().toString(36)}`,
      trackingId,
      createdAt: new Date().toISOString(),
      fullName: fullName.trim(),
      age: age.trim() || 'N/A',
      gender,
      phone: phone.trim(),
      email: email.trim(),
      province,
      district: district.trim(),
      municipality: municipality.trim(),
      wardNo: wardNo.trim(),
      toleName: toleName.trim(),
      requestType,
      problemDetails: problemDetails.trim(),
      preferredDate: preferredDate.trim(),
      status: 'Pending',
      attachment: attachment || undefined,
      messages: [
        {
          id: `msg-${Date.now()}`,
          sender: 'doctor',
          senderName: "Dr. Prem Raj Joshi's Desk",
          message:
            language === 'np'
              ? 'नमस्ते! तपाईंको परामर्श अनुरोध क्लिनिकल डेस्कमा प्राप्त भएको छ। चिकित्सक टोलीले चाँडै समीक्षा गर्नेछ।'
              : 'Namaste! Your consultation request has been received by Dr. Joshi\'s clinical desk. Our team will review your symptoms shortly.',
          timestamp: new Date().toISOString()
        }
      ]
    };

    try {
      await submitPatientInquiry(newInquiry);
      if (onInquirySubmitted) {
        onInquirySubmitted(newInquiry);
      }
      setGeneratedTrackingId(trackingId);
      setSubmittedSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTrackingId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleResetForm = () => {
    setFullName('');
    setAge('');
    setPhone('');
    setEmail('');
    setDistrict('');
    setMunicipality('');
    setWardNo('');
    setToleName('');
    setProblemDetails('');
    setPreferredDate('');
    setAttachment(null);
    setSubmittedSuccess(false);
    setGeneratedTrackingId('');
    setIsOpen(false);
    if (onCloseExternal) onCloseExternal();
  };

  // Search for appointment by Tracking ID, Phone, or Name
  const handleSearchTracking = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!trackSearchQuery.trim()) return;

    setHasSearched(true);
    const query = trackSearchQuery.trim().toLowerCase();
    const allInquiries = propInquiries || getLocal<PatientInquiry[]>(STORAGE_KEYS.INQUIRIES, initialPatientInquiries);

    const match = allInquiries.find((inq) => {
      const matchTracking = inq.trackingId && inq.trackingId.toLowerCase().includes(query);
      const matchId = inq.id.toLowerCase().includes(query);
      const matchPhone = inq.phone.replace(/[^\d]/g, '').includes(query.replace(/[^\d]/g, ''));
      const matchName = inq.fullName.toLowerCase().includes(query);
      return matchTracking || matchId || matchPhone || matchName;
    });

    setFoundInquiry(match || null);
  };

  // Patient sends a reply / follow-up message to the clinical team
  const handleSendPatientReply = async () => {
    if (!foundInquiry || !patientReplyText.trim()) return;

    setIsSendingReply(true);
    const newMsg: InquiryMessage = {
      id: `msg-${Date.now()}`,
      sender: 'patient',
      senderName: foundInquiry.fullName,
      message: patientReplyText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedInquiry: PatientInquiry = {
      ...foundInquiry,
      messages: [...(foundInquiry.messages || []), newMsg]
    };

    await updatePatientInquiry(updatedInquiry);
    setFoundInquiry(updatedInquiry);
    if (onInquiryUpdated) onInquiryUpdated(updatedInquiry);
    setPatientReplyText('');
    setIsSendingReply(false);
  };

  // Patient leaves a review
  const handleSubmitReview = async () => {
    if (!foundInquiry || !reviewComment.trim()) return;

    setIsSubmittingReview(true);
    const review: PatientReview = {
      rating: reviewRating,
      comment: reviewComment.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedInquiry: PatientInquiry = {
      ...foundInquiry,
      patientReview: review
    };

    await updatePatientInquiry(updatedInquiry);
    setFoundInquiry(updatedInquiry);
    if (onInquiryUpdated) onInquiryUpdated(updatedInquiry);
    setIsSubmittingReview(false);
    setReviewSubmittedSuccess(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Confirmed & Scheduled</span>
          </span>
        );
      case 'In Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-300">
            <Clock className="w-3.5 h-3.5 text-sky-600" />
            <span>Under Clinical Review</span>
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Consultation Completed</span>
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Pending Initial Review</span>
          </span>
        );
    }
  };

  const currentDoctorPhoto = doctorImage || '/src/assets/images/doctor_portrait_1791392878397.jpg';

  return (
    <>
      {/* 1. Sticky Floating Action Badge on Bottom Right */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 print:hidden flex flex-col items-end">
        <button
          onClick={() => {
            setActiveTab('book');
            setIsOpen(true);
          }}
          className="group relative flex items-center gap-2.5 sm:gap-3 bg-gradient-to-r from-emerald-800 to-teal-700 text-white pl-2.5 pr-4 sm:pl-3.5 sm:pr-5 py-2 sm:py-2.5 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-emerald-400/40 cursor-pointer"
          aria-label={t('namaste_badge_text')}
        >
          {/* Synchronized doctor thumbnail on badge */}
          <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-emerald-300 bg-white shadow-xs shrink-0">
            <img
              src={currentDoctorPhoto}
              alt="Dr. Prem Raj Joshi"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="text-left">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-emerald-200 block font-semibold leading-none mb-0.5">
              Dr. Prem Raj Joshi
            </span>
            <span className="text-xs sm:text-sm font-semibold tracking-tight text-white block leading-tight font-nepali">
              {t('namaste_badge_text')}
            </span>
          </div>
        </button>
      </div>

      {/* 2. Interactive Appointment & Status Tracking Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[92vh] sm:max-h-[94vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-emerald-800/60">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-emerald-400 bg-white shadow-xs shrink-0">
                  <img
                    src={currentDoctorPhoto}
                    alt="Dr. Prem Raj Joshi"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 text-emerald-300 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase font-mono truncate">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="truncate">Dr. Prem Raj Joshi · BAMS, IOM, TU</span>
                  </div>
                  <h3 className="text-base sm:text-xl font-bold tracking-tight font-editorial leading-tight truncate">
                    {activeTab === 'book' ? t('namaste_modal_title') : 'Patient Appointment & Inquiry Tracker'}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onCloseExternal) onCloseExternal();
                }}
                className="p-2 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab Navigation: Keep normal appointment + Add Track your status */}
            <div className="flex border-b border-neutral-200 bg-neutral-50 px-3 sm:px-6 pt-2.5 sm:pt-3 gap-1.5 sm:gap-2 overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('book');
                  setSubmittedSuccess(false);
                }}
                className={`pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'book'
                    ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'np' ? 'परामर्श फारम' : 'Book Consultation'}</span>
              </button>

              <button
                onClick={() => setActiveTab('track')}
                className={`pb-2.5 sm:pb-3 px-3 sm:px-4 text-xs font-bold border-b-2 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'track'
                    ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-xl shadow-2xs'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800'
                }`}
              >
                <Search className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{language === 'np' ? 'स्थिति ट्र्याक गर्नुहोस्' : 'Track Status'}</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 sm:space-y-6 flex-1">
              {/* TAB 1: Normal Appointment Booking Form */}
              {activeTab === 'book' && (
                <>
                  {submittedSuccess ? (
                    <div className="text-center py-6 px-4 space-y-5">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <h4 className="text-2xl font-bold text-neutral-900 font-editorial">
                        {language === 'np' ? 'धन्यवाद! तपाईंको अनुरोध प्राप्त भयो।' : 'Appointment Request Received!'}
                      </h4>
                      <p className="text-xs text-neutral-600 max-w-md mx-auto leading-relaxed font-nepali">
                        {language === 'np'
                          ? 'तपाईंको सोधपुछ तथा अपोइन्टमेन्ट अनुरोध डा. जोशीको क्लिनिकमा सुरक्षित भएको छ। तपाईंले तलको ट्र्याकिङ कोड प्रयोग गरेर कुनै पनि समयमा स्थिति जाँच्न सक्नुहुन्छ।'
                          : 'Your consultation inquiry is securely logged. You can track your real-time status and message Dr. Joshi\'s team anytime using the tracking ID below.'}
                      </p>

                      {/* Prominent Generated Unique Tracking ID Card */}
                      <div className="bg-emerald-50/90 border-2 border-emerald-300 rounded-2xl p-4 max-w-md mx-auto text-left shadow-xs">
                        <div className="flex items-center justify-between mb-3 bg-white p-3 rounded-xl border border-emerald-200">
                          <div>
                            <span className="text-[10px] text-neutral-500 font-mono block uppercase">
                              Your Unique Tracking ID
                            </span>
                            <span className="text-lg font-black text-emerald-800 font-mono tracking-wider">
                              {generatedTrackingId}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopyTrackingId(generatedTrackingId)}
                            className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
                          </button>
                        </div>

                        <div className="text-xs text-emerald-950 space-y-1 font-mono">
                          <p>• <strong>Patient:</strong> {fullName}</p>
                          <p>• <strong>Phone:</strong> {phone}</p>
                          <p>• <strong>Type:</strong> {requestType}</p>
                          <p>• <strong>Status:</strong> <span className="text-emerald-700 font-bold">Pending Review</span></p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                        <button
                          onClick={() => {
                            setTrackSearchQuery(generatedTrackingId);
                            setActiveTab('track');
                            setSubmittedSuccess(false);
                            // Run search automatically
                            setTimeout(() => {
                              const all = propInquiries || getLocal<PatientInquiry[]>(STORAGE_KEYS.INQUIRIES, initialPatientInquiries);
                              const m = all.find((i) => i.trackingId === generatedTrackingId);
                              if (m) {
                                setFoundInquiry(m);
                                setHasSearched(true);
                              }
                            }, 50);
                          }}
                          className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <Search className="w-4 h-4" />
                          <span>Track Your Status Now</span>
                        </button>
                        <button
                          onClick={handleResetForm}
                          className="px-5 py-2.5 bg-neutral-200 text-neutral-700 rounded-xl text-xs font-bold hover:bg-neutral-300 transition-colors cursor-pointer"
                        >
                          {language === 'np' ? 'सम्पन्न भयो (बन्द गर्नुहोस्)' : 'Done & Close'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitInquiry} className="space-y-5">
                      {/* Row 1: Personal info */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="sm:col-span-6">
                          <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            {t('form_full_name')} <span className="text-rose-500">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder={t('form_full_name_ph')}
                              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            {t('form_age')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="120"
                            value={age}
                            onChange={(e) => setAge(e.target.value)}
                            placeholder="e.g. 38"
                            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            {t('form_gender')}
                          </label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                          >
                            <option value="Male">{t('form_gender_male')}</option>
                            <option value="Female">{t('form_gender_female')}</option>
                            <option value="Other">{t('form_gender_other')}</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Contact info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            {t('form_phone')} <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+977-98XXXXXXXX"
                            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            {t('form_email')}
                          </label>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="patient@example.com"
                            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white"
                          />
                        </div>
                      </div>

                      {/* Row 3: Address fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            {t('form_province')}
                          </label>
                          <select
                            value={province}
                            onChange={(e) => setProvince(e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                          >
                            {PROVINCES_NEPAL.map((p) => (
                              <option key={p} value={p}>{p}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            {t('form_district')}
                          </label>
                          <input
                            type="text"
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            placeholder="e.g. Kathmandu / Kailali"
                            className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 mb-1">
                            {t('form_municipality')}
                          </label>
                          <input
                            type="text"
                            value={municipality}
                            onChange={(e) => setMunicipality(e.target.value)}
                            placeholder="e.g. Maharajgunj"
                            className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                          />
                        </div>
                      </div>

                      {/* Row 4: Request Type & Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            {t('form_request_type')}
                          </label>
                          <select
                            value={requestType}
                            onChange={(e) => setRequestType(e.target.value as InquiryType)}
                            className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white"
                          >
                            <option value="Appointment">{t('form_req_appointment')}</option>
                            <option value="Only Prescription">{t('form_req_prescription')}</option>
                            <option value="Follow-up Consultation">{t('form_req_followup')}</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-neutral-700 mb-1">
                            {t('form_preferred_date')}
                          </label>
                          <div className="relative">
                            <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                            <input
                              type="text"
                              value={preferredDate}
                              onChange={(e) => setPreferredDate(e.target.value)}
                              placeholder="e.g. Tomorrow 11:00 AM"
                              className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Row 5: Symptoms Details */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          {t('form_problem_details')} <span className="text-rose-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={problemDetails}
                          onChange={(e) => setProblemDetails(e.target.value)}
                          placeholder={t('form_problem_ph')}
                          className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                        />
                      </div>

                      {/* Row 6: Attachment */}
                      <div>
                        <label className="block text-xs font-semibold text-neutral-700 mb-1">
                          {t('form_attachment')}
                        </label>
                        <div className="border border-dashed border-neutral-300 rounded-xl p-3 bg-neutral-50/70 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-neutral-600">
                            <Upload className="w-4 h-4 text-emerald-700" />
                            <span>{attachment ? `${attachment.name} (${attachment.size})` : 'Upload past report or prescription (Image/PDF)'}</span>
                          </div>
                          <label className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 cursor-pointer hover:bg-neutral-100">
                            <span>Browse</span>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={handleFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsOpen(false);
                            if (onCloseExternal) onCloseExternal();
                          }}
                          className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{isSubmitting ? 'Submitting...' : t('form_submit')}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* TAB 2: Track Your Status & Doctor Communication */}
              {activeTab === 'track' && (
                <div className="space-y-6">
                  {/* Search Bar */}
                  <form onSubmit={handleSearchTracking} className="space-y-2">
                    <label className="block text-xs font-bold text-neutral-800">
                      Search by Unique Tracking ID, Phone Number, or Full Name:
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={trackSearchQuery}
                          onChange={(e) => setTrackSearchQuery(e.target.value)}
                          placeholder="e.g. PRJ-10248 or 9851023456 or Ramesh"
                          className="w-full pl-9 pr-4 py-2 text-xs border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs font-mono"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>Search</span>
                      </button>
                    </div>
                  </form>

                  {/* Search Result */}
                  {hasSearched && !foundInquiry && (
                    <div className="text-center py-8 bg-neutral-50 rounded-2xl border border-neutral-200 p-6 space-y-2">
                      <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                      <h5 className="font-bold text-sm text-neutral-800">No matching appointment record found</h5>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        Please check the tracking ID or phone number entered. You can also book a fresh consultation in the first tab.
                      </p>
                    </div>
                  )}

                  {foundInquiry && (
                    <div className="space-y-6 animate-in fade-in">
                      {/* Status Card Header */}
                      <div className="bg-gradient-to-br from-emerald-50/60 to-teal-50/40 border border-emerald-200 rounded-2xl p-5 space-y-4 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-200/80 pb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-extrabold text-emerald-900 bg-emerald-200/80 px-2 py-0.5 rounded-md">
                                {foundInquiry.trackingId || foundInquiry.id}
                              </span>
                              <span className="text-[11px] text-neutral-500">
                                {new Date(foundInquiry.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <h4 className="text-lg font-bold text-neutral-900 mt-1 font-editorial">
                              {foundInquiry.fullName}
                            </h4>
                            <p className="text-xs text-neutral-600 font-nepali">
                              {foundInquiry.phone} · {foundInquiry.province}, {foundInquiry.district}
                            </p>
                          </div>

                          <div>
                            {getStatusBadge(foundInquiry.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="bg-white p-3 rounded-xl border border-neutral-200/80">
                            <span className="text-[10px] text-neutral-400 font-mono uppercase block">Request Type</span>
                            <span className="font-bold text-neutral-800">{foundInquiry.requestType}</span>
                          </div>
                          <div className="bg-white p-3 rounded-xl border border-neutral-200/80">
                            <span className="text-[10px] text-neutral-400 font-mono uppercase block">Preferred Time</span>
                            <span className="font-bold text-neutral-800">{foundInquiry.preferredDate || 'Flexible / Doctor\'s availability'}</span>
                          </div>
                        </div>

                        {/* Doctor Prescribed Advice & Clinical Notes */}
                        {(foundInquiry.doctorNotes || foundInquiry.prescribedAdvice) && (
                          <div className="bg-white border-2 border-emerald-300 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                              <Stethoscope className="w-4 h-4 text-emerald-600" />
                              <span>Clinical Guidance by Dr. Prem Raj Joshi:</span>
                            </div>
                            {foundInquiry.prescribedAdvice && (
                              <p className="text-xs text-neutral-800 leading-relaxed font-nepali pl-6 border-l-2 border-emerald-500">
                                {foundInquiry.prescribedAdvice}
                              </p>
                            )}
                            {foundInquiry.doctorNotes && (
                              <p className="text-[11px] text-neutral-600 pl-6 border-l-2 border-emerald-200">
                                Note: {foundInquiry.doctorNotes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Doctor & Patient Messages Thread */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                            <MessageCircle className="w-4 h-4 text-emerald-600" />
                            <span>Clinical Desk Messages & Patient Communication</span>
                          </h5>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {(foundInquiry.messages || []).length} messages
                          </span>
                        </div>

                        <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-3 max-h-56 overflow-y-auto">
                          {(foundInquiry.messages || []).length === 0 ? (
                            <p className="text-xs text-neutral-400 italic text-center py-2">
                              No messages yet. Send a question below to Dr. Joshi's team.
                            </p>
                          ) : (
                            (foundInquiry.messages || []).map((msg) => (
                              <div
                                key={msg.id}
                                className={`flex flex-col ${
                                  msg.sender === 'patient' ? 'items-end' : 'items-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs ${
                                    msg.sender === 'patient'
                                      ? 'bg-emerald-700 text-white rounded-br-xs'
                                      : 'bg-white text-neutral-900 border border-neutral-200 rounded-bl-xs'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[10px] font-bold ${msg.sender === 'patient' ? 'text-emerald-200' : 'text-emerald-700'}`}>
                                      {msg.senderName}
                                    </span>
                                    <span className={`text-[9px] ${msg.sender === 'patient' ? 'text-emerald-300' : 'text-neutral-400'}`}>
                                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="leading-relaxed font-nepali whitespace-pre-wrap">{msg.message}</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                        {/* Patient Reply Composer */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={patientReplyText}
                            onChange={(e) => setPatientReplyText(e.target.value)}
                            placeholder="Type a follow-up query or symptom update for the doctor..."
                            className="flex-1 px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleSendPatientReply();
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleSendPatientReply}
                            disabled={isSendingReply || !patientReplyText.trim()}
                            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{isSendingReply ? 'Sending...' : 'Send'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Patient Review & Feedback Box */}
                      <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 space-y-3">
                        <h5 className="text-xs font-bold text-neutral-800 flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span>Patient Experience Review & Rating</span>
                        </h5>

                        {foundInquiry.patientReview ? (
                          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-1.5">
                            <div className="flex items-center gap-1 text-amber-500">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-3.5 h-3.5 ${
                                    i < foundInquiry.patientReview!.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                                  }`}
                                />
                              ))}
                              <span className="text-xs font-bold text-neutral-700 ml-1">
                                {foundInquiry.patientReview.rating}/5
                              </span>
                            </div>
                            <p className="text-xs text-neutral-700 font-nepali italic">
                              "{foundInquiry.patientReview.comment}"
                            </p>
                            <span className="text-[10px] text-neutral-400 block">
                              Submitted on {new Date(foundInquiry.patientReview.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-600">Your Rating:</span>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewRating(star)}
                                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea
                              rows={2}
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                              placeholder="Share your experience with Dr. Joshi's consultation or treatment..."
                              className="w-full px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-nepali"
                            />
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={handleSubmitReview}
                                disabled={isSubmittingReview || !reviewComment.trim()}
                                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                              >
                                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

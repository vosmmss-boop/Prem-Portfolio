import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { PatientInquiry, InquiryType, InquiryAttachment } from '../../types';
import { submitPatientInquiry } from '../../services/firebase';
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
  Trash2,
  Upload
} from 'lucide-react';

interface NamasteWidgetProps {
  doctorPhone?: string;
  onInquirySubmitted?: (inquiry: PatientInquiry) => void;
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
  onInquirySubmitted
}) => {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

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

  // Handle direct file upload from user device (image or PDF)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeStr = file.size > 1024 * 1024
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
      alert(language === 'np' ? 'कृपया सबै आवश्यक विवरण भर्नुहोस्।' : 'Please fill all required fields (Name, Phone, Symptoms).');
      return;
    }

    setIsSubmitting(true);

    const newInquiry: PatientInquiry = {
      id: `inq-${Date.now().toString(36)}`,
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
      attachment: attachment || undefined
    };

    try {
      await submitPatientInquiry(newInquiry);
      if (onInquirySubmitted) {
        onInquirySubmitted(newInquiry);
      }
      setSubmittedSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
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
    setIsOpen(false);
  };

  return (
    <>
      {/* 1. Sticky Floating Action Badge on Bottom Right */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden flex flex-col items-end">
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-800 to-teal-700 text-white pl-4 pr-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-emerald-400/40 cursor-pointer"
          aria-label={t('namaste_badge_text')}
        >
          {/* Animated pulse ring */}
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300" />
          </span>

          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-emerald-100 group-hover:rotate-12 transition-transform">
            <HeartHandshake className="w-5 h-5 text-amber-300" />
          </div>

          <div className="text-left">
            <span className="text-[11px] uppercase tracking-wider text-emerald-200 block font-semibold leading-none mb-0.5">
              Dr. Prem Raj Joshi
            </span>
            <span className="text-sm font-semibold tracking-tight text-white block leading-tight font-nepali">
              {t('namaste_badge_text')}
            </span>
          </div>
        </button>
      </div>

      {/* 2. Interactive Appointment & Prescription Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[92vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-900 to-teal-800 text-white px-6 py-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-semibold tracking-wider uppercase mb-1">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Dr. Prem Raj Joshi · BAMS (IOM, TU)</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight font-editorial">
                  {t('namaste_modal_title')}
                </h3>
                <p className="text-xs text-emerald-100/90 mt-1">
                  {t('namaste_modal_subtitle')}
                </p>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {submittedSuccess ? (
                <div className="text-center py-10 px-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h4 className="text-2xl font-bold text-neutral-900 font-editorial">
                    {language === 'np' ? 'धन्यवाद!' : 'Thank you!'}
                  </h4>
                  <p className="text-sm font-semibold text-emerald-900 max-w-md mx-auto leading-relaxed font-nepali">
                    {language === 'np'
                      ? 'तपाईंको सोधपुछ तथा अपोइन्टमेन्ट अनुरोध प्राप्त भएको छ। हाम्रो टोलीले चाँडै सम्पर्क गर्नेछ।'
                      : 'Thank you! Your appointment request has been received. Our team will contact you soon.'}
                  </p>
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 max-w-md mx-auto text-left text-xs text-emerald-950 space-y-1.5 font-mono">
                    <p>• <strong>Patient:</strong> {fullName}</p>
                    <p>• <strong>Phone:</strong> {phone}</p>
                    <p>• <strong>Request Type:</strong> {requestType}</p>
                    {attachment && (
                      <p>• <strong>Uploaded File:</strong> {attachment.name} ({attachment.size})</p>
                    )}
                    <p>• <strong>Status:</strong> Received by Doctor's Desk</p>
                  </div>
                  <div className="flex items-center justify-center pt-3">
                    <button
                      onClick={handleResetForm}
                      className="px-6 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
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
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Email (Optional)
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

                  {/* Row 3: Address Section (Nepal Localization) */}
                  <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-700 uppercase tracking-wide">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Address in Nepal / ठेगाना</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
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
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          {t('form_district')}
                        </label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder={t('form_district_ph')}
                          className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          {t('form_municipality')}
                        </label>
                        <input
                          type="text"
                          value={municipality}
                          onChange={(e) => setMunicipality(e.target.value)}
                          placeholder={t('form_municipality_ph')}
                          className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          {t('form_ward')}
                        </label>
                        <input
                          type="text"
                          value={wardNo}
                          onChange={(e) => setWardNo(e.target.value)}
                          placeholder="e.g. 03"
                          className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-neutral-600 mb-1">
                          {t('form_tole')}
                        </label>
                        <input
                          type="text"
                          value={toleName}
                          onChange={(e) => setToleName(e.target.value)}
                          placeholder="e.g. Chakrapath / Main Road"
                          className="w-full px-2.5 py-1.5 text-xs border border-neutral-300 rounded-lg bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Request Type & Preferred Timing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        {t('form_request_type')}
                      </label>
                      <select
                        value={requestType}
                        onChange={(e) => setRequestType(e.target.value as InquiryType)}
                        className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                      >
                        <option value="Appointment">{t('form_type_appointment')}</option>
                        <option value="Only Prescription">{t('form_type_prescription')}</option>
                        <option value="Follow-up Consultation">{t('form_type_followup')}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-neutral-700 mb-1">
                        Preferred Date/Time (Optional)
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          placeholder="e.g. Sunday afternoon"
                          className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 5: Symptoms Details */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      {t('form_problems')} <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={problemDetails}
                      onChange={(e) => setProblemDetails(e.target.value)}
                      placeholder={t('form_problems_ph')}
                      className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent bg-white resize-y"
                    />
                  </div>

                  {/* Row 6: Direct Device Upload for Prescriptions & Lab Reports */}
                  <div className="bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                    <label className="block text-xs font-semibold text-neutral-800 mb-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Upload Prescription / Lab Report (Direct from Device)</span>
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">Optional (Image/PDF)</span>
                    </label>

                    {attachment ? (
                      <div className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-emerald-300 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          {attachment.type?.includes('image') ? (
                            <img src={attachment.url} alt="preview" className="w-8 h-8 rounded object-cover border" />
                          ) : (
                            <FileText className="w-6 h-6 text-rose-600 shrink-0" />
                          )}
                          <div className="truncate">
                            <span className="font-semibold text-neutral-900 block truncate">{attachment.name}</span>
                            <span className="text-[10px] text-neutral-400 font-mono">{attachment.size}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachment(null)}
                          className="p-1 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded"
                          title="Remove file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-neutral-300 hover:border-emerald-600 rounded-xl bg-white cursor-pointer transition-colors text-xs text-neutral-600 hover:text-emerald-700">
                        <Upload className="w-4 h-4 text-emerald-700" />
                        <span>Choose file from phone or computer (Image or PDF)</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* Action Button: Submit Inquiry directly to doctor desk */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 text-sm font-bold text-white bg-emerald-700 hover:bg-emerald-800 disabled:bg-neutral-400 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>{t('form_submitting')}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{t('form_submit_btn')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { PatientInquiry, InquiryStatus } from '../../types';
import { saveNodeData } from '../../services/firebase';
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
  Download
} from 'lucide-react';


interface InquiriesPortalProps {
  inquiries: PatientInquiry[];
  onUpdateInquiries: (inqs: PatientInquiry[]) => void;
  onBackToSite: () => void;
}

export const InquiriesPortal: React.FC<InquiriesPortalProps> = ({
  inquiries,
  onUpdateInquiries,
  onBackToSite
}) => {
  const { isAdmin, login, logout } = useAuth();
  const { language } = useLanguage();

  // Login form state if unauthenticated (empty defaults)
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
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-neutral-200">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-8 h-8" />
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
                placeholder="Enter doctor or admin username"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Security Password
              </label>
              <input
                type="password"
                required
                placeholder="Enter password"
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
              {isLoggingIn ? 'Authenticating...' : 'Access Inquiries'}
            </button>

            <button
              type="button"
              onClick={onBackToSite}
              className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-800 transition-colors"
            >
              ← Return to Main Website
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const matchesSearch =
      inq.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.phone.includes(searchTerm) ||
      inq.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inq.problemDetails.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleOpenCard = (inq: PatientInquiry) => {
    setSelectedCard(inq);
    setDoctorNotes(inq.doctorNotes || '');
    setPrescribedAdvice(inq.prescribedAdvice || '');
    setEditStatus(inq.status);
  };

  const handleSaveModal = async () => {
    if (!selectedCard) return;
    const updated = inquiries.map((item) =>
      item.id === selectedCard.id
        ? {
            ...item,
            doctorNotes,
            prescribedAdvice,
            status: editStatus
          }
        : item
    );
    onUpdateInquiries(updated);
    await saveNodeData('patient_inquiries', 'dr_joshi_patient_inquiries', updated);
    setSelectedCard({
      ...selectedCard,
      doctorNotes,
      prescribedAdvice,
      status: editStatus
    });
    showToast('Patient record saved and synced.');
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this patient record permanently?')) {
      const updated = inquiries.filter((i) => i.id !== id);
      onUpdateInquiries(updated);
      await saveNodeData('patient_inquiries', 'dr_joshi_patient_inquiries', updated);
      if (selectedCard?.id === id) setSelectedCard(null);
      showToast('Record deleted.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col">
      {/* Header */}
      <header className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between border-b border-neutral-800">
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
            <h1 className="text-base font-bold tracking-tight font-editorial">
              Patient Inquiries & Consultation Cards
            </h1>
            <p className="text-[10px] text-emerald-400 font-mono">
              Live Connected · inquires.drpremrajjoshi.com.np (/inq-prem)
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold rounded-lg flex items-center gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>
      </header>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto w-full p-6 md:p-8 space-y-6 flex-1">
        {toastMsg && (
          <div className="p-3 bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by patient name, symptoms, phone, district..."
              className="w-full pl-10 pr-4 py-2 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-500" />
            <span className="text-xs font-semibold text-neutral-700">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs border border-neutral-300 rounded-xl bg-white font-semibold text-neutral-800"
            >
              <option value="all">All Inquiries ({inquiries.length})</option>
              <option value="Pending">Pending ({inquiries.filter(i => i.status === 'Pending').length})</option>
              <option value="In Review">In Review</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Card Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInquiries.length === 0 ? (
            <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-neutral-200">
              <Inbox className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-neutral-600">No patient inquiries match your search.</p>
            </div>
          ) : (
            filteredInquiries.map((inq) => (
              <div
                key={inq.id}
                onClick={() => handleOpenCard(inq)}
                className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-2xs hover:shadow-lg hover:border-emerald-600/40 cursor-pointer transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Status & Date */}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      inq.status === 'Pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      inq.status === 'In Review' ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                      inq.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' :
                      inq.status === 'Completed' ? 'bg-neutral-200 text-neutral-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {inq.status}
                    </span>

                    <span className="text-neutral-400 text-[11px]">
                      {inq.createdAt?.slice(0, 10)}
                    </span>
                  </div>

                  {/* Patient Name */}
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 group-hover:text-emerald-800 transition-colors font-editorial">
                      {inq.fullName}
                    </h3>
                    <div className="text-xs text-neutral-500 font-medium">
                      Age: <strong className="text-neutral-700">{inq.age}</strong> yrs · Gender: <strong className="text-neutral-700">{inq.gender}</strong>
                    </div>
                  </div>

                  {/* Contact & Location Badges */}
                  <div className="space-y-1.5 text-xs text-neutral-600 font-mono">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{inq.phone}</span>
                    </p>
                    <p className="flex items-center gap-2 text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{inq.district || 'Nepal'}, {inq.province}</span>
                    </p>
                  </div>

                  {/* Request Type & Attachment Badge */}
                  <div className="pt-1 flex items-center gap-2 flex-wrap">
                    <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded border border-emerald-200/60">
                      {inq.requestType}
                    </span>
                    {inq.attachment && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-800 text-[10px] font-bold rounded border border-amber-200">
                        <Paperclip className="w-3 h-3 text-amber-600" />
                        <span>Prescription / File Attached</span>
                      </span>
                    )}
                  </div>

                  {/* Symptoms Snippet */}
                  <div className="p-3 bg-neutral-50 rounded-xl text-xs text-neutral-700 line-clamp-3 leading-relaxed border border-neutral-100">
                    {inq.problemDetails}
                  </div>
                </div>

                {/* Footer action hint */}
                <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-900">
                  <span>Click to view all patient details</span>
                  <span>→</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full Patient Detail Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
            {/* Modal Top */}
            <div className="bg-neutral-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-editorial">
                  Patient Card: {selectedCard.fullName}
                </h3>
                <span className="text-xs text-emerald-400 font-mono">
                  Ref: {selectedCard.id} · Received {selectedCard.createdAt?.slice(0, 10)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs rounded-lg flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Record</span>
                </button>
                <button
                  onClick={() => setSelectedCard(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-xs text-neutral-800">
              {/* Patient Basic Info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
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
                  <span className="text-[10px] text-neutral-500 uppercase font-mono block">Complete Nepal Address</span>
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
                <div className="p-4 bg-emerald-50/40 border border-emerald-200/60 rounded-xl leading-relaxed whitespace-pre-line text-neutral-800 text-sm">
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

                  {selectedCard.attachment.url && (selectedCard.attachment.type?.includes('image') || selectedCard.attachment.url.startsWith('data:image/')) ? (
                    <div className="space-y-3">
                      <div className="max-h-80 overflow-hidden rounded-xl border border-neutral-200 bg-white flex items-center justify-center p-2 shadow-2xs">
                        <img
                          src={selectedCard.attachment.url}
                          alt="Patient uploaded prescription"
                          className="max-h-72 object-contain rounded-lg"
                        />
                      </div>
                      <a
                        href={selectedCard.attachment.url}
                        download={selectedCard.attachment.name || 'prescription_image.jpg'}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Full Resolution File ({selectedCard.attachment.name})</span>
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
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Document</span>
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Doctor Clinical Notes & Prescription Editor */}
              <div className="space-y-4 pt-2 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-neutral-900">Doctor Clinical Notes & Diagnosis:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-600 font-semibold">Change Status:</span>
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
                  rows={3}
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                  placeholder="Enter medical evaluation notes, Prakriti analysis, diagnosis..."
                  className="w-full p-3 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />

                <span className="font-bold text-neutral-900 block">Prescribed Ayurvedic Herbs / Diet Advice:</span>
                <textarea
                  rows={3}
                  value={prescribedAdvice}
                  onChange={(e) => setPrescribedAdvice(e.target.value)}
                  placeholder="e.g. Amalaki Churna with warm water, avoid sour food items..."
                  className="w-full p-3 text-xs border border-neutral-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />

                <div className="flex items-center justify-between pt-3">
                  <button
                    onClick={() => handleDelete(selectedCard.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Record</span>
                  </button>

                  <button
                    onClick={handleSaveModal}
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    Save Changes & Update
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

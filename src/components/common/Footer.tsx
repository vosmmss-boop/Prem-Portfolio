import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Branding, UsefulLink } from '../../types';
import { MapPin, Phone, Mail, Shield, ExternalLink, X, FileCheck, Lock } from 'lucide-react';

interface FooterProps {
  branding: Branding;
  usefulLinks: UsefulLink[];
}

export const Footer: React.FC<FooterProps> = ({ branding, usefulLinks }) => {
  const { language, t } = useLanguage();
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showAllLinks, setShowAllLinks] = useState(false);

  const displayedLinks = showAllLinks ? usefulLinks : usefulLinks.slice(0, 5);

  return (
    <footer className="bg-neutral-900 text-neutral-300 pt-16 pb-12 border-t border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-neutral-800">
          {/* Col 1: Doctor Profile & Contact (lg:col-span-5) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500 shrink-0">
                <img
                  src={branding.logoUrl}
                  alt="Dr. Prem Raj Joshi"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-editorial">
                  {language === 'np' ? branding.doctorName.np : branding.doctorName.en}
                </h3>
                <span className="text-xs text-emerald-400 font-mono">
                  {language === 'np' ? branding.degreeTitle.np : branding.degreeTitle.en}
                </span>
              </div>
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed font-nepali max-w-md">
              {language === 'np' ? branding.tagline.np : branding.tagline.en}
            </p>

            <div className="space-y-1.5 text-xs text-neutral-300 font-mono">
              <p className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>{branding.nmcNumber}</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                <span>{branding.phone}</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span>{branding.email}</span>
              </p>
            </div>
          </div>

          {/* Col 2: Useful Links in Footer (5 items max with Show More option) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {language === 'np' ? 'उपयोगी संस्थागत लिङ्कहरू' : 'Useful Regulatory Links'}
            </h4>
            <div className="space-y-2 text-xs">
              {displayedLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between text-neutral-400 hover:text-emerald-300 transition-colors py-1 border-b border-neutral-800/60"
                >
                  <span className="line-clamp-1">{language === 'np' ? link.titleNp : link.titleEn}</span>
                  <ExternalLink className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400 shrink-0 ml-2" />
                </a>
              ))}

              {usefulLinks.length > 5 && (
                <button
                  onClick={() => setShowAllLinks(!showAllLinks)}
                  className="w-full text-left pt-2 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-between border-t border-neutral-800/80 mt-1 cursor-pointer"
                >
                  <span>
                    {showAllLinks
                      ? (language === 'np' ? 'कम देखाउनुहोस् ↑' : 'Show Less ↑')
                      : (language === 'np' ? `थप लिङ्कहरू देखाउनुहोस् (+${usefulLinks.length - 5}) ↓` : `Show More Links (+${usefulLinks.length - 5}) ↓`)}
                  </span>
                  <span className="font-mono text-[10px] text-neutral-500">
                    {showAllLinks ? `${usefulLinks.length}/${usefulLinks.length}` : `5/${usefulLinks.length}`}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Col 3: Practice Locations (Current & Permanent) (lg:col-span-3) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              {language === 'np' ? 'क्लिनिक तथा ठेगाना' : 'Practice Locations'}
            </h4>
            <div className="text-xs text-neutral-400 space-y-3">
              <div>
                <span className="text-[10px] text-emerald-400 font-mono uppercase block font-semibold">
                  {language === 'np' ? 'वर्तमान क्लिनिक:' : 'Current Clinic:'}
                </span>
                <p className="flex items-start gap-1.5 mt-0.5 text-neutral-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {language === 'np'
                      ? (branding.currentLocation?.np || 'महाराजगञ्ज, काठमाडौं, नेपाल')
                      : (branding.currentLocation?.en || 'Maharajgunj Medical Zone, Kathmandu, Nepal')}
                  </span>
                </p>
              </div>

              <div>
                <span className="text-[10px] text-emerald-400 font-mono uppercase block font-semibold">
                  {language === 'np' ? 'स्थायी ठेगाना:' : 'Permanent Address:'}
                </span>
                <p className="flex items-start gap-1.5 mt-0.5 text-neutral-300">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    {language === 'np'
                      ? (branding.permanentAddress?.np || 'धनगढी, कैलाली, सुदूरपश्चिम, नेपाल')
                      : (branding.permanentAddress?.en || 'Dhangadhi Sub-Metropolitan, Kailali, Nepal')}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Disclaimer, Terms, Privacy & Rights */}
        <div className="pt-8 space-y-4">
          <p className="text-[11px] text-neutral-500 leading-relaxed font-nepali">
            {t('footer_disclaimer')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 font-mono pt-4 border-t border-neutral-800/80">
            <p>© {new Date().getFullYear()} {t('footer_rights')}</p>

            <div className="flex items-center gap-4 text-xs">
              <button
                onClick={() => setShowTermsModal(true)}
                className="text-neutral-400 hover:text-emerald-400 transition-colors"
              >
                Terms & Conditions
              </button>
              <span>·</span>
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="text-neutral-400 hover:text-emerald-400 transition-colors"
              >
                Privacy Policy
              </button>
              <span>·</span>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="text-neutral-600 hover:text-neutral-400 text-[10px]"
              >
                [Sitemap]
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-neutral-900 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowTermsModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase mb-2">
              <FileCheck className="w-4 h-4" />
              <span>Medical Portal Terms</span>
            </div>

            <h3 className="text-xl font-bold font-editorial mb-3">
              Terms & Conditions
            </h3>

            <div className="text-xs text-neutral-700 space-y-3 leading-relaxed">
              <p>
                <strong>1. Medical Consultation Scope:</strong> Inquiries submitted through drpremrajjoshi.com.np are for outpatient advisory and preliminary evaluation. Urgent acute medical emergencies must be directed to the nearest hospital emergency room.
              </p>
              <p>
                <strong>2. Qualified Practitioner:</strong> All clinical evaluations and Ayurvedic advice are supervised directly by Dr. Prem Raj Joshi (BAMS, IOM, TU, NMC Reg. 1824).
              </p>
              <p>
                <strong>3. Prescription & Herb Safety:</strong> Patients are advised not to consume classical herbal formulations beyond prescribed dosages. Disclose all concurrent allopathic medications during your consultation.
              </p>
              <p>
                <strong>4. Intellectual Property:</strong> Health articles, photographs, and Dinacharya guidelines published on this portal are authored by Dr. Prem Raj Joshi and protected under national copyright.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white text-neutral-900 rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowPrivacyModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-800 font-mono text-xs font-bold uppercase mb-2">
              <Lock className="w-4 h-4" />
              <span>Patient Data Confidentiality</span>
            </div>

            <h3 className="text-xl font-bold font-editorial mb-3">
              Privacy Policy & Health Data Protection
            </h3>

            <div className="text-xs text-neutral-700 space-y-3 leading-relaxed">
              <p>
                <strong>1. Confidentiality:</strong> All patient personal details, symptoms, addresses, and phone numbers submitted via the appointment form are treated with strict physician-patient confidentiality under the Nepal Medical Council ethical code.
              </p>
              <p>
                <strong>2. Data Usage:</strong> Your contact information is solely utilized by Dr. Prem Raj Joshi's clinical team to arrange consultations, follow-ups, and dispatch herbal courier shipments.
              </p>
              <p>
                <strong>3. Third-Party Non-Disclosure:</strong> We never sell, rent, or distribute patient health data to advertising agencies or pharmaceutical marketers.
              </p>
              <p>
                <strong>4. Record Removal:</strong> You may request the deletion or export of your consultation record at any time by contacting drpremrajjoshi@gmail.com.
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-5 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

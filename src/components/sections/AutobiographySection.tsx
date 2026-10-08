import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Autobiography, Branding } from '../../types';
import { BioSkeleton } from '../common/SkeletonLoaders';
import { Award, BookOpen, CheckCircle, Quote, Sparkles, X, Stethoscope, Maximize2 } from 'lucide-react';
import { FullScreenImageViewer } from '../common/FullScreenImageViewer';
import { RichTextContent } from '../common/RichTextContent';

interface AutobiographySectionProps {
  autobiography: Autobiography;
  branding: Branding;
  isLoading: boolean;
  onOpenAppointment: () => void;
}

export const AutobiographySection: React.FC<AutobiographySectionProps> = ({
  autobiography,
  branding,
  isLoading,
  onOpenAppointment
}) => {
  const { language, t } = useLanguage();
  const [showFullBioModal, setShowFullBioModal] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<{ url: string; title?: string; subtitle?: string } | null>(null);

  if (isLoading) {
    return (
      <section id="about" className="py-20 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <BioSkeleton />
        </div>
      </section>
    );
  }

  const doctorPhoto = branding.logoUrl || autobiography.avatarUrl || "/src/assets/images/doctor_portrait_1791392878397.jpg";
  const doctorName = language === 'np' ? branding.doctorName.np : branding.doctorName.en;

  const specialties = language === 'np'
    ? autobiography.specialties.np
    : autobiography.specialties.en;

  return (
    <section id="about" className="py-20 md:py-28 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Doctor Portrait & Trust Badge */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white ring-1 ring-neutral-200 bg-neutral-100 group cursor-pointer"
              onClick={() =>
                setFullScreenImage({
                  url: doctorPhoto,
                  title: doctorName,
                  subtitle: "BAMS · IOM, TU · NMC Reg. 1824"
                })
              }
            >
              <img
                src={doctorPhoto}
                alt={doctorName}
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullScreenImage({
                    url: doctorPhoto,
                    title: doctorName,
                    subtitle: "BAMS · IOM, TU · NMC Reg. 1824"
                  });
                }}
                className="absolute top-4 right-4 z-20 p-2 bg-neutral-900/80 hover:bg-neutral-900 text-white rounded-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity shadow-lg cursor-pointer"
                title="View Fullscreen Portrait"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Bottom badge overlay */}
              <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-neutral-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-neutral-950 text-sm font-editorial">
                      {doctorName}
                    </h4>
                    <p className="text-[11px] text-emerald-800 font-medium">
                      BAMS · Maharajgunj Medical Campus, IOM, TU
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg shrink-0">
                    NMC 1824
                  </span>
                </div>
              </div>
            </div>

            {/* Quick trust metrics (Fully manageable from CMS, hides when cleared) */}
            {(branding.stats?.stat1Value || branding.stats?.stat2Value || branding.stats?.stat3Value) && (
              <div className="grid grid-cols-3 gap-3 w-full max-w-md mt-6 text-center">
                {branding.stats?.stat1Value && (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                    <span className="block text-xl font-bold text-emerald-800 font-mono">
                      {branding.stats.stat1Value}
                    </span>
                    <span className="text-[11px] text-neutral-600 leading-tight block mt-0.5">
                      {language === 'np' ? (branding.stats?.stat1LabelNp || '') : (branding.stats?.stat1LabelEn || '')}
                    </span>
                  </div>
                )}
                {branding.stats?.stat2Value && (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                    <span className="block text-xl font-bold text-emerald-800 font-mono">
                      {branding.stats.stat2Value}
                    </span>
                    <span className="text-[11px] text-neutral-600 leading-tight block mt-0.5">
                      {language === 'np' ? (branding.stats?.stat2LabelNp || '') : (branding.stats?.stat2LabelEn || '')}
                    </span>
                  </div>
                )}
                {branding.stats?.stat3Value && (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                    <span className="block text-xl font-bold text-emerald-800 font-mono">
                      {branding.stats.stat3Value}
                    </span>
                    <span className="text-[11px] text-neutral-600 leading-tight block mt-0.5">
                      {language === 'np' ? (branding.stats?.stat3LabelNp || '') : (branding.stats?.stat3LabelEn || '')}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Narrative & Focus Areas */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider font-mono">
                {language === 'np'
                  ? (autobiography.kickerNp || 'मेरो बारेमा')
                  : (autobiography.kickerEn || 'About Me')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1 font-editorial">
                {t('sec_about_title')}
              </h2>
            </div>

            <RichTextContent
              content={language === 'np' ? autobiography.summaryNp : autobiography.summaryEn}
              className="text-base sm:text-lg text-neutral-700 leading-relaxed font-nepali"
            />

            {/* Philosophy Callout Quote */}
            <div className="bg-emerald-50/70 border-l-4 border-emerald-600 p-5 rounded-r-2xl space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                <Quote className="w-4 h-4 text-emerald-600" />
                <span>Medical Philosophy</span>
              </div>
              <RichTextContent
                content={language === 'np' ? autobiography.philosophyNp : autobiography.philosophyEn}
                className="text-sm italic text-neutral-800 leading-relaxed"
              />
            </div>

            {/* Specialties Checklist */}
            <div className="pt-2">
              <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{t('sec_specialties_title')}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {specialties.map((spec, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-700 font-medium">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions: Read Detail Modal & Book Appointment */}
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <button
                onClick={() => setShowFullBioModal(true)}
                className="px-5 py-3 rounded-xl border border-neutral-300 text-neutral-800 text-xs font-semibold hover:border-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition-colors flex items-center gap-2 shadow-2xs"
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>{t('sec_about_btn')}</span>
              </button>

              <button
                onClick={onOpenAppointment}
                className="px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold transition-colors flex items-center gap-2 shadow-xs"
              >
                <Stethoscope className="w-4 h-4" />
                <span>{t('nav_appointment')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Read Detail Modal */}
      {showFullBioModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-neutral-200 max-h-[90vh] flex flex-col">
            <div className="bg-neutral-900 text-white px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-emerald-400 bg-white">
                  <img src={branding.logoUrl || autobiography.avatarUrl} alt="Dr. Prem Raj Joshi" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-editorial">
                    {language === 'np' ? branding.doctorName.np : branding.doctorName.en}
                  </h3>
                  <span className="text-xs text-emerald-300">
                    BAMS, Institute of Medicine, Tribhuvan University · Full Autobiography
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowFullBioModal(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-neutral-700 leading-relaxed font-nepali">
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Medical Council Registration & Affiliations:</p>
                <p>• Nepal Medical Council Registered Ayurvedic Physician (Reg. No. 1824)</p>
                <p>• Graduate, Institute of Medicine (IOM), Maharajgunj Medical Campus, TU</p>
                <p>• Clinical Training: Ayurveda Teaching Hospital, Kirtipur, Kathmandu</p>
              </div>

              <RichTextContent
                content={language === 'np' ? autobiography.fullBioNp : autobiography.fullBioEn}
                className="text-neutral-800 text-base leading-relaxed"
                onImageClick={(url, alt) =>
                  setFullScreenImage({
                    url,
                    title: alt || doctorName,
                    subtitle: 'Autobiography'
                  })
                }
              />

              <div className="pt-4 border-t border-neutral-200 flex justify-end">
                <button
                  onClick={() => setShowFullBioModal(false)}
                  className="px-5 py-2.5 bg-neutral-900 text-white text-xs font-semibold rounded-lg hover:bg-neutral-800"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* High-Resolution Full-Screen Image Lightbox */}
      {fullScreenImage && (
        <FullScreenImageViewer
          isOpen={true}
          imageUrl={fullScreenImage.url}
          title={fullScreenImage.title}
          subtitle={fullScreenImage.subtitle}
          onClose={() => setFullScreenImage(null)}
        />
      )}
    </section>
  );
};

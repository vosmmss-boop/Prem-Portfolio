import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ExperienceEntry, Branding } from '../../types';
import { CardsSkeleton } from '../common/SkeletonLoaders';
import { Briefcase, MapPin, CheckCircle, ArrowRight, X, Building2, Stethoscope, HeartPulse, Award } from 'lucide-react';

interface ExperienceSectionProps {
  experience: ExperienceEntry[];
  branding?: Branding;
  isLoading: boolean;
  onSelectExperience?: (entry: ExperienceEntry) => void;
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  experience,
  branding,
  isLoading,
  onSelectExperience
}) => {
  const { language, t } = useLanguage();
  const [activeItem, setActiveItem] = useState<ExperienceEntry | null>(null);

  if (isLoading) {
    return (
      <section id="experience" className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <CardsSkeleton count={3} />
        </div>
      </section>
    );
  }

  // If user deleted all work experience, cleanly hide section
  if (!experience || experience.length === 0) {
    return null;
  }

  const handleOpenEntry = (entry: ExperienceEntry) => {
    setActiveItem(entry);
    window.location.hash = `#experience-${entry.slug}`;
    if (onSelectExperience) onSelectExperience(entry);
  };

  const hasStats = Boolean(
    branding?.stats?.stat1Value ||
    branding?.stats?.stat2Value ||
    branding?.stats?.stat3Value
  );

  return (
    <section id="experience" className="py-20 md:py-28 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/70 border border-emerald-200 rounded-full text-emerald-900 text-xs font-bold font-mono uppercase tracking-wider mb-3">
              <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
              <span>{language === 'np' ? 'क्लिनिकल संलग्नता तथा अस्पताल अभ्यास' : 'Clinical Engagement & Practice'}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-neutral-900 tracking-tight font-editorial">
              {language === 'np' ? 'अस्पताल सेवा, बिरामी उपचार तथा स्वास्थ्य शिविर' : 'Hospital Practice & Clinical Case Management'}
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2 font-nepali">
              {language === 'np'
                ? 'काठमाडौं तथा पश्चिमी नेपालका प्रमुख आयुर्वेद शिक्षण अस्पताल, एकीकृत वेलनेस क्लिनिक र दुर्गम स्वास्थ्य शिविरहरूमा हजारौं बिरामीहरूको सफल उपचार।'
                : 'Over years of evidence-guided clinical service across teaching hospitals in Kathmandu Valley and rural humanitarian camps across Western Nepal.'}
            </p>
          </div>

          {hasStats && (
            <div className="hidden lg:flex items-center gap-4 bg-emerald-50/60 border border-emerald-200/60 p-4 rounded-2xl">
              {branding?.stats?.stat1Value && (
                <div className="text-center px-3 border-r border-emerald-200/80">
                  <span className="block text-2xl font-black text-emerald-900 font-mono">
                    {branding.stats.stat1Value}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-700">
                    {language === 'np' ? (branding.stats.stat1LabelNp || 'Medical Degree') : (branding.stats.stat1LabelEn || 'Medical Degree')}
                  </span>
                </div>
              )}
              {branding?.stats?.stat2Value && (
                <div className="text-center px-3 border-r border-emerald-200/80">
                  <span className="block text-2xl font-black text-emerald-900 font-mono">
                    {branding.stats.stat2Value}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-700">
                    {language === 'np' ? (branding.stats.stat2LabelNp || 'Treated') : (branding.stats.stat2LabelEn || 'Treated')}
                  </span>
                </div>
              )}
              {branding?.stats?.stat3Value && (
                <div className="text-center px-3">
                  <span className="block text-2xl font-black text-emerald-900 font-mono">
                    {branding.stats.stat3Value}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-emerald-700">
                    {language === 'np' ? (branding.stats.stat3LabelNp || 'Rural Camps') : (branding.stats.stat3LabelEn || 'Rural Camps')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3-Column Asymmetric Clinical Engagement Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experience.map((entry) => {
            const achievements = language === 'np'
              ? (entry.achievementsNp || entry.achievementsEn || [])
              : (entry.achievementsEn || []);

            return (
              <div
                key={entry.id}
                className="bg-neutral-50/80 border border-neutral-200/90 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:border-emerald-600/50 hover:bg-white hover:shadow-xl transition-all duration-300 group"
              >
                <div>
                  {/* Image of Hospital / Clinic Where Doctor Worked */}
                  {entry.imageUrl ? (
                    <div className="mb-5 aspect-16/9 w-full rounded-2xl overflow-hidden bg-neutral-200 border border-neutral-200/80 relative shadow-2xs">
                      <img
                        src={entry.imageUrl}
                        alt={entry.organizationEn}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2.5 right-2.5 bg-neutral-900/80 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-emerald-400" />
                        <span>Clinical Center</span>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-5 aspect-16/9 w-full rounded-2xl bg-gradient-to-br from-emerald-800 to-teal-900 text-white flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shadow-2xs">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-2">
                        <HeartPulse className="w-6 h-6 text-amber-300" />
                      </div>
                      <span className="text-xs font-bold font-editorial line-clamp-1">{language === 'np' ? entry.organizationNp : entry.organizationEn}</span>
                      <span className="text-[10px] text-emerald-200 font-mono mt-0.5">{language === 'np' ? entry.locationNp : entry.locationEn}</span>
                    </div>
                  )}

                  {/* Period & Location Badge */}
                  <div className="flex items-center justify-between text-xs font-mono text-neutral-500 mb-3">
                    <span className="font-bold text-emerald-900 bg-emerald-100/80 px-2.5 py-0.5 rounded-md text-[11px]">
                      {entry.period}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-500">
                      <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate max-w-[130px]">{language === 'np' ? entry.locationNp : entry.locationEn}</span>
                    </span>
                  </div>

                  {/* Role Title */}
                  <h3 className="text-xl font-bold text-neutral-900 font-editorial mb-1.5 group-hover:text-emerald-800 transition-colors leading-snug">
                    {language === 'np' ? entry.roleNp : entry.roleEn}
                  </h3>

                  {/* Organization */}
                  <p className="text-xs font-semibold text-emerald-800 mb-4 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{language === 'np' ? entry.organizationNp : entry.organizationEn}</span>
                  </p>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed mb-6 font-nepali">
                    {language === 'np' ? entry.descriptionNp : entry.descriptionEn}
                  </p>

                  {/* Achievements Checklist */}
                  {achievements.length > 0 && (
                    <div className="space-y-2 mb-6 bg-white/80 p-3.5 rounded-2xl border border-neutral-200/60">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 font-mono block">Clinical Highlights:</span>
                      {achievements.slice(0, 2).map((ach, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-neutral-700 leading-snug">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{ach}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-4 border-t border-neutral-200/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-neutral-400">
                    /experience/{entry.slug}
                  </span>

                  <button
                    onClick={() => handleOpenEntry(entry)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform cursor-pointer"
                  >
                    <span>{language === 'np' ? 'विस्तृत विवरण हेर्नुहोस्' : 'View Clinical Scope'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Engagement Detail Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-5 right-5 p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {activeItem.imageUrl && (
              <div className="mb-4 aspect-16/9 w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200 shadow-xs">
                <img src={activeItem.imageUrl} alt={activeItem.organizationEn} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded">
                {activeItem.period}
              </span>
              <span className="text-xs font-mono text-neutral-400">
                /experience/{activeItem.slug}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-neutral-900 font-editorial mb-1">
              {language === 'np' ? activeItem.roleNp : activeItem.roleEn}
            </h3>

            <p className="text-xs font-semibold text-emerald-800 mb-4 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'np' ? activeItem.organizationNp : activeItem.organizationEn} ({language === 'np' ? activeItem.locationNp : activeItem.locationEn})</span>
            </p>

            <div className="text-sm text-neutral-700 leading-relaxed space-y-4 font-nepali">
              <p>{language === 'np' ? activeItem.descriptionNp : activeItem.descriptionEn}</p>

              <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2.5">
                <span className="font-bold text-xs text-emerald-900 uppercase font-mono block">Documented Clinical Impact & Outcomes:</span>
                {(language === 'np' ? (activeItem.achievementsNp || activeItem.achievementsEn || []) : (activeItem.achievementsEn || [])).map((ach, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-neutral-800 leading-snug">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{ach}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setActiveItem(null)}
                className="px-5 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { EducationMilestone } from '../../types';
import { TimelineSkeleton } from '../common/SkeletonLoaders';
import { GraduationCap, Calendar, Award, ArrowRight, X } from 'lucide-react';
import { RichTextContent } from '../common/RichTextContent';

interface JourneySectionProps {
  education: EducationMilestone[];
  isLoading: boolean;
  onSelectMilestone?: (milestone: EducationMilestone) => void;
}

export const JourneySection: React.FC<JourneySectionProps> = ({
  education,
  isLoading,
  onSelectMilestone
}) => {
  const { language, t } = useLanguage();
  const [activeModalItem, setActiveModalItem] = useState<EducationMilestone | null>(null);

  if (isLoading) {
    return (
      <section id="journey" className="py-20 bg-neutral-50 border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-6">
          <TimelineSkeleton />
        </div>
      </section>
    );
  }

  // If user deleted all education milestones, cleanly hide section
  if (!education || education.length === 0) {
    return null;
  }

  const handleOpenMilestone = (item: EducationMilestone) => {
    setActiveModalItem(item);
    window.location.hash = `#journey-${item.slug}`;
    if (onSelectMilestone) onSelectMilestone(item);
  };

  return (
    <section id="journey" className="py-20 md:py-28 bg-neutral-50 border-b border-neutral-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
            {t('sec_journey_kicker')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1 font-editorial">
            {t('sec_journey_title')}
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            Academic rigor and specialized medical curricula across Nepal's premier academic institutions.
          </p>
        </div>

        {/* Timeline Layout */}
        <div className="relative border-l-2 border-emerald-200 pl-6 md:pl-10 ml-4 md:ml-12 space-y-12">
          {education.map((item) => (
            <div key={item.id} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-[35px] md:-left-[51px] top-1.5 w-10 h-10 rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center text-emerald-700 shadow-sm group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <GraduationCap className="w-5 h-5" />
              </div>

              {/* Card Container */}
              <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 md:p-8 shadow-xs hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{item.year}</span>
                  </div>

                  {item.honorsEn && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                      <Award className="w-3 h-3 text-amber-600" />
                      <span>{language === 'np' ? (item.honorsNp || item.honorsEn) : item.honorsEn}</span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-neutral-900 font-editorial mb-1">
                  {language === 'np' ? item.degreeNp : item.degreeEn}
                </h3>

                <p className="text-xs font-medium text-emerald-800 mb-3">
                  {language === 'np' ? item.institutionNp : item.institutionEn}
                </p>

                {item.imageUrl && (
                  <div className="mb-4 aspect-16/9 max-h-52 w-full rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200">
                    <img src={item.imageUrl} alt={item.institutionEn} className="w-full h-full object-cover" />
                  </div>
                )}

                <RichTextContent
                  content={language === 'np' ? item.descriptionNp : item.descriptionEn}
                  className="text-sm text-neutral-600 leading-relaxed mb-4"
                />

                <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                  <span className="text-[11px] font-mono text-neutral-400">
                    /journey/{item.slug}
                  </span>

                  <button
                    onClick={() => handleOpenMilestone(item)}
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Read Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Milestone Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 md:p-8 shadow-2xl border border-neutral-200 relative">
            <button
              onClick={() => setActiveModalItem(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 font-mono mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{activeModalItem.year} · Slug: {activeModalItem.slug}</span>
            </div>

            <h3 className="text-2xl font-bold text-neutral-950 font-editorial mb-1">
              {language === 'np' ? activeModalItem.degreeNp : activeModalItem.degreeEn}
            </h3>

            <p className="text-xs font-medium text-emerald-800 mb-4">
              {language === 'np' ? activeModalItem.institutionNp : activeModalItem.institutionEn}
            </p>

            {activeModalItem.imageUrl && (
              <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-neutral-200">
                <img src={activeModalItem.imageUrl} alt={activeModalItem.degreeEn} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="text-sm text-neutral-700 leading-relaxed space-y-3 font-nepali">
              <RichTextContent
                content={language === 'np' ? activeModalItem.descriptionNp : activeModalItem.descriptionEn}
              />
              {activeModalItem.honorsEn && (
                <div className="p-3 bg-amber-50 rounded-lg text-amber-900 text-xs border border-amber-200">
                  <strong>Academic Honors:</strong> {language === 'np' ? (activeModalItem.honorsNp || activeModalItem.honorsEn) : activeModalItem.honorsEn}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-neutral-200 flex justify-end">
              <button
                onClick={() => setActiveModalItem(null)}
                className="px-4 py-2 bg-neutral-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

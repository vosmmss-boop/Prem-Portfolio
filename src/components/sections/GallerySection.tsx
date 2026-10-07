import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { GalleryItem, Branding } from '../../types';
import { CardsSkeleton } from '../common/SkeletonLoaders';
import { Image, Play, X, Calendar, Maximize2 } from 'lucide-react';

interface GallerySectionProps {
  gallery: GalleryItem[];
  branding: Branding;
  isLoading: boolean;
}

export const GallerySection: React.FC<GallerySectionProps> = ({
  gallery,
  branding,
  isLoading
}) => {
  const { language, t } = useLanguage();
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryItem | null>(null);

  if (isLoading) {
    return (
      <section id="gallery" className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <CardsSkeleton count={3} />
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 md:py-28 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-14">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider font-mono">
            {t('sec_gallery_kicker')}
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 tracking-tight mt-1 font-editorial">
            {t('sec_gallery_title')}
          </h2>
          <p className="text-sm text-neutral-600 mt-2">
            Moments from clinical practice, botanical research across the Himalayas, and public health seminars.
          </p>
        </div>

        {/* Embedded YouTube Educational Video Banner */}
        {branding.youtubeEmbedUrl && (
          <div className="mb-14 bg-neutral-900 rounded-3xl overflow-hidden shadow-xl border border-neutral-800">
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  Featured Health Lecture
                </span>
                <h3 className="text-xl md:text-2xl font-bold text-white font-editorial mt-1">
                  {language === 'np'
                    ? 'आयुर्वेदमा पाचन अग्नि र दीर्घ स्वास्थ्य रहस्य - डा. प्रेम राज जोशी'
                    : 'Understanding Digestive Fire (Agni) & Longevity - Dr. Prem Raj Joshi'}
                </h3>
              </div>
              <a
                href="https://youtube.com/@drpremrajjoshi"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg self-start md:self-auto transition-colors flex items-center gap-1.5"
              >
                <span>Subscribe on YouTube</span>
              </a>
            </div>

            <div className="aspect-video w-full max-h-[460px] bg-black">
              <iframe
                src={branding.youtubeEmbedUrl}
                title="Dr. Prem Raj Joshi Health Video"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedPhoto(item)}
              className="group cursor-pointer bg-neutral-50 rounded-2xl overflow-hidden border border-neutral-200/80 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-neutral-200">
                <img
                  src={item.mediaUrl}
                  alt={language === 'np' ? item.titleNp : item.titleEn}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Maximize2 className="w-6 h-6" />
                </div>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-neutral-900 group-hover:text-emerald-800 transition-colors line-clamp-1 font-editorial">
                    {language === 'np' ? item.titleNp : item.titleEn}
                  </h4>
                  {item.captionEn && (
                    <p className="text-xs text-neutral-600 mt-1 line-clamp-2 font-nepali">
                      {language === 'np' ? (item.captionNp || item.captionEn) : item.captionEn}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
                  <span>{item.date || 'Nepal'}</span>
                  <span>/gallery/{item.slug}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Photo Modal */}
      {selectedPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-4xl w-full bg-neutral-950 rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 relative">
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="max-h-[70vh] flex items-center justify-center bg-black">
              <img
                src={selectedPhoto.mediaUrl}
                alt={language === 'np' ? selectedPhoto.titleNp : selectedPhoto.titleEn}
                className="max-h-[70vh] max-w-full object-contain"
              />
            </div>

            <div className="p-6 bg-neutral-900 text-white">
              <h3 className="text-lg font-bold font-editorial">
                {language === 'np' ? selectedPhoto.titleNp : selectedPhoto.titleEn}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 font-nepali">
                {language === 'np' ? (selectedPhoto.captionNp || selectedPhoto.captionEn) : selectedPhoto.captionEn}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

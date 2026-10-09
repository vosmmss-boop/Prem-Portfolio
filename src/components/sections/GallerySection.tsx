import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { GalleryItem, Branding } from '../../types';
import { CardsSkeleton } from '../common/SkeletonLoaders';
import { Image, Play, X, Calendar, Maximize2, ExternalLink } from 'lucide-react';
import { FullScreenImageViewer } from '../common/FullScreenImageViewer';
import { parseYouTubeUrl } from '../../utils/youtube';

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
  const [isPlayingYoutube, setIsPlayingYoutube] = useState(false);

  const ytInfo = parseYouTubeUrl(branding.youtubeEmbedUrl);

  if (isLoading) {
    return (
      <section id="gallery" className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <CardsSkeleton count={3} />
        </div>
      </section>
    );
  }

  // If user deleted all gallery photos and there is no YouTube video, cleanly hide section
  if ((!gallery || gallery.length === 0) && !branding.youtubeEmbedUrl) {
    return null;
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
            <div className="p-5 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-800">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                  <Play className="w-3.5 h-3.5 fill-emerald-400" />
                  Featured Health Lecture
                </span>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white font-editorial mt-1">
                  {language === 'np'
                    ? 'आयुर्वेदमा पाचन अग्नि र दीर्घ स्वास्थ्य रहस्य - डा. प्रेम राज जोशी'
                    : 'Understanding Digestive Fire (Agni) & Longevity - Dr. Prem Raj Joshi'}
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                <a
                  href={ytInfo.watchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'np' ? 'युट्युबमा खोल्नुहोस्' : 'Watch on YouTube'}</span>
                </a>
                <a
                  href={branding.socialLinks?.youtube || 'https://youtube.com/@drpremrajjoshi'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <span>Subscribe on YouTube</span>
                </a>
              </div>
            </div>

            <div className="aspect-video w-full max-h-[460px] bg-black relative">
              {ytInfo.videoId ? (
                isPlayingYoutube ? (
                  <iframe
                    src={`${ytInfo.embedUrl}&autoplay=1`}
                    title="Dr. Prem Raj Joshi Health Video"
                    className="w-full h-full border-0"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div
                    onClick={() => setIsPlayingYoutube(true)}
                    className="w-full h-full relative cursor-pointer group flex items-center justify-center overflow-hidden"
                  >
                    <img
                      src={ytInfo.thumbnailUrl}
                      alt="Featured YouTube Lecture Thumbnail"
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.src = '/assets/images/hero_ayurveda_clinic_1791392890876.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                    <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                        <Play className="w-8 h-8 sm:w-9 sm:h-9 fill-white ml-1" />
                      </div>
                      <span className="px-3.5 py-1.5 rounded-full bg-black/70 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                        {language === 'np' ? 'भिडियो प्ले गर्न क्लिक गर्नुहोस्' : 'Click to Play Video Lecture'}
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-300 space-y-3">
                  <Play className="w-10 h-10 text-emerald-400" />
                  <p className="text-sm font-semibold">
                    {language === 'np'
                      ? 'यो भिडियो सिधै युट्युबमा हेर्न तलको बटन थिच्नुहोस्'
                      : 'Watch this featured health lecture directly on YouTube'}
                  </p>
                  <a
                    href={ytInfo.watchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Video on YouTube</span>
                  </a>
                </div>
              )}
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

      {/* High-Resolution Full-Screen Lightbox */}
      {selectedPhoto && (
        <FullScreenImageViewer
          isOpen={true}
          imageUrl={selectedPhoto.mediaUrl}
          title={language === 'np' ? selectedPhoto.titleNp : selectedPhoto.titleEn}
          subtitle={language === 'np' ? (selectedPhoto.captionNp || selectedPhoto.captionEn) : selectedPhoto.captionEn}
          onClose={() => setSelectedPhoto(null)}
        />
      )}
    </section>
  );
};

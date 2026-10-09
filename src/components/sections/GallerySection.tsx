import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { GalleryItem, Branding, YouTubeVideoItem } from '../../types';
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
  const [playingVideoIds, setPlayingVideoIds] = useState<Record<string, boolean>>({});

  // Resolve list of embedded YouTube videos (supports multiple videos with custom titles + fallback to single youtubeEmbedUrl)
  const youtubeVideos: YouTubeVideoItem[] = useMemo(() => {
    if (branding.youtubeVideos && branding.youtubeVideos.length > 0) {
      return branding.youtubeVideos.filter((v) => v && v.url && v.url.trim());
    }
    if (branding.youtubeEmbedUrl && branding.youtubeEmbedUrl.trim()) {
      return [
        {
          id: 'yt-default-1',
          titleEn: 'Understanding Digestive Fire (Agni) & Longevity - Dr. Prem Raj Joshi',
          titleNp: 'आयुर्वेदमा पाचन अग्नि र दीर्घ स्वास्थ्य रहस्य - डा. प्रेम राज जोशी',
          kickerEn: 'Featured Health Lecture',
          kickerNp: 'विशेष स्वास्थ्य प्रवचन',
          url: branding.youtubeEmbedUrl
        }
      ];
    }
    return [];
  }, [branding.youtubeVideos, branding.youtubeEmbedUrl]);

  if (isLoading) {
    return (
      <section id="gallery" className="py-20 bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6">
          <CardsSkeleton count={3} />
        </div>
      </section>
    );
  }

  // If user deleted all gallery photos and there are no YouTube videos, cleanly hide section
  if ((!gallery || gallery.length === 0) && youtubeVideos.length === 0) {
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

        {/* Embedded YouTube Educational Videos (Supports 1 or Multiple Videos with Custom Titles) */}
        {youtubeVideos.length > 0 && (
          <div
            className={`mb-14 grid gap-8 ${
              youtubeVideos.length === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
            }`}
          >
            {youtubeVideos.map((vid, idx) => {
              const ytInfo = parseYouTubeUrl(vid.url);
              const vidKey = vid.id || `yt-${idx}`;
              const isPlaying = Boolean(playingVideoIds[vidKey]);
              const videoTitle =
                language === 'np'
                  ? vid.titleNp || vid.titleEn || 'आयुर्वेदमा पाचन अग्नि र दीर्घ स्वास्थ्य रहस्य - डा. प्रेम राज जोशी'
                  : vid.titleEn || vid.titleNp || 'Understanding Digestive Fire (Agni) & Longevity - Dr. Prem Raj Joshi';
              const videoKicker =
                language === 'np'
                  ? vid.kickerNp || vid.kickerEn || 'विशेष स्वास्थ्य प्रवचन'
                  : vid.kickerEn || vid.kickerNp || 'Featured Health Lecture';

              return (
                <div
                  key={vidKey}
                  className="bg-neutral-900 rounded-3xl overflow-hidden shadow-xl border border-neutral-800 flex flex-col justify-between"
                >
                  <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800">
                    <div className="min-w-0">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono flex items-center gap-2">
                        <Play className="w-3.5 h-3.5 fill-emerald-400 shrink-0" />
                        <span className="truncate">{videoKicker}</span>
                      </span>
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-white font-editorial mt-1 leading-snug">
                        {videoTitle}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
                      <a
                        href={ytInfo.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold rounded-lg border border-neutral-700 transition-colors flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{language === 'np' ? 'युट्युबमा हेर्नुहोस्' : 'Watch on YouTube'}</span>
                      </a>
                      {idx === 0 && (
                        <a
                          href={branding.socialLinks?.youtube || 'https://youtube.com/@drpremrajjoshi'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <span>Subscribe</span>
                        </a>
                      )}
                    </div>
                  </div>

                  <div
                    className={`aspect-video w-full ${
                      youtubeVideos.length === 1 ? 'max-h-[460px]' : ''
                    } bg-black relative`}
                  >
                    {ytInfo.videoId ? (
                      isPlaying ? (
                        <iframe
                          src={`${ytInfo.embedUrl}&autoplay=1`}
                          title={videoTitle}
                          className="w-full h-full border-0"
                          referrerPolicy="strict-origin-when-cross-origin"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      ) : (
                        <div
                          onClick={() =>
                            setPlayingVideoIds((prev) => ({ ...prev, [vidKey]: true }))
                          }
                          className="w-full h-full relative cursor-pointer group flex items-center justify-center overflow-hidden"
                        >
                          <img
                            src={ytInfo.thumbnailUrl}
                            alt={videoTitle}
                            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              e.currentTarget.src =
                                '/assets/images/hero_ayurveda_clinic_1791392890876.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />
                          <div className="relative z-10 flex flex-col items-center gap-3 text-center px-4">
                            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-red-600 group-hover:bg-red-500 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all">
                              <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1" />
                            </div>
                            <span className="px-3.5 py-1.5 rounded-full bg-black/70 border border-white/20 text-white text-xs font-semibold backdrop-blur-xs">
                              {language === 'np'
                                ? 'भिडियो प्ले गर्न क्लिक गर्नुहोस्'
                                : 'Click to Play Video Lecture'}
                            </span>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-neutral-300 space-y-3">
                        <Play className="w-10 h-10 text-emerald-400" />
                        <p className="text-sm font-semibold">{videoTitle}</p>
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
              );
            })}
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

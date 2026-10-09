import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { HeroSlide } from '../../types';
import { HeroSliderSkeleton } from '../common/SkeletonLoaders';
import { ChevronLeft, ChevronRight, Stethoscope, Sparkles, Maximize2 } from 'lucide-react';
import { FullScreenImageViewer } from '../common/FullScreenImageViewer';

interface HeroSliderProps {
  slides: HeroSlide[];
  isLoading: boolean;
  onOpenAppointment: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({
  slides,
  isLoading,
  onOpenAppointment
}) => {
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<{ url: string; title?: string; subtitle?: string } | null>(null);

  // Auto-slide every 6 seconds if not paused
  useEffect(() => {
    if (isLoading || slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isLoading, isPaused]);

  if (isLoading) {
    return <HeroSliderSkeleton />;
  }

  if (!slides || slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <section
      id="home"
      className="relative w-full h-[520px] md:h-[620px] bg-neutral-900 overflow-hidden select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Images with smooth fade transition */}
      {slides.map((slide, idx) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
          }`}
          style={{ transitionProperty: 'opacity, transform' }}
        >
          <img
            src={slide.imageUrl}
            alt={language === 'np' ? slide.titleNp : slide.titleEn}
            className="w-full h-full object-cover object-center brightness-[0.72]"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}

      {/* Measured Dark Scrim Gradient for WCAG AA Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-black/30 pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-8 flex flex-col justify-end pb-6 sm:pb-12 md:pb-20">
        <div className="max-w-3xl space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

          {/* Main Title (Bilingual) */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15] font-editorial text-balance drop-shadow-md">
            {language === 'np' ? currentSlide.titleNp : currentSlide.titleEn}
          </h1>

          {/* Subtitle (Bilingual) */}
          <p className="text-sm sm:text-lg md:text-xl text-neutral-200/90 leading-relaxed max-w-2xl text-balance line-clamp-3 sm:line-clamp-none">
            {language === 'np' ? currentSlide.subtitleNp : currentSlide.subtitleEn}
          </p>

          {/* Action CTAs */}
          <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2.5 sm:gap-4">
            <button
              onClick={onOpenAppointment}
              className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-emerald-600/30 flex items-center gap-2 active:scale-95"
            >
              <Stethoscope className="w-4 h-4 shrink-0" />
              <span>{language === 'np' ? currentSlide.ctaTextNp : currentSlide.ctaTextEn}</span>
            </button>

            <a
              href="#about"
              className="px-4 sm:px-6 py-2.5 sm:py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold rounded-xl backdrop-blur-md border border-white/20 transition-all duration-200 active:scale-95"
            >
              {language === 'np' ? 'मेरो बारेमा' : 'About Me'}
            </a>
          </div>
        </div>

        {/* Carousel Navigation Arrows & Indicators */}
        <div className="mt-5 sm:mt-0 sm:absolute sm:bottom-8 sm:right-8 flex items-center justify-between sm:justify-end gap-2 sm:gap-3 z-20">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center transition-colors backdrop-blur-xs"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex items-center gap-1.5 px-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === currentIndex ? 'w-6 sm:w-8 bg-emerald-400' : 'w-2 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Go to slide ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center transition-colors backdrop-blur-xs"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>

          <button
            onClick={() =>
              setFullScreenImage({
                url: currentSlide.imageUrl,
                title: language === 'np' ? currentSlide.titleNp : currentSlide.titleEn,
                subtitle: language === 'np' ? currentSlide.subtitleNp : currentSlide.subtitleEn
              })
            }
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/40 hover:bg-black/70 text-white border border-white/20 flex items-center justify-center transition-colors backdrop-blur-xs cursor-pointer"
            title="View Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* High-Resolution Full-Screen Lightbox */}
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

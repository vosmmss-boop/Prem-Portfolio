import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { SitePopupNotice } from '../../types';
import { RichTextContent } from './RichTextContent';
import { stripHtmlToPlainText } from '../../utils/htmlSanitizer';
import { X, ChevronDown, ChevronUp, ExternalLink, Maximize2, Bell } from 'lucide-react';
import { FullScreenImageViewer } from './FullScreenImageViewer';

interface SitePopupModalProps {
  popupNotice?: SitePopupNotice;
  doctorName?: string;
  doctorLogo?: string;
  onOpenAppointment?: () => void;
}

export const SitePopupModal: React.FC<SitePopupModalProps> = ({
  popupNotice,
  doctorName = 'Dr. Prem Raj Joshi',
  doctorLogo,
  onOpenAppointment
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState<{
    url: string;
    title?: string;
    subtitle?: string;
  } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!popupNotice || !popupNotice.active) {
      setIsOpen(false);
      return;
    }

    const versionKey = `dr_joshi_popup_dismissed_${popupNotice.updatedAt || 'v1'}`;
    const wasDismissed = sessionStorage.getItem(versionKey) === 'true';
    if (!wasDismissed) {
      setIsOpen(true);
    }
  }, [popupNotice?.active, popupNotice?.updatedAt]);

  if (!popupNotice || !popupNotice.active || !isOpen) {
    return null;
  }

  const handleDismiss = () => {
    const versionKey = `dr_joshi_popup_dismissed_${popupNotice.updatedAt || 'v1'}`;
    try {
      sessionStorage.setItem(versionKey, 'true');
    } catch {
      // ignore storage errors
    }
    setIsOpen(false);
  };

  const title =
    language === 'np'
      ? popupNotice.titleNp || popupNotice.titleEn
      : popupNotice.titleEn || popupNotice.titleNp || '';

  const subtitle =
    language === 'np'
      ? popupNotice.subtitleNp || popupNotice.subtitleEn
      : popupNotice.subtitleEn || popupNotice.subtitleNp || '';

  const bodyHtml =
    language === 'np'
      ? popupNotice.bodyNp || popupNotice.bodyEn || ''
      : popupNotice.bodyEn || popupNotice.bodyNp || '';

  const plainBody = stripHtmlToPlainText(bodyHtml);
  const isLongText = plainBody.length > 220 || bodyHtml.length > 320;

  const ctaText =
    language === 'np'
      ? popupNotice.ctaTextNp || popupNotice.ctaTextEn
      : popupNotice.ctaTextEn || popupNotice.ctaTextNp;

  const imageSize = popupNotice.imageSize || 'medium';
  const objectFit = popupNotice.imageObjectFit || 'cover';

  // Compute custom or preset image container classes
  const getImageHeightClass = () => {
    switch (imageSize) {
      case 'small':
        return 'max-h-[180px]';
      case 'large':
        return 'max-h-[420px]';
      case 'full':
        return 'max-h-[520px]';
      case 'custom':
        return 'max-h-[440px]';
      case 'medium':
      default:
        return 'max-h-[280px]';
    }
  };

  const getCustomDimensions = () => {
    if (imageSize !== 'custom') return {};
    return {
      width: popupNotice.customWidthPx ? Number(popupNotice.customWidthPx) : undefined,
      height: popupNotice.customHeightPx ? Number(popupNotice.customHeightPx) : undefined
    };
  };

  const handleToggleReadMore = () => {
    const next = !isExpanded;
    setIsExpanded(next);
    if (next && scrollContainerRef.current) {
      setTimeout(() => {
        scrollContainerRef.current?.scrollTo({
          top: 160,
          behavior: 'smooth'
        });
      }, 60);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
        <div
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col"
          role="dialog"
          aria-modal="true"
          aria-labelledby="site-popup-title"
        >
          {/* Top Bar */}
          <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-emerald-800/60 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {doctorLogo ? (
                <img
                  src={doctorLogo}
                  alt={doctorName}
                  className="w-8 h-8 rounded-full object-cover border border-emerald-400 bg-white shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-emerald-800 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-emerald-300" />
                </div>
              )}
              <div className="min-w-0">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 block truncate">
                  {language === 'np' ? 'आधिकारिक सूचना · Official Notice' : 'Official Portal Notice'}
                </span>
                <span className="text-xs font-bold text-white truncate block">
                  {doctorName}
                </span>
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              aria-label="Close popup notice"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Body (supports custom sized image, title, subtitle, and big text with Read More scrolling) */}
          <div
            ref={scrollContainerRef}
            className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 scroll-smooth"
          >
            {/* Optional Custom-Sized Image */}
            {popupNotice.imageUrl && popupNotice.imageUrl.trim() && (
              <div className="flex justify-center">
                <div
                  className={`relative w-full rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-xs group cursor-pointer flex items-center justify-center mx-auto ${getImageHeightClass()}`}
                  onClick={() =>
                    setFullScreenImage({
                      url: popupNotice.imageUrl!,
                      title,
                      subtitle
                    })
                  }
                >
                  <img
                    src={popupNotice.imageUrl}
                    alt={title || 'Notice banner'}
                    width={getCustomDimensions().width}
                    height={getCustomDimensions().height}
                    className={`max-w-full transition-transform duration-300 group-hover:scale-[1.02] ${getImageHeightClass()} ${
                      objectFit === 'contain' ? 'object-contain' : 'object-cover w-full'
                    }`}
                    referrerPolicy="no-referrer"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFullScreenImage({
                        url: popupNotice.imageUrl!,
                        title,
                        subtitle
                      });
                    }}
                    className="absolute top-2.5 right-2.5 p-1.5 bg-black/65 hover:bg-black/85 text-white rounded-xl backdrop-blur-xs opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                    title="View Full Image"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Title & Subtitle */}
            {(title || subtitle) && (
              <div className="space-y-1">
                {title && (
                  <h3
                    id="site-popup-title"
                    className="text-xl sm:text-2xl font-bold text-neutral-900 font-editorial leading-snug"
                  >
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs sm:text-sm font-semibold text-emerald-800 font-nepali">
                    {subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Body Content with Expandable / Scrollable Read More for Big Text */}
            {bodyHtml && (
              <div className="space-y-2">
                <div
                  className={`relative transition-all duration-300 ${
                    isLongText && !isExpanded
                      ? 'max-h-36 overflow-hidden'
                      : 'max-h-72 overflow-y-auto pr-1'
                  }`}
                >
                  <RichTextContent
                    content={bodyHtml}
                    className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-nepali"
                  />

                  {isLongText && !isExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white via-white/90 to-transparent pointer-events-none" />
                  )}
                </div>

                {isLongText && (
                  <button
                    type="button"
                    onClick={handleToggleReadMore}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <span>{language === 'np' ? 'कम देखाउनुहोस् (Show Less)' : 'Show Less'}</span>
                        <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        <span>{language === 'np' ? 'थप पढ्नुहोस् (Scroll to Read More)' : 'Read More (Scroll Full Details)'}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="px-4 sm:px-6 py-3.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-4 py-2 text-xs font-bold text-neutral-600 hover:text-neutral-900 bg-neutral-200/70 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              {language === 'np' ? 'बन्द गर्नुहोस्' : 'Dismiss'}
            </button>

            {ctaText && (
              <button
                type="button"
                onClick={() => {
                  handleDismiss();
                  const link = (popupNotice.ctaLink || '').trim();
                  if (!link || link === '#appointment' || link === '/appointment') {
                    if (onOpenAppointment) onOpenAppointment();
                  } else if (link.startsWith('#')) {
                    window.location.hash = link;
                  } else {
                    window.open(link, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>{ctaText}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {fullScreenImage && (
        <FullScreenImageViewer
          isOpen={true}
          imageUrl={fullScreenImage.url}
          title={fullScreenImage.title}
          subtitle={fullScreenImage.subtitle}
          onClose={() => setFullScreenImage(null)}
        />
      )}
    </>
  );
};

import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Minimize2, Move } from 'lucide-react';

interface FullScreenImageViewerProps {
  isOpen: boolean;
  imageUrl: string;
  altText?: string;
  title?: string;
  subtitle?: string;
  onClose: () => void;
}

export const FullScreenImageViewer: React.FC<FullScreenImageViewerProps> = ({
  isOpen,
  imageUrl,
  altText = 'Full screen view',
  title,
  subtitle,
  onClose
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [fitMode, setFitMode] = useState<'contain' | 'original'>('contain');
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset zoom on open
  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setFitMode('contain');
    }
  }, [isOpen, imageUrl]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.min(prev + 0.35, 3.5));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel((prev) => Math.max(prev - 0.35, 0.5));
  };

  const handleResetZoom = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomLevel(1);
    setFitMode('contain');
  };

  const handleToggleFitMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (fitMode === 'contain') {
      setFitMode('original');
      setZoomLevel(1.5);
    } else {
      setFitMode('contain');
      setZoomLevel(1);
    }
  };

  const handleToggleNativeFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => setIsNativeFullscreen(true)).catch(() => {});
      } else {
        document.exitFullscreen().then(() => setIsNativeFullscreen(false)).catch(() => {});
      }
    } catch {
      // Ignore if fullscreen API restricted
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/94 backdrop-blur-md animate-in fade-in select-none"
      onClick={onClose}
    >
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-50 pointer-events-none gap-2">
        <div className="bg-neutral-900/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-neutral-700/60 pointer-events-auto shadow-2xl max-w-md truncate">
          <h4 className="text-sm font-bold text-white truncate font-editorial">
            {title || 'Image Viewer'}
          </h4>
          {subtitle && (
            <p className="text-[11px] text-emerald-400 font-mono truncate">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-700/60 shadow-2xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Zoom In (+)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Zoom Out (-)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToggleFitMode}
            className="px-2.5 py-1.5 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer text-xs font-mono"
            title="Toggle Fit Mode"
          >
            {fitMode === 'contain' ? 'Fit' : '100%'}
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToggleNativeFullscreen}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Native Fullscreen"
          >
            {isNativeFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
          <a
            href={imageUrl}
            download="dr_prem_raj_joshi_medical_photo.jpg"
            onClick={(e) => e.stopPropagation()}
            className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-xl transition-colors cursor-pointer"
            title="Download Image"
          >
            <Download className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl transition-colors cursor-pointer ml-1"
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image Viewport with Zoom Scale and Drag Pan */}
      <div
        className="w-full h-full flex items-center justify-center p-4 sm:p-8 overflow-auto cursor-zoom-out"
        onClick={onClose}
      >
        <div
          className="relative max-w-full max-h-full transition-transform duration-200 ease-out flex items-center justify-center cursor-default"
          style={{ transform: `scale(${zoomLevel})` }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={imageUrl}
            alt={altText}
            className={`rounded-xl shadow-2xl border border-neutral-800 transition-all ${
              fitMode === 'contain'
                ? 'max-h-[86vh] max-w-[94vw] object-contain'
                : 'max-w-none max-h-none object-scale-down'
            }`}
            draggable={false}
          />
        </div>
      </div>

      {/* Bottom Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center pointer-events-none text-neutral-300 text-[11px] font-mono bg-neutral-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-neutral-700/60 shadow-lg">
        Click outside or press ESC to close · Zoom {Math.round(zoomLevel * 100)}%
      </div>
    </div>
  );
};

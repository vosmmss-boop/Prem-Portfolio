import React from 'react';
import { useAccessibility } from '../../context/AccessibilityContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  SlidersHorizontal,
  X,
  Type,
  Sun,
  AlignLeft,
  AlignCenter,
  Eye,
  MousePointer,
  RotateCcw
} from 'lucide-react';

export const AccessibilityPanel: React.FC = () => {
  const { settings, updateSetting, resetSettings, isPanelOpen, setIsPanelOpen } = useAccessibility();
  const { t } = useLanguage();

  return (
    <>
      {/* Low-opacity Floating Accessibility Tools Icon on Left Side */}
      <div className="fixed top-1/2 -translate-y-1/2 left-0 z-40 print:hidden">
        <button
          onClick={() => setIsPanelOpen(!isPanelOpen)}
          className="group bg-neutral-900/70 hover:bg-emerald-800 text-white p-2.5 rounded-r-xl shadow-lg border-y border-r border-emerald-500/30 transition-all duration-300 opacity-35 hover:opacity-100 focus:opacity-100 flex items-center justify-center ring-1 ring-white/10 hover:translate-x-0.5"
          aria-label="Accessibility Tools"
          title="Open Accessibility Tools"
        >
          <SlidersHorizontal className="w-4 h-4 text-amber-300 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Slide-out Accessibility Drawer */}
      {isPanelOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-start bg-black/40 backdrop-blur-2xs animate-in fade-in duration-150">
          <div className="w-80 sm:w-96 bg-white h-full shadow-2xl border-r border-neutral-200 flex flex-col p-6 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-emerald-700" />
                <h3 className="font-bold text-base text-neutral-900">
                  {t('access_title')}
                </h3>
              </div>
              <button
                onClick={() => setIsPanelOpen(false)}
                className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Options */}
            <div className="py-5 space-y-6 flex-1 text-xs">
              {/* 1. Font Size */}
              <div>
                <label className="flex items-center gap-2 font-semibold text-neutral-800 mb-2">
                  <Type className="w-4 h-4 text-emerald-600" />
                  <span>{t('access_font_size')}</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5 bg-neutral-100 p-1 rounded-lg">
                  {(['normal', 'medium', 'large', 'xlarge'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => updateSetting('fontSize', size)}
                      className={`py-1.5 rounded text-xs font-semibold capitalize transition-colors ${
                        settings.fontSize === size
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {size === 'normal' ? '100%' : size === 'medium' ? '110%' : size === 'large' ? '120%' : '130%'}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. High Contrast */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-neutral-800">{t('access_contrast')}</span>
                </div>
                <button
                  onClick={() => updateSetting('highContrast', !settings.highContrast)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.highContrast ? 'bg-emerald-700' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      settings.highContrast ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* 3. Text Alignment */}
              <div>
                <label className="flex items-center gap-2 font-semibold text-neutral-800 mb-2">
                  <AlignLeft className="w-4 h-4 text-emerald-600" />
                  <span>{t('access_alignment')}</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateSetting('textAlign', 'left')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                      settings.textAlign === 'left'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <AlignLeft className="w-3.5 h-3.5" />
                    <span>Left Align</span>
                  </button>
                  <button
                    onClick={() => updateSetting('textAlign', 'justify')}
                    className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-2 ${
                      settings.textAlign === 'justify'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                        : 'border-neutral-200 text-neutral-700 hover:bg-neutral-50'
                    }`}
                  >
                    <AlignCenter className="w-3.5 h-3.5" />
                    <span>Justify</span>
                  </button>
                </div>
              </div>

              {/* 4. Color Filters */}
              <div>
                <label className="flex items-center gap-2 font-semibold text-neutral-800 mb-2">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>{t('access_filters')}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 p-1 rounded-lg">
                  {(['none', 'grayscale', 'warm'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => updateSetting('colorFilter', filter)}
                      className={`py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                        settings.colorFilter === filter
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. Line Spacing */}
              <div>
                <label className="block font-semibold text-neutral-800 mb-2">Line Spacing</label>
                <div className="grid grid-cols-3 gap-1.5 bg-neutral-100 p-1 rounded-lg">
                  {(['normal', 'relaxed', 'loose'] as const).map((space) => (
                    <button
                      key={space}
                      onClick={() => updateSetting('lineSpacing', space)}
                      className={`py-1.5 rounded text-xs font-medium capitalize transition-colors ${
                        settings.lineSpacing === space
                          ? 'bg-white text-emerald-800 shadow-xs'
                          : 'text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {space}
                    </button>
                  ))}
                </div>
              </div>

              {/* 6. Dyslexia Font Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-neutral-800 block">{t('access_dyslexia')}</span>
                  <span className="text-[10px] text-neutral-500">Enhanced letter spacing and distinct glyphs</span>
                </div>
                <button
                  onClick={() => updateSetting('dyslexiaFont', !settings.dyslexiaFont)}
                  className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                    settings.dyslexiaFont ? 'bg-emerald-700' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      settings.dyslexiaFont ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {/* 7. Enlarged Cursor */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MousePointer className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-neutral-800">{t('access_cursor')}</span>
                </div>
                <button
                  onClick={() => updateSetting('largeCursor', !settings.largeCursor)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    settings.largeCursor ? 'bg-emerald-700' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`block w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${
                      settings.largeCursor ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Reset Footer */}
            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={resetSettings}
                className="w-full py-2 px-3 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('access_reset')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

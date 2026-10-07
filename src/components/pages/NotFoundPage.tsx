import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Home, ArrowLeft, Stethoscope, Compass, ExternalLink } from 'lucide-react';

interface NotFoundPageProps {
  onGoHome: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({ onGoHome }) => {
  const { language } = useLanguage();
  const currentSlug = typeof window !== 'undefined'
    ? (window.location.hash || window.location.pathname)
    : '';

  const quickLinks = [
    { label: language === 'np' ? 'गृहपृष्ठ' : 'Home', hash: '#home' },
    { label: language === 'np' ? 'मेरो बारेमा' : 'About Me', hash: '#about' },
    { label: language === 'np' ? 'शैक्षिक यात्रा' : 'Study', hash: '#journey' },
    { label: language === 'np' ? 'क्लिनिकल अनुभव' : 'Work Experience', hash: '#experience' },
    { label: language === 'np' ? 'स्वास्थ्य लेख' : 'Health Blogs', hash: '#blogs' },
    { label: language === 'np' ? 'प्राय सोधिने प्रश्न' : 'FAQ', hash: '#faq' }
  ];

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-6 bg-neutral-100/60">
      <div className="max-w-lg w-full bg-white border border-neutral-200/90 rounded-3xl p-8 md:p-10 text-center shadow-xl space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
          <Stethoscope className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <span className="text-5xl font-black text-neutral-900 font-mono tracking-tight block">
            404
          </span>
          <h1 className="text-2xl font-bold text-neutral-900 font-editorial">
            {language === 'np' ? 'पृष्ठ फेला परेन' : 'Page / Slug Not Found'}
          </h1>
        </div>

        {currentSlug && (
          <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200 font-mono text-xs text-neutral-600 truncate">
            <span className="text-neutral-400 font-semibold mr-1">Attempted route:</span>
            <span className="text-rose-600 font-bold">{currentSlug}</span>
          </div>
        )}

        <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-nepali">
          {language === 'np'
            ? 'तपाईंले खोज्नुभएको पृष्ठ वा स्लग उपलब्ध छैन। डा. प्रेम राज जोशीको आधिकारिक पोर्टलका मान्य सेक्सनहरू तल दिइएका छन्।'
            : 'The requested slug or section does not exist. Please navigate to one of the verified medical portal sections below.'}
        </p>

        {/* Quick Links */}
        <div className="pt-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 font-mono block mb-2">
            {language === 'np' ? 'सिधै जानुहोस्:' : 'Available Sections:'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickLinks.map((ql) => (
              <a
                key={ql.hash}
                href={ql.hash}
                onClick={() => {
                  window.location.hash = ql.hash;
                  onGoHome();
                }}
                className="px-3 py-1.5 bg-neutral-50 hover:bg-emerald-50 text-neutral-700 hover:text-emerald-800 border border-neutral-200 rounded-lg text-xs font-semibold transition-colors"
              >
                {ql.label}
              </a>
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-neutral-100">
          <button
            onClick={onGoHome}
            className="w-full py-3.5 px-5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>
              {language === 'np' ? 'गृहपृष्ठमा फर्कनुहोस् (#home)' : 'Return to Official Portal Home (#home)'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

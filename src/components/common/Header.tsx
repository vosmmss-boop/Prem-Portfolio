import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Branding } from '../../types';
import { formatNepalTime } from '../../utils/nepalTime';
import { initialSocialLinks } from '../../data/initialData';
import {
  Menu,
  X,
  Globe,
  Stethoscope,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Music
} from 'lucide-react';

interface HeaderProps {
  branding: Branding;
  currentView: string;
  onNavigate: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ branding, currentView, onNavigate }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [nptTime, setNptTime] = useState(() => formatNepalTime());

  // Real-time ticking clock
  useEffect(() => {
    const timer = setInterval(() => {
      setNptTime(formatNepalTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic favicon update
  useEffect(() => {
    const favicon = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
    if (favicon && branding.logoUrl) {
      favicon.href = branding.logoUrl;
    }
  }, [branding.logoUrl]);

  // Main page navigation anchors
  const navLinks = [
    { label: language === 'np' ? 'गृहपृष्ठ' : 'Home', href: '#home' },
    { label: language === 'np' ? 'मेरो बारेमा' : 'About', href: '#about' },
    { label: language === 'np' ? 'शैक्षिक यात्रा' : 'Study', href: '#journey' },
    { label: language === 'np' ? 'कार्य अनुभव' : 'Work', href: '#experience' },
    { label: language === 'np' ? 'सञ्जाल' : 'Social Media', href: '#socialmedia' },
    { label: language === 'np' ? 'ग्यालरी' : 'Gallery', href: '#gallery' },
    { label: language === 'np' ? 'स्वास्थ्य लेख' : 'Blogs', href: '#blogs' },
    { label: language === 'np' ? 'प्राय सोधिने प्रश्न' : 'FAQ', href: '#faq' }
  ];

  const activeSocialLinks = {
    facebook: branding.socialLinks?.facebook || initialSocialLinks.facebook,
    instagram: branding.socialLinks?.instagram || initialSocialLinks.instagram,
    tiktok: branding.socialLinks?.tiktok || initialSocialLinks.tiktok,
    twitter: branding.socialLinks?.twitter || initialSocialLinks.twitter,
    youtube: branding.socialLinks?.youtube || initialSocialLinks.youtube
  };

  return (
    <header className="sticky top-0 z-40 bg-white/98 backdrop-blur-md border-b border-neutral-200 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 md:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Brand Identity: Bold DR. PREM RAJ JOSHI & Flickering BAMS IOM TU AYURVEDIC PHYSICIAN */}
          <div className="flex items-center gap-3.5">
            <a
              href="#home"
              onClick={(e) => {
                if (currentView !== 'main') {
                  e.preventDefault();
                  onNavigate('main');
                }
              }}
              className="flex items-center gap-3 group"
            >
              <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden border-2 border-emerald-600 shadow-sm shrink-0">
                <img
                  src={branding.logoUrl}
                  alt="Dr. Prem Raj Joshi"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-black tracking-tight text-neutral-950 font-editorial uppercase leading-tight">
                  DR. PREM RAJ JOSHI
                </h1>
                <div className="text-[11px] sm:text-xs font-extrabold tracking-wide uppercase font-mono animate-flicker text-emerald-800 leading-tight mt-0.5">
                  BAMS, IOM, TU · AYURVEDIC PHYSICIAN
                </div>
              </div>
            </a>
          </div>

          {/* Center-Right on Desktop/PC: Social Media Icons with Bold Nepali Date & 12HRS Time Below */}
          <div className="hidden lg:flex flex-col items-center justify-center gap-1 px-3.5 py-1.5 bg-neutral-50/90 rounded-xl border border-neutral-200 shadow-2xs">
            {/* Social Media Icons: Facebook, TikTok, Instagram, X, YouTube */}
            <div className="flex items-center gap-2">
              <a
                href={activeSocialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-md bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white flex items-center justify-center transition-all shadow-2xs"
                title="Facebook"
              >
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a
                href={activeSocialLinks.tiktok}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-md bg-neutral-100 hover:bg-neutral-900 text-neutral-800 hover:text-white flex items-center justify-center transition-all shadow-2xs"
                title="TikTok"
              >
                <Music className="w-3.5 h-3.5" />
              </a>
              <a
                href={activeSocialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-md bg-pink-50 hover:bg-pink-600 text-pink-700 hover:text-white flex items-center justify-center transition-all shadow-2xs"
                title="Instagram"
              >
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a
                href={activeSocialLinks.twitter}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-md bg-sky-50 hover:bg-sky-500 text-sky-700 hover:text-white flex items-center justify-center transition-all shadow-2xs"
                title="X (Twitter)"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href={activeSocialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                className="w-6 h-6 rounded-md bg-red-50 hover:bg-red-600 text-red-700 hover:text-white flex items-center justify-center transition-all shadow-2xs"
                title="YouTube"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Nepali Date & Time in BOLD: 22 Asoj 2083 and 12-Hour Time */}
            <div className="flex items-center gap-1.5 text-[11px] font-mono leading-none tracking-tight">
              <span className="font-extrabold text-neutral-900 bg-neutral-200/80 px-1.5 py-0.5 rounded text-[11px]" title="Nepali Bikram Sambat Date">
                {language === 'np' ? nptTime.asojDateNp : nptTime.asojDateEn}
              </span>
              <span className="font-extrabold text-emerald-900 bg-emerald-100/90 px-1.5 py-0.5 rounded text-[11px]" title="Nepal Standard Time (12-Hour format)">
                {language === 'np' ? nptTime.time12Np : nptTime.time12En}
              </span>
            </div>
          </div>

          {/* Navigation Links on Desktop */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-5 text-xs font-bold text-neutral-700">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  if (currentView !== 'main') {
                    e.preventDefault();
                    onNavigate('main');
                    setTimeout(() => {
                      window.location.hash = link.href;
                    }, 100);
                  }
                }}
                className="hover:text-emerald-700 transition-colors py-1 relative hover:after:w-full after:w-0 after:h-0.5 after:bg-emerald-600 after:absolute after:bottom-0 after:left-0 after:transition-all whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action Buttons: Language Switcher & Consultation CTA */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-300 text-xs font-bold text-neutral-800 hover:text-emerald-700 hover:border-emerald-500 bg-neutral-50 hover:bg-emerald-50/50 transition-all shadow-2xs whitespace-nowrap"
              aria-label="Switch Language"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'नेपाली' : 'EN'}</span>
            </button>

            <a
              href="#appointment"
              onClick={(e) => {
                if (currentView !== 'main') {
                  e.preventDefault();
                  onNavigate('main');
                  setTimeout(() => {
                    window.location.hash = '#appointment';
                  }, 100);
                }
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{language === 'np' ? 'परामर्श लिनुहोस्' : 'Appointment'}</span>
            </a>

            {/* Mobile hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-lg text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Tablet / Mobile Sub-Bar: Nepali Date & Time */}
        <div className="xl:hidden mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-1.5">
            <a href={activeSocialLinks.facebook} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-blue-600"><Facebook className="w-3.5 h-3.5" /></a>
            <a href={activeSocialLinks.tiktok} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-neutral-900"><Music className="w-3.5 h-3.5" /></a>
            <a href={activeSocialLinks.instagram} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-pink-600"><Instagram className="w-3.5 h-3.5" /></a>
            <a href={activeSocialLinks.youtube} target="_blank" rel="noreferrer" className="text-neutral-600 hover:text-red-600"><Youtube className="w-3.5 h-3.5" /></a>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 font-semibold text-[10px]">NPT:</span>
            <span className="font-black text-neutral-900 bg-neutral-200/70 px-1 py-0.5 rounded text-[10px]">
              {language === 'np' ? nptTime.asojDateNp : nptTime.asojDateEn}
            </span>
            <span className="font-black text-emerald-800 bg-emerald-100/70 px-1 py-0.5 rounded text-[10px]">
              {language === 'np' ? nptTime.time12Np : nptTime.time12En}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-6 py-4 space-y-3 animate-in fade-in">
          <div className="grid grid-cols-2 gap-2 text-xs font-bold">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentView !== 'main') {
                    onNavigate('main');
                    setTimeout(() => {
                      window.location.hash = link.href;
                    }, 100);
                  }
                }}
                className="py-2 px-3 rounded-lg text-neutral-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

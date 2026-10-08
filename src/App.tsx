import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { AuthProvider } from './context/AuthContext';
import {
  Branding,
  HeroSlide,
  Autobiography,
  EducationMilestone,
  ExperienceEntry,
  BlogArticle,
  FAQItem,
  UsefulLink,
  DownloadItem,
  GalleryItem,
  PatientInquiry
} from './types';
import {
  initialBranding,
  initialHeroSlides,
  initialAutobiography,
  initialEducation,
  initialExperience,
  initialBlogs,
  initialFAQs,
  initialUsefulLinks,
  initialDownloads,
  initialGallery,
  initialPatientInquiries,
  initialSocialLinks
} from './data/initialData';
import { subscribeToNode, getLocal, STORAGE_KEYS } from './services/firebase';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { NamasteWidget } from './components/common/NamasteWidget';
import { AccessibilityPanel } from './components/common/AccessibilityPanel';
import { HeaderSkeleton } from './components/common/SkeletonLoaders';

import { HeroSlider } from './components/sections/HeroSlider';
import { AutobiographySection } from './components/sections/AutobiographySection';
import { JourneySection } from './components/sections/JourneySection';
import { ExperienceSection } from './components/sections/ExperienceSection';
import { SocialMediaSection } from './components/sections/SocialMediaSection';
import { GallerySection } from './components/sections/GallerySection';
import { BlogsSection } from './components/sections/BlogsSection';
import { FAQSection } from './components/sections/FAQSection';
import { DownloadsLinksSection } from './components/sections/DownloadsLinksSection';
import { AdminPortal } from './components/admin/AdminPortal';
import { InquiriesPortal } from './components/inquiries/InquiriesPortal';
import { NotFoundPage } from './components/pages/NotFoundPage';

export function AppContent() {
  // Navigation / View State ('main' | 'admin' | 'inquiries' | '404')
  const [currentView, setCurrentView] = useState<'main' | 'admin' | 'inquiries' | '404'>('main');

  // Loading state with 3-second maximum fallback
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Entities state loaded from Local Storage first so CMS updates are shown immediately, then synced with Firebase Realtime Database
  const [branding, setBranding] = useState<Branding>(() => getLocal(STORAGE_KEYS.BRANDING, initialBranding));
  const [slides, setSlides] = useState<HeroSlide[]>(() => getLocal(STORAGE_KEYS.SLIDERS, initialHeroSlides));
  const [autobiography, setAutobiography] = useState<Autobiography>(() => getLocal(STORAGE_KEYS.AUTOBIOGRAPHY, initialAutobiography));
  const [education, setEducation] = useState<EducationMilestone[]>(() => getLocal(STORAGE_KEYS.EDUCATION, initialEducation));
  const [experience, setExperience] = useState<ExperienceEntry[]>(() => getLocal(STORAGE_KEYS.EXPERIENCE, initialExperience));
  const [blogs, setBlogs] = useState<BlogArticle[]>(() => getLocal(STORAGE_KEYS.BLOGS, initialBlogs));
  const [faqs, setFaqs] = useState<FAQItem[]>(() => getLocal(STORAGE_KEYS.FAQ, initialFAQs));
  const [usefulLinks, setUsefulLinks] = useState<UsefulLink[]>(() => getLocal(STORAGE_KEYS.LINKS, initialUsefulLinks));
  const [downloads, setDownloads] = useState<DownloadItem[]>(() => getLocal(STORAGE_KEYS.DOWNLOADS, initialDownloads));
  const [gallery, setGallery] = useState<GalleryItem[]>(() => getLocal(STORAGE_KEYS.GALLERY, initialGallery));
  const [inquiries, setInquiries] = useState<PatientInquiry[]>(() => getLocal(STORAGE_KEYS.INQUIRIES, initialPatientInquiries));


  // Dynamic SEO JSON-LD injection
  useEffect(() => {
    let script = document.getElementById('json-ld-doctor') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'json-ld-doctor';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    const schema = {
      "@context": "https://schema.org",
      "@type": ["Physician", "MedicalBusiness"],
      "name": "Dr. Prem Raj Joshi",
      "alternateName": "डा. प्रेम राज जोशी",
      "medicalSpecialty": [
        "Ayurvedic Medicine",
        "Holistic Health",
        "Kayachikitsa",
        "Panchakarma",
        "Gastroenterology"
      ],
      "description": branding.tagline?.en || "Integrative Ayurvedic Physician & Holistic Health Practitioner in Nepal.",
      "url": "https://drpremrajjoshi.com.np",
      "telephone": branding.phone,
      "email": branding.email,
      "image": "https://drpremrajjoshi.com.np/src/assets/images/doctor_portrait_1791392878397.jpg",
      "hasCredential": {
        "@type": "EducationalOccupationalCredential",
        "credentialCategory": "degree",
        "name": "Bachelor of Ayurvedic Medicine and Surgery (BAMS)",
        "recognizedBy": {
          "@type": "CollegeOrUniversity",
          "name": "Institute of Medicine (IOM), Maharajgunj Medical Campus, Tribhuvan University"
        }
      },
      "identifier": branding.nmcNumber || "NMC Reg. 1824",
      "address": [
        {
          "@type": "PostalAddress",
          "streetAddress": "Maharajgunj Medical Zone",
          "addressLocality": "Kathmandu",
          "addressRegion": "Bagmati Province",
          "addressCountry": "NP"
        },
        {
          "@type": "PostalAddress",
          "streetAddress": "Dhangadhi Sub-Metropolitan",
          "addressLocality": "Kailali",
          "addressRegion": "Sudurpashchim Province",
          "addressCountry": "NP"
        }
      ],
      "sameAs": [
        "https://facebook.com/drpremrajjoshi",
        "https://youtube.com/@drpremrajjoshi",
        "https://instagram.com/drpremrajjoshi",
        "https://twitter.com/drpremrajjoshi"
      ]
    };
    script.text = JSON.stringify(schema);
  }, [branding]);

  // Handle URL hash and route changes (Secret slugs: /webadminprem and /inq-prem)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.toLowerCase();
      const rawPath = window.location.pathname.toLowerCase();

      // Check for Admin CMS slug /webadminprem
      if (rawHash === '#webadminprem' || rawHash === '#admin' || rawPath === '/webadminprem') {
        setCurrentView('admin');
        return;
      }

      // Check for Inquiries Portal slug /inq-prem
      if (rawHash === '#inq-prem' || rawHash === '#inquiries' || rawPath === '/inq-prem') {
        setCurrentView('inquiries');
        return;
      }

      // Check for /gallery slug or #gallery
      if (rawPath === '/gallery') {
        setCurrentView('main');
        setTimeout(() => {
          const el = document.getElementById('gallery');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      // If user typed an invalid path like /wrong-slug, render custom 404 page
      const isRootPath = rawPath === '/' || rawPath === '' || rawPath === '/index.html';
      if (!isRootPath) {
        setCurrentView('404');
        return;
      }

      // Check standard anchors
      if (
        rawHash === '' ||
        rawHash === '#' ||
        rawHash === '#home' ||
        rawHash === '#about' ||
        rawHash === '#journey' ||
        rawHash === '#experience' ||
        rawHash === '#socialmedia' ||
        rawHash === '#gallery' ||
        rawHash === '#blogs' ||
        rawHash === '#faq' ||
        rawHash === '#downloads' ||
        rawHash === '#appointment' ||
        rawHash.startsWith('#blog-') ||
        rawHash.startsWith('#journey-') ||
        rawHash.startsWith('#experience-')
      ) {
        setCurrentView('main');
        if (rawHash === '#appointment') {
          const namasteBtn = document.querySelector('button[aria-label*="Namaste"]') as HTMLButtonElement | null;
          if (namasteBtn) namasteBtn.click();
        }
      } else {
        setCurrentView('404');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Firebase Realtime Database WebSocket listeners with 3-second Max Timeout fallback
  useEffect(() => {
    let loadedCount = 0;
    const totalNodes = 10;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalNodes) {
        setIsDataLoading(false);
      }
    };

    // Hard fallback safety timer: after 3000ms, always dismiss skeletons
    const fallbackTimer = setTimeout(() => {
      setIsDataLoading(false);
    }, 3000);

    const unsubBranding = subscribeToNode<Branding>(
      'branding',
      'dr_joshi_branding',
      initialBranding,
      setBranding,
      checkAllLoaded
    );

    const unsubSliders = subscribeToNode<HeroSlide[]>(
      'slider_images',
      'dr_joshi_slider_images',
      initialHeroSlides,
      setSlides,
      checkAllLoaded
    );

    const unsubBio = subscribeToNode<Autobiography>(
      'autobiography',
      'dr_joshi_autobiography',
      initialAutobiography,
      setAutobiography,
      checkAllLoaded
    );

    const unsubEdu = subscribeToNode<EducationMilestone[]>(
      'education',
      'dr_joshi_education',
      initialEducation,
      setEducation,
      checkAllLoaded
    );

    const unsubExp = subscribeToNode<ExperienceEntry[]>(
      'experience',
      'dr_joshi_experience',
      initialExperience,
      setExperience,
      checkAllLoaded
    );

    const unsubBlogs = subscribeToNode<BlogArticle[]>(
      'blogs',
      'dr_joshi_blogs',
      initialBlogs,
      setBlogs,
      checkAllLoaded
    );

    const unsubFaq = subscribeToNode<FAQItem[]>(
      'faq',
      'dr_joshi_faq',
      initialFAQs,
      setFaqs,
      checkAllLoaded
    );

    const unsubLinks = subscribeToNode<UsefulLink[]>(
      'links',
      'dr_joshi_links',
      initialUsefulLinks,
      setUsefulLinks,
      checkAllLoaded
    );

    const unsubDownloads = subscribeToNode<DownloadItem[]>(
      'downloads',
      'dr_joshi_downloads',
      initialDownloads,
      setDownloads,
      checkAllLoaded
    );

    const unsubGallery = subscribeToNode<GalleryItem[]>(
      'gallery',
      'dr_joshi_gallery',
      initialGallery,
      setGallery,
      checkAllLoaded
    );

    const unsubInquiries = subscribeToNode<PatientInquiry[]>(
      'patient_inquiries',
      'dr_joshi_patient_inquiries',
      initialPatientInquiries,
      setInquiries,
      checkAllLoaded
    );

    return () => {
      clearTimeout(fallbackTimer);
      unsubBranding();
      unsubSliders();
      unsubBio();
      unsubEdu();
      unsubExp();
      unsubBlogs();
      unsubFaq();
      unsubLinks();
      unsubDownloads();
      unsubGallery();
      unsubInquiries();
    };
  }, []);

  const handleNavigate = (view: string) => {
    window.location.hash = '#home';
    setCurrentView('main');
  };

  const handleOpenAppointmentModal = () => {
    const namasteBtn = document.querySelector('button[aria-label*="Namaste"]') as HTMLButtonElement | null;
    if (namasteBtn) {
      namasteBtn.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 selection:bg-emerald-600 selection:text-white text-neutral-900">
      {/* 1. CMS Admin Portal View (/webadminprem) - Pure Content Management */}
      {currentView === 'admin' ? (
        <AdminPortal
          branding={branding}
          onUpdateBranding={setBranding}
          slides={slides}
          onUpdateSlides={setSlides}
          autobiography={autobiography}
          onUpdateAutobiography={setAutobiography}
          education={education}
          onUpdateEducation={setEducation}
          experience={experience}
          onUpdateExperience={setExperience}
          blogs={blogs}
          onUpdateBlogs={setBlogs}
          faqs={faqs}
          onUpdateFaqs={setFaqs}
          usefulLinks={usefulLinks}
          onUpdateUsefulLinks={setUsefulLinks}
          downloads={downloads}
          onUpdateDownloads={setDownloads}
          gallery={gallery}
          onUpdateGallery={setGallery}
          onBackToSite={() => handleNavigate('main')}
        />
      ) : currentView === 'inquiries' ? (
        /* 2. Patient Inquiries Portal View (/inq-prem) - Card-based Patient Inquiries */
        <InquiriesPortal
          inquiries={inquiries}
          onUpdateInquiries={setInquiries}
          onBackToSite={() => handleNavigate('main')}
        />
      ) : currentView === '404' ? (
        /* 3. Custom 404 View */
        <>
          <Header
            branding={branding}
            currentView={currentView}
            onNavigate={handleNavigate}
          />
          <main className="flex-1">
            <NotFoundPage onGoHome={() => handleNavigate('main')} />
          </main>
          <Footer
            branding={branding}
            usefulLinks={usefulLinks}
          />
        </>
      ) : (
        /* 4. Main Public Website View */
        <>
          {isDataLoading ? (
            <HeaderSkeleton />
          ) : (
            <Header
              branding={branding}
              currentView={currentView}
              onNavigate={handleNavigate}
            />
          )}

          <main className="flex-1">
            {/* Section 1: Hero Carousel (#home) */}
            <HeroSlider
              slides={slides}
              isLoading={isDataLoading}
              onOpenAppointment={handleOpenAppointmentModal}
            />

            {/* Section 2: Autobiography (#about) */}
            <AutobiographySection
              autobiography={autobiography}
              branding={branding}
              isLoading={isDataLoading}
              onOpenAppointment={handleOpenAppointmentModal}
            />

            {/* Section 3: Educational Journey (#journey) */}
            <JourneySection
              education={education}
              isLoading={isDataLoading}
            />

            {/* Section 4: Clinical Work Experience (#experience) */}
            <ExperienceSection
              experience={experience}
              isLoading={isDataLoading}
            />

            {/* Section 5: Official Social Media Handles (#socialmedia) */}
            <SocialMediaSection
              socialLinks={{
                facebook: branding.socialLinks?.facebook || initialSocialLinks.facebook,
                instagram: branding.socialLinks?.instagram || initialSocialLinks.instagram,
                tiktok: branding.socialLinks?.tiktok || initialSocialLinks.tiktok,
                twitter: branding.socialLinks?.twitter || initialSocialLinks.twitter,
                youtube: branding.socialLinks?.youtube || initialSocialLinks.youtube,
                whatsapp: branding.socialLinks?.whatsapp || initialSocialLinks.whatsapp
              }}
            />

            {/* Section 6: Photo Archive & YouTube Video (#gallery) */}
            <GallerySection
              gallery={gallery}
              branding={branding}
              isLoading={isDataLoading}
            />

            {/* Section 7: Dynamic Health Blogs (#blogs) */}
            <BlogsSection
              blogs={blogs}
              isLoading={isDataLoading}
            />

            {/* Section 8: Frequently Asked Questions (#faq) */}
            <FAQSection
              faqs={faqs}
              isLoading={isDataLoading}
            />

            {/* Section 9: Patient Downloads (PDFs) */}
            <DownloadsLinksSection
              downloads={downloads}
            />
          </main>

          <Footer
            branding={branding}
            usefulLinks={usefulLinks}
          />

          {/* Sticky Namaste Appointment & Prescription Widget */}
          <NamasteWidget
            doctorPhone={branding.phone}
            onInquirySubmitted={(newInquiry) => {
              setInquiries((prev) => [newInquiry, ...prev]);
            }}
          />

          {/* Floating Accessibility Tools Button & Panel */}
          <AccessibilityPanel />
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <AccessibilityProvider>
          <AppContent />
        </AccessibilityProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}

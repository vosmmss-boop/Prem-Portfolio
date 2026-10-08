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
import { sanitizeSlug } from './utils/slugify';

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

  // Active blog slug for direct route access (/blog/:slug)
  const [activeBlogSlug, setActiveBlogSlug] = useState<string | null>(null);

  // Appointment & Track Appointment modal states
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [appointmentDefaultTab, setAppointmentDefaultTab] = useState<'book' | 'track'>('book');

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

  // Synchronized doctor profile photo across the entire site
  const syncedDoctorPhoto = branding.logoUrl || autobiography.avatarUrl;

  // Dynamic SEO JSON-LD & Open Graph Meta synchronization with uploaded logo image
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
      "image": syncedDoctorPhoto || "https://drpremrajjoshi.com.np/src/assets/images/doctor_portrait_1791392878397.jpg",
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

    // Sync dynamic favicon and social meta tags with uploaded logo image
    if (syncedDoctorPhoto) {
      const fav = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
      if (fav) fav.href = syncedDoctorPhoto;
      const ogImg = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
      if (ogImg) ogImg.content = syncedDoctorPhoto;
      const twImg = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement | null;
      if (twImg) twImg.content = syncedDoctorPhoto;
    }
  }, [branding, autobiography, syncedDoctorPhoto]);

  // Clean Path Router with Backward Compatibility for Legacy Hashes and Dynamic Slugs
  useEffect(() => {
    const handleLocationChange = () => {
      // 0. Detect 404.html redirect query parameter: ?p=/blog/slug
      const urlParams = new URLSearchParams(window.location.search);
      const pParam = urlParams.get('p');
      let rawHash = window.location.hash.toLowerCase();
      let rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';

      if (pParam) {
        const decoded = decodeURIComponent(pParam);
        const hParam = urlParams.get('h');
        const hashStr = hParam ? '#' + decodeURIComponent(hParam) : '';
        window.history.replaceState(null, '', decoded + hashStr);
        rawPath = decoded.toLowerCase().replace(/\/+$/, '') || '/';
        if (hashStr) rawHash = hashStr.toLowerCase();
      }

      // 1. Backward Compatibility: auto-redirect legacy hash paths to clean URLs
      if (rawHash.startsWith('#blog-')) {
        const slug = sanitizeSlug(rawHash.slice(6));
        window.history.replaceState(null, '', `/blog/${slug}`);
        rawPath = `/blog/${slug}`;
        rawHash = '';
      } else if (rawHash.startsWith('#/blog/')) {
        const slug = sanitizeSlug(rawHash.slice(7));
        window.history.replaceState(null, '', `/blog/${slug}`);
        rawPath = `/blog/${slug}`;
        rawHash = '';
      } else if (rawHash.startsWith('#journey-')) {
        const slug = sanitizeSlug(rawHash.slice(9));
        window.history.replaceState(null, '', `/journey/${slug}`);
        rawPath = `/journey/${slug}`;
        rawHash = '';
      } else if (rawHash.startsWith('#experience-')) {
        const slug = sanitizeSlug(rawHash.slice(12));
        window.history.replaceState(null, '', `/experience/${slug}`);
        rawPath = `/experience/${slug}`;
        rawHash = '';
      } else if (rawHash === '#track' || rawHash === '#track-appointment') {
        window.history.replaceState(null, '', '/track');
        rawPath = '/track';
        rawHash = '';
      } else if (rawHash === '#appointment') {
        window.history.replaceState(null, '', '/appointment');
        rawPath = '/appointment';
        rawHash = '';
      } else if (rawHash === '#webadminprem' || rawHash === '#admin') {
        window.history.replaceState(null, '', '/webadminprem');
        rawPath = '/webadminprem';
        rawHash = '';
      } else if (rawHash === '#inq-prem' || rawHash === '#inquiries') {
        window.history.replaceState(null, '', '/inq-prem');
        rawPath = '/inq-prem';
        rawHash = '';
      }

      // 2. Secret slugs: Admin CMS (/webadminprem) & Inquiries Portal (/inq-prem)
      if (rawPath === '/webadminprem' || rawPath === '/admin') {
        setCurrentView('admin');
        setActiveBlogSlug(null);
        setIsAppointmentModalOpen(false);
        return;
      }

      if (rawPath === '/inq-prem' || rawPath === '/inquiries') {
        setCurrentView('inquiries');
        setActiveBlogSlug(null);
        setIsAppointmentModalOpen(false);
        return;
      }

      // 3. Track Appointment Status (/track)
      if (rawPath === '/track' || rawPath === '/track-appointment') {
        setCurrentView('main');
        setActiveBlogSlug(null);
        setIsAppointmentModalOpen(true);
        setAppointmentDefaultTab('track');
        return;
      }

      // 4. Appointment Booking (/appointment)
      if (rawPath === '/appointment') {
        setCurrentView('main');
        setActiveBlogSlug(null);
        setIsAppointmentModalOpen(true);
        setAppointmentDefaultTab('book');
        return;
      }

      // 5. Gallery Route (/gallery)
      if (rawPath === '/gallery') {
        setCurrentView('main');
        setActiveBlogSlug(null);
        setTimeout(() => {
          const el = document.getElementById('gallery');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      // 6. Clean Blog Article Route: /blog/:slug
      if (rawPath.startsWith('/blog/')) {
        const slug = sanitizeSlug(rawPath.slice(6));
        setCurrentView('main');
        setActiveBlogSlug(slug);
        setTimeout(() => {
          const el = document.getElementById('blogs');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      // 7. Clean Journey Route: /journey/:slug
      if (rawPath.startsWith('/journey/')) {
        setCurrentView('main');
        setActiveBlogSlug(null);
        setTimeout(() => {
          const el = document.getElementById('journey');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      // 8. Clean Experience Route: /experience/:slug
      if (rawPath.startsWith('/experience/')) {
        setCurrentView('main');
        setActiveBlogSlug(null);
        setTimeout(() => {
          const el = document.getElementById('experience');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return;
      }

      // 9. Root / Base Path: / or /index.html
      const isRoot = rawPath === '/' || rawPath === '' || rawPath === '/index.html';
      if (isRoot) {
        setCurrentView('main');
        setActiveBlogSlug(null);
        // If there's an anchor hash like #about or #journey, scroll to it
        if (rawHash && rawHash !== '#' && rawHash !== '#home') {
          const targetId = rawHash.replace('#', '');
          setTimeout(() => {
            const el = document.getElementById(targetId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
        }
        return;
      }

      // 10. Direct slug matching: /:slug (e.g. /health-article-amit or /bams-iom-tu)
      const directSlug = sanitizeSlug(rawPath.slice(1));
      if (directSlug) {
        // Match against blogs
        const matchedBlog = blogs.find(
          (b) => sanitizeSlug(b.slug) === directSlug || sanitizeSlug(b.titleEn) === directSlug
        );
        if (matchedBlog) {
          window.history.replaceState(null, '', `/blog/${sanitizeSlug(matchedBlog.slug)}`);
          setCurrentView('main');
          setActiveBlogSlug(sanitizeSlug(matchedBlog.slug));
          return;
        }

        // Match against education milestones
        const matchedEdu = education.find(
          (e) => sanitizeSlug(e.slug) === directSlug
        );
        if (matchedEdu) {
          window.history.replaceState(null, '', `/journey/${directSlug}`);
          setCurrentView('main');
          setTimeout(() => {
            const el = document.getElementById('journey');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
          return;
        }

        // Match against experience
        const matchedExp = experience.find(
          (e) => sanitizeSlug(e.slug) === directSlug
        );
        if (matchedExp) {
          window.history.replaceState(null, '', `/experience/${directSlug}`);
          setCurrentView('main');
          setTimeout(() => {
            const el = document.getElementById('experience');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
          return;
        }

        // Match direct article slug (e.g. /health-article-amit or /blog-...)
        if (directSlug.startsWith('health-article-') || directSlug.startsWith('blog-') || directSlug.includes('article') || directSlug.includes('ayurveda')) {
          window.history.replaceState(null, '', `/blog/${directSlug}`);
          setCurrentView('main');
          setActiveBlogSlug(directSlug);
          return;
        }

        // Match section anchors
        if (['about', 'home', 'journey', 'experience', 'socialmedia', 'gallery', 'blogs', 'faq', 'downloads'].includes(directSlug)) {
          setCurrentView('main');
          setTimeout(() => {
            const el = document.getElementById(directSlug);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 150);
          return;
        }

        // While Firebase is loading, do not prematurely display 404
        if (isDataLoading) {
          setCurrentView('main');
          return;
        }

        // Unmatched path
        setCurrentView('404');
        return;
      }

      setCurrentView('404');
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, [blogs, education, experience, isDataLoading]);

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
    window.history.pushState(null, '', '/');
    setCurrentView('main');
    setActiveBlogSlug(null);
    setIsAppointmentModalOpen(false);
  };

  const handleOpenAppointmentModal = () => {
    setIsAppointmentModalOpen(true);
    setAppointmentDefaultTab('book');
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
          branding={branding}
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

            {/* Section 2: Autobiography (#about) - Synced Doctor Portrait */}
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
              branding={branding}
              isLoading={isDataLoading}
            />

            {/* Section 5: Official Social Media Handles (#socialmedia) */}
            <SocialMediaSection
              socialLinks={{
                facebook: branding.socialLinks?.facebook !== undefined ? branding.socialLinks.facebook : initialSocialLinks.facebook,
                instagram: branding.socialLinks?.instagram !== undefined ? branding.socialLinks.instagram : initialSocialLinks.instagram,
                tiktok: branding.socialLinks?.tiktok !== undefined ? branding.socialLinks.tiktok : initialSocialLinks.tiktok,
                twitter: branding.socialLinks?.twitter !== undefined ? branding.socialLinks.twitter : initialSocialLinks.twitter,
                youtube: branding.socialLinks?.youtube !== undefined ? branding.socialLinks.youtube : initialSocialLinks.youtube,
                whatsapp: branding.socialLinks?.whatsapp !== undefined ? branding.socialLinks.whatsapp : initialSocialLinks.whatsapp
              }}
            />

            {/* Section 6: Photo Archive & YouTube Video (#gallery) */}
            <GallerySection
              gallery={gallery}
              branding={branding}
              isLoading={isDataLoading}
            />

            {/* Section 7: Dynamic Health Blogs (/blog/:slug) - Synced Doctor Photo & Clean Path Routing */}
            <BlogsSection
              blogs={blogs}
              isLoading={isDataLoading}
              activeBlogSlug={activeBlogSlug}
              onCloseBlog={() => {
                setActiveBlogSlug(null);
                window.history.pushState(null, '', '/#blogs');
              }}
              doctorImage={syncedDoctorPhoto}
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

          {/* Sticky Namaste Appointment, Status Tracking & Prescription Widget */}
          <NamasteWidget
            doctorPhone={branding.phone}
            doctorImage={syncedDoctorPhoto}
            inquiries={inquiries}
            isOpenExternal={isAppointmentModalOpen}
            defaultTab={appointmentDefaultTab}
            onCloseExternal={() => {
              setIsAppointmentModalOpen(false);
              const p = window.location.pathname;
              if (p === '/track' || p === '/appointment') {
                window.history.pushState(null, '', '/');
              }
            }}
            onInquirySubmitted={(newInquiry) => {
              setInquiries((prev) => [newInquiry, ...prev.filter((i) => i.id !== newInquiry.id)]);
            }}
            onInquiryUpdated={(updatedInquiry) => {
              setInquiries((prev) =>
                prev.map((i) => (i.id === updatedInquiry.id ? updatedInquiry : i))
              );
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

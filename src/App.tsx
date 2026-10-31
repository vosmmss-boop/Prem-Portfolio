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
import {
  subscribeToNode,
  getLocal,
  mergeAndNormalizeInquiries,
  STORAGE_KEYS
} from './services/firebase';
import { sanitizeSlug } from './utils/slugify';
import { updateFavicon } from './utils/favicon';
import { Stethoscope, Search, MessageSquarePlus } from 'lucide-react';

import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { NamasteWidget } from './components/common/NamasteWidget';
import { AccessibilityPanel } from './components/common/AccessibilityPanel';
import { HeaderSkeleton } from './components/common/SkeletonLoaders';
import { SitePopupModal } from './components/common/SitePopupModal';

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

  // Instant Render: If window.INITIAL_LATEST_DATA or local cache is present, 0ms frame-zero load; otherwise keep skeleton active until Firebase responds
  const [isDataLoading, setIsDataLoading] = useState(() => {
    if (typeof window !== 'undefined') {
      const win = window as any;
      if (win.INITIAL_LATEST_DATA) return false;
      try {
        const cached = localStorage.getItem(STORAGE_KEYS.BRANDING);
        if (cached) return false;
      } catch (e) {}
      return true;
    }
    return false;
  });

  // Ensure DOM skeleton is hidden and root is visible once hydration or data is ready
  useEffect(() => {
    const skeleton = document.getElementById('app-skeleton');
    const root = document.getElementById('root');
    if (!isDataLoading) {
      if (skeleton) skeleton.style.display = 'none';
      if (root) root.style.display = 'block';
    }
  }, [isDataLoading]);

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
      "image": syncedDoctorPhoto || "https://drpremrajjoshi.com.np/logo.png",
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

    // Sync dynamic favicon across all link tags and social meta tags with uploaded logo image
    if (syncedDoctorPhoto && !syncedDoctorPhoto.trim().toLowerCase().startsWith('data:')) {
      updateFavicon(syncedDoctorPhoto.trim());
      const absolutePhotoUrl = syncedDoctorPhoto.startsWith('http')
        ? syncedDoctorPhoto
        : 'https://drpremrajjoshi.com.np/logo.png';
      const ogImg = document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null;
      if (ogImg) ogImg.content = absolutePhotoUrl;
      const twImg = document.querySelector('meta[name="twitter:image"]') as HTMLMetaElement | null;
      if (twImg) twImg.content = absolutePhotoUrl;
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

      // 1. Hash Fragment Routing: Admin Panel (/#drpremlogin) & Patient Inquiries (/#drpreminq)
      if (rawHash.includes('drpremlogin') || rawHash === '#admin' || rawHash === '#webadminprem') {
        if (rawHash !== '#drpremlogin') {
          window.history.replaceState(null, '', '/#drpremlogin');
        }
        const skeleton = document.getElementById('app-skeleton');
        const root = document.getElementById('root');
        if (skeleton) skeleton.style.display = 'none';
        if (root) root.style.display = 'block';
        setIsDataLoading(false);
        setCurrentView('admin');
        setActiveBlogSlug(null);
        setIsAppointmentModalOpen(false);
        return;
      }

      if (rawHash.includes('drpreminq') || rawHash === '#inquiries' || rawHash === '#inquires' || rawHash === '#inq-prem' || rawHash === '#inquiry-section') {
        if (rawHash !== '#drpreminq' && rawHash !== '#inquiry-section') {
          window.history.replaceState(null, '', '/#drpreminq');
        }
        const skeleton = document.getElementById('app-skeleton');
        const root = document.getElementById('root');
        if (skeleton) skeleton.style.display = 'none';
        if (root) root.style.display = 'block';
        setIsDataLoading(false);
        setCurrentView('main');
        setActiveBlogSlug(null);
        setIsAppointmentModalOpen(true);
        setAppointmentDefaultTab('book');
        setTimeout(() => {
          const el = document.getElementById('inquiry-section');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 120);
        return;
      }

      // 2. Redirect legacy server/pathname paths to hash fragment routes to avoid static host 404s
      if (rawPath === '/admin' || rawPath === '/webadminprem') {
        window.location.replace('/#drpremlogin');
        return;
      }

      if (rawPath === '/inquires' || rawPath === '/inquiries' || rawPath === '/inq-prem') {
        window.location.replace('/#drpreminq');
        return;
      }

      // 3. Backward Compatibility: auto-redirect legacy hash paths to clean URLs
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
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', handleLocationChange);
    }
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      document.removeEventListener('DOMContentLoaded', handleLocationChange);
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
      (incoming) => {
        setInquiries((prev) => mergeAndNormalizeInquiries(incoming, prev));
      },
      checkAllLoaded
    );

    // Listen for cross-tab localStorage updates and same-window custom events so inquiries appear immediately and never drop
    const handleStorageSync = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.INQUIRIES) {
        const latest = getLocal<PatientInquiry[]>(STORAGE_KEYS.INQUIRIES, initialPatientInquiries);
        setInquiries((prev) => mergeAndNormalizeInquiries(latest, prev));
      }
    };
    const handleCustomInquiriesUpdate = () => {
      const latest = getLocal<PatientInquiry[]>(STORAGE_KEYS.INQUIRIES, initialPatientInquiries);
      setInquiries((prev) => mergeAndNormalizeInquiries(latest, prev));
    };
    window.addEventListener('storage', handleStorageSync);
    window.addEventListener('inquiries-updated', handleCustomInquiriesUpdate);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('storage', handleStorageSync);
      window.removeEventListener('inquiries-updated', handleCustomInquiriesUpdate);
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
    if (window.location.hash) {
      window.history.pushState(null, '', window.location.pathname || '/');
    }
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
              socialChannels={branding.socialChannels}
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

            {/* Section 10: Patient Inquiry & Direct Consultation (#inquiry-section) */}
            <section
              id="inquiry-section"
              className="py-14 bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white scroll-mt-20 relative overflow-hidden border-t border-emerald-800/40"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono uppercase mb-4 border border-emerald-400/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Direct Patient Inquiries · परामर्श सेवा</span>
                </div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-editorial text-white mb-3">
                  Have a Health Question or Need Consultation?
                </h2>
                <p className="text-sm sm:text-base text-emerald-100/90 max-w-2xl mx-auto mb-7 font-nepali leading-relaxed">
                  Submit your confidential symptoms, health concerns, or Ayurvedic medical inquiries directly to Dr. Prem Raj Joshi. You will receive an instant unique Tracking ID (e.g., PJ-XXXXXX) to monitor your advice and response.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleOpenAppointmentModal}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-sm rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    <span>Submit Inquiry / Book Consultation</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAppointmentModalOpen(true);
                      setAppointmentDefaultTab('track');
                    }}
                    className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl border border-white/20 transition-all cursor-pointer flex items-center gap-2 hover:border-white/40"
                  >
                    <Search className="w-4 h-4" />
                    <span>Track Existing Inquiry (स्थिति जाँच्नुहोस्)</span>
                  </button>
                </div>
              </div>
            </section>
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
              } else if (window.location.hash === '#drpreminq' || window.location.hash === '#inquiry-section') {
                window.history.pushState(null, '', window.location.pathname || '/');
              }
            }}
            onInquirySubmitted={(newInquiry) => {
              setInquiries((prev) => mergeAndNormalizeInquiries([newInquiry], prev));
            }}
            onInquiryUpdated={(updatedInquiry) => {
              setInquiries((prev) => mergeAndNormalizeInquiries([updatedInquiry], prev));
            }}
          />

          {/* Floating Accessibility Tools Button & Panel */}
          <AccessibilityPanel />

          {/* Customizable Site Notice Popup Modal (Managed from CMS) */}
          <SitePopupModal
            popupNotice={branding.popupNotice}
            doctorName={branding.doctorName?.en || 'Dr. Prem Raj Joshi'}
            doctorLogo={syncedDoctorPhoto}
            onOpenAppointment={handleOpenAppointmentModal}
          />
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

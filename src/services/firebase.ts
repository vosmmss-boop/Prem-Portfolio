import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics, isSupported, logEvent, Analytics } from 'firebase/analytics';
import {
  getDatabase,
  ref,
  onValue,
  set,
  push,
  update,
  remove,
  Database
} from 'firebase/database';
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
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
} from '../types';
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
  initialPatientInquiries
} from '../data/initialData';

// Firebase Configuration (supports environment variables with project defaults)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAfK8VMNB_GyRlfvqVjIihPN0X97qDfrK0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "drsaap-52b17.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "drsaap-52b17",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "drsaap-52b17.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "355298760720",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:355298760720:web:0ad7aefac7edbfb6a89295",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YH1KBCS635",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://drsaap-52b17-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase App
let app: FirebaseApp | undefined;
let database: Database | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  database = getDatabase(app);
  auth = getAuth(app);

  if (typeof window !== 'undefined') {
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {});
  }
} catch (err) {
  console.warn("Firebase initialization warning (falling back to local cache):", err);
}

export { app, database, auth, analytics };

/**
 * Safe analytics event logger
 */
export function trackEvent(eventName: string, eventParams?: Record<string, any>): void {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch {
      // Ignore in non-supported environments
    }
  }
}

// Storage keys for offline/fallback caching
export const STORAGE_KEYS = {
  BRANDING: 'dr_joshi_branding',
  SLIDERS: 'dr_joshi_slider_images',
  AUTOBIOGRAPHY: 'dr_joshi_autobiography',
  EDUCATION: 'dr_joshi_education',
  EXPERIENCE: 'dr_joshi_experience',
  BLOGS: 'dr_joshi_blogs',
  FAQ: 'dr_joshi_faq',
  LINKS: 'dr_joshi_links',
  DOWNLOADS: 'dr_joshi_downloads',
  GALLERY: 'dr_joshi_gallery',
  INQUIRIES: 'dr_joshi_patient_inquiries'
};

export function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item !== null) {
      const parsed = JSON.parse(item);
      if (parsed !== null && parsed !== undefined) {
        return parsed;
      }
    }
  } catch (e) {
    // ignore
  }
  return fallback;
}

export function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(`${key}_modified_at`, String(Date.now()));
  } catch (e) {
    // ignore
  }
}

/**
 * Universal Realtime Database Listener with 3-second Max Timeout fallback
 * Guarantees newly updated CMS data is preserved and not overwritten by stale theme defaults.
 */
export function subscribeToNode<T>(
  nodePath: string,
  storageKey: string,
  initialFallback: T,
  onData: (data: T) => void,
  onLoaded: () => void
): () => void {
  let isResolved = false;

  // Read local cache immediately so any user CMS changes are displayed instantly
  const cachedData = getLocal<T>(storageKey, initialFallback);
  onData(cachedData);

  // 3-second max timeout guard
  const timer = setTimeout(() => {
    if (!isResolved) {
      isResolved = true;
      onLoaded();
    }
  }, 3000);

  if (!database) {
    clearTimeout(timer);
    onLoaded();
    return () => {};
  }

  try {
    const nodeRef = ref(database, nodePath);
    const unsubscribe = onValue(
      nodeRef,
      (snapshot) => {
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          onLoaded();
        }
        if (snapshot.exists()) {
          const val = snapshot.val();
          let parsedData: any = val;

          // If empty list sentinel was stored in Firebase
          if (val && typeof val === 'object' && val._emptyList) {
            parsedData = [];
          } else if (Array.isArray(initialFallback)) {
            if (Array.isArray(val)) {
              parsedData = val;
            } else if (typeof val === 'object' && val !== null) {
              parsedData = Object.keys(val).map((k) => ({
                ...val[k],
                firebaseKey: k
              }));
            }
          }

          // If valid data exists in snapshot, update local cache and UI
          if (parsedData !== null && parsedData !== undefined) {
            setLocal(storageKey, parsedData);
            onData(parsedData);
          }
        } else {
          // If node doesn't exist yet in remote RTDB, preserve current local cache
          const currentLocal = getLocal<T>(storageKey, initialFallback);
          onData(currentLocal);
        }
      },
      (error) => {
        console.warn(`Firebase listener on /${nodePath} error:`, error.message);
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          onLoaded();
        }
        // Never overwrite with stale initialFallback on permission error; preserve local modifications
        const currentLocal = getLocal<T>(storageKey, initialFallback);
        onData(currentLocal);
      }
    );

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  } catch (err) {
    clearTimeout(timer);
    onLoaded();
    return () => {};
  }
}

export interface SaveResult {
  success: boolean;
  savedLocally: boolean;
  syncedToFirebase: boolean;
  error?: string;
  isPermissionDenied?: boolean;
}

/**
 * Update a node in Firebase and Local Cache simultaneously
 */
export async function saveNodeData<T>(
  nodePath: string,
  storageKey: string,
  data: T
): Promise<SaveResult> {
  // Always update local storage first so changes appear instantly on screen
  setLocal(storageKey, data);

  if (database) {
    try {
      const nodeRef = ref(database, nodePath);
      // Firebase RTDB deletes nodes on empty arrays []; persist sentinel to prevent wiping
      const dataToPersist = Array.isArray(data) && data.length === 0 ? { _emptyList: true } : data;
      await set(nodeRef, dataToPersist);
      return { success: true, savedLocally: true, syncedToFirebase: true };
    } catch (err: any) {
      const msg = err?.message || String(err);
      const isPermissionDenied = /permission_denied|permission denied/i.test(msg);
      console.warn(`Failed to push to Firebase /${nodePath}:`, msg);
      return {
        success: false,
        savedLocally: true,
        syncedToFirebase: false,
        error: msg,
        isPermissionDenied
      };
    }
  }
  return {
    success: false,
    savedLocally: true,
    syncedToFirebase: false,
    error: 'Firebase Database instance not ready'
  };
}

/**
 * Check whether Firebase Realtime Database is accessible or blocked by rules
 */
export async function checkFirebaseConnection(): Promise<{
  connected: boolean;
  error?: string;
  isPermissionDenied?: boolean;
}> {
  if (!firebaseConfig.databaseURL) {
    return { connected: false, error: 'Firebase Database URL not configured' };
  }
  try {
    const res = await fetch(
      `${firebaseConfig.databaseURL.replace(/\/+$/, '')}/.json?shallow=true`
    );
    if (res.ok) {
      return { connected: true };
    }
    const data = await res.json().catch(() => ({}));
    const errText = data?.error || `HTTP ${res.status}`;
    const isPermissionDenied = /permission denied/i.test(errText) || res.status === 401 || res.status === 403;
    return { connected: false, error: errText, isPermissionDenied };
  } catch (err: any) {
    return { connected: false, error: err.message };
  }
}

/**
 * Push all 10 CMS content nodes to Firebase Realtime Database in one operation
 */
export async function pushAllContentToFirebase(allData: {
  branding: Branding;
  slides: HeroSlide[];
  autobiography: Autobiography;
  education: EducationMilestone[];
  experience: ExperienceEntry[];
  blogs: BlogArticle[];
  faqs: FAQItem[];
  usefulLinks: UsefulLink[];
  downloads: DownloadItem[];
  gallery: GalleryItem[];
}): Promise<{ success: boolean; pushedCount: number; errors: string[] }> {
  const nodes = [
    { path: 'branding', key: STORAGE_KEYS.BRANDING, data: allData.branding },
    { path: 'slider_images', key: STORAGE_KEYS.SLIDERS, data: allData.slides },
    { path: 'autobiography', key: STORAGE_KEYS.AUTOBIOGRAPHY, data: allData.autobiography },
    { path: 'education', key: STORAGE_KEYS.EDUCATION, data: allData.education },
    { path: 'experience', key: STORAGE_KEYS.EXPERIENCE, data: allData.experience },
    { path: 'blogs', key: STORAGE_KEYS.BLOGS, data: allData.blogs },
    { path: 'faq', key: STORAGE_KEYS.FAQ, data: allData.faqs },
    { path: 'links', key: STORAGE_KEYS.LINKS, data: allData.usefulLinks },
    { path: 'downloads', key: STORAGE_KEYS.DOWNLOADS, data: allData.downloads },
    { path: 'gallery', key: STORAGE_KEYS.GALLERY, data: allData.gallery }
  ];

  let pushed = 0;
  const errors: string[] = [];

  for (const node of nodes) {
    const res = await saveNodeData(node.path, node.key, node.data);
    if (res.syncedToFirebase) {
      pushed++;
    } else if (res.error) {
      errors.push(`${node.path}: ${res.error}`);
    }
  }

  return { success: errors.length === 0, pushedCount: pushed, errors };
}

/**
 * Submit Patient Inquiry (to /patient_inquiries in Firebase)
 */
export async function submitPatientInquiry(inquiry: PatientInquiry): Promise<boolean> {
  // Save locally
  const current = getLocal<PatientInquiry[]>(STORAGE_KEYS.INQUIRIES, initialPatientInquiries);
  const updated = [inquiry, ...current.filter((i) => i.id !== inquiry.id)];
  setLocal(STORAGE_KEYS.INQUIRIES, updated);

  trackEvent('patient_inquiry_submitted', {
    inquiry_id: inquiry.id,
    request_type: inquiry.requestType
  });

  if (database) {
    try {
      const inquiriesRef = ref(database, `patient_inquiries/${inquiry.id}`);
      await set(inquiriesRef, inquiry);
      return true;
    } catch (err) {
      console.warn("Firebase inquiry submission fallback to local storage:", err);
      return true;
    }
  }
  return true;
}

/**
 * Update an existing Patient Inquiry (status, notes, doctor message, patient review)
 */
export async function updatePatientInquiry(inquiry: PatientInquiry): Promise<boolean> {
  const current = getLocal<PatientInquiry[]>(STORAGE_KEYS.INQUIRIES, initialPatientInquiries);
  const updated = current.map((item) => (item.id === inquiry.id ? inquiry : item));
  setLocal(STORAGE_KEYS.INQUIRIES, updated);

  if (database) {
    try {
      const inquiriesRef = ref(database, `patient_inquiries/${inquiry.id}`);
      await set(inquiriesRef, inquiry);
      return true;
    } catch (err) {
      console.warn("Firebase inquiry update fallback to local storage:", err);
      return true;
    }
  }
  return true;
}

/**
 * Check if a slug is strictly unique across Firebase and existing records
 */
export function checkSlugUniqueness(
  slug: string,
  existingEntities: Array<{ id: string; slug: string }>,
  currentEditingId?: string
): boolean {
  if (!slug || !slug.trim()) return false;
  const cleanSlug = slug.toLowerCase().trim();
  const match = existingEntities.find(
    (e) => e.slug.toLowerCase().trim() === cleanSlug && e.id !== currentEditingId
  );
  return !match;
}

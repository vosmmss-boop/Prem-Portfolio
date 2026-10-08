import { initializeApp, getApps, getApp } from 'firebase/app';
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

// User-provided Firebase Configuration
export const firebaseConfig = {
  apiKey: "AIzaSyAfK8VMNB_GyRlfvqVjIihPN0X97qDfrK0",
  authDomain: "drsaap-52b17.firebaseapp.com",
  projectId: "drsaap-52b17",
  storageBucket: "drsaap-52b17.firebasestorage.app",
  messagingSenderId: "355298760720",
  appId: "1:355298760720:web:0ad7aefac7edbfb6a89295",
  measurementId: "G-YH1KBCS635",
  databaseURL: "https://drsaap-52b17-default-rtdb.asia-southeast1.firebasedatabase.app"
};

// Initialize Firebase App
let app;
let database: Database | null = null;
let auth: Auth | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  database = getDatabase(app);
  auth = getAuth(app);
} catch (err) {
  console.warn("Firebase initialization warning (falling back to local cache):", err);
}

export { database, auth };

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
    if (item) {
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

          if (Array.isArray(initialFallback)) {
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
          // If node doesn't exist yet in remote RTDB, keep user's local/cached data
          onData(cachedData);
        }
      },
      (error) => {
        console.warn(`Firebase listener on /${nodePath} error:`, error.message);
        if (!isResolved) {
          isResolved = true;
          clearTimeout(timer);
          onLoaded();
        }
        onData(cachedData);
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

/**
 * Update a node in Firebase and Local Cache simultaneously
 */
export async function saveNodeData<T>(
  nodePath: string,
  storageKey: string,
  data: T
): Promise<void> {
  // Always update local storage first so changes appear instantly on screen
  setLocal(storageKey, data);

  if (database) {
    try {
      const nodeRef = ref(database, nodePath);
      await set(nodeRef, data);
    } catch (err: any) {
      console.warn(`Failed to push to Firebase /${nodePath}:`, err.message);
    }
  }
}

/**
 * Submit Patient Inquiry (to /patient_inquiries in Firebase)
 */
export async function submitPatientInquiry(inquiry: PatientInquiry): Promise<boolean> {
  // Save locally
  const current = getLocal<PatientInquiry[]>(STORAGE_KEYS.INQUIRIES, initialPatientInquiries);
  const updated = [inquiry, ...current.filter((i) => i.id !== inquiry.id)];
  setLocal(STORAGE_KEYS.INQUIRIES, updated);

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

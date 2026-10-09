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
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import {
  getStorage,
  ref as storageRefBuilder,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  FirebaseStorage,
  UploadTask
} from 'firebase/storage';
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

// Initialize Single Shared Firebase App, Database, Auth & Storage
let app: FirebaseApp | undefined;
let database: Database | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let analytics: Analytics | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  database = getDatabase(app);
  auth = getAuth(app);
  storage = getStorage(app);
  // Prevent infinite 10-minute hangs on CORS or network preflight failures
  storage.maxUploadRetryTime = 15000;
  storage.maxOperationRetryTime = 15000;

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

export { app, database, auth, storage, analytics };

/**
 * Ensure an authenticated Firebase session is active for admin Storage/Database writes.
 * Does NOT call signInAnonymously unless anonymous auth is explicitly enabled, avoiding HTTP 400 console errors.
 */
export async function ensureFirebaseAdminAuth(): Promise<User | null> {
  if (!auth) return null;
  return auth.currentUser;
}

/**
 * Sanitize filename for safe Firebase Storage object keys
 */
export function sanitizeStorageFileName(fileName: string): string {
  const trimmed = (fileName || 'image.jpg').trim();
  const safe = trimmed
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9._-]/g, '')
    .replace(/_+/g, '_')
    .slice(-90);
  return safe || `image_${Date.now()}.jpg`;
}

/**
 * Validate image file type and size before uploading to Firebase Storage
 */
export function validateImageFile(
  file: File | null | undefined,
  maxSizeMB = 10
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No image file was selected.' };
  }
  const allowedMimePattern = /^image\/(jpeg|jpg|png|webp|gif|svg\+xml|avif|bmp)$/i;
  if (!file.type || !allowedMimePattern.test(file.type)) {
    return {
      valid: false,
      error: `Invalid file type (${file.type || 'unknown'}). Please select a valid image file (JPG, PNG, WEBP, GIF, or SVG).`
    };
  }
  const maxBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const fileMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `File is too large (${fileMB} MB). Maximum allowed image size is ${maxSizeMB} MB.`
    };
  }
  return { valid: true };
}

/**
 * Format Firebase Storage errors into actionable admin messages
 */
export function formatFirebaseStorageError(err: any): {
  message: string;
  isCorsOr404: boolean;
  isPermissionDenied: boolean;
  isCanceled: boolean;
} {
  const code = String(err?.code || '').toLowerCase();
  const rawMsg = String(err?.message || err || '');
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://hi.drpremrajjoshi.com.np';
  const bucket = firebaseConfig.storageBucket || 'drsaap-52b17.firebasestorage.app';

  if (code.includes('canceled') || /canceled|cancelled/i.test(rawMsg)) {
    return {
      message: 'Image upload was canceled.',
      isCorsOr404: false,
      isPermissionDenied: false,
      isCanceled: true
    };
  }

  if (code.includes('unauthorized') || code.includes('permission-denied') || /permission_denied|permission denied|403/i.test(rawMsg)) {
    return {
      message: `Storage Permission Denied (${code || '403'}): Firebase Storage security rules blocked writing to gs://${bucket}. Please deploy storage.rules or sign in with an authorized Firebase Admin account.`,
      isCorsOr404: false,
      isPermissionDenied: true,
      isCanceled: false
    };
  }

  if (code.includes('unauthenticated') || /unauthenticated|401/i.test(rawMsg)) {
    return {
      message: 'Unauthenticated request (401): Please sign in with a valid Firebase Admin session or enable Anonymous/Email Auth in Firebase Console.',
      isCorsOr404: false,
      isPermissionDenied: true,
      isCanceled: false
    };
  }

  if (code.includes('quota-exceeded')) {
    return {
      message: `Firebase Storage quota exceeded on bucket gs://${bucket}. Please check your Firebase billing/usage plan.`,
      isCorsOr404: false,
      isPermissionDenied: false,
      isCanceled: false
    };
  }

  if (
    code.includes('retry-limit-exceeded') ||
    code.includes('bucket-not-found') ||
    code.includes('project-not-found') ||
    code.includes('unknown') ||
    /cors|preflight|err_failed|404|network|stalled/i.test(rawMsg)
  ) {
    return {
      message: `Firebase Storage CORS / Bucket 404 Error on gs://${bucket} from origin ${origin}: Ensure Firebase Storage is initialized in Firebase Console and apply cors.json via: gcloud storage buckets update gs://${bucket} --cors-file=cors.json`,
      isCorsOr404: true,
      isPermissionDenied: false,
      isCanceled: false
    };
  }

  return {
    message: `Firebase Storage upload error: ${rawMsg || 'Unknown error occurred.'}`,
    isCorsOr404: false,
    isPermissionDenied: false,
    isCanceled: false
  };
}

export interface StorageUploadOptions {
  maxSizeMB?: number;
  customFileName?: string;
  onProgress?: (progressPercent: number) => void;
  onTaskCreated?: (task: UploadTask) => void;
}

export interface StorageUploadResult {
  downloadURL: string;
  storagePath: string;
  bucket: string;
  usedFallback?: boolean;
}

/**
 * Validate that an image URL is a valid HTTPS URL (never a base64 data:image/ URL)
 */
export function isValidHttpsImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed.toLowerCase().startsWith('data:')) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Upload an image file from PC to ImgBB API (`https://api.imgbb.com/1/upload?key=...`)
 * Returns a direct `https://i.ibb.co/...` image URL without using FileReader or readAsDataURL().
 */
export async function uploadImageToImgBB(
  file: File,
  customApiKey?: string
): Promise<{ url: string; displayUrl?: string; deleteUrl?: string }> {
  const validation = validateImageFile(file, 32);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  const envKey = (import.meta.env.VITE_IMGBB_API_KEY || '').trim();
  const storedKey =
    typeof window !== 'undefined' ? (localStorage.getItem('dr_joshi_imgbb_api_key') || '').trim() : '';
  const apiKey = (customApiKey || envKey || storedKey || '174346727f10aa92bc9cc0ac744ef73e').trim();

  if (!apiKey || apiKey === 'YOUR_IMGBB_API_KEY') {
    throw new Error(
      'ImgBB API key is not configured. Please set VITE_IMGBB_API_KEY or use the "Enter Image URL" tab to paste an https:// image link.'
    );
  }

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    body: formData
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result || !result.success || !result.data?.url) {
    const errMsg =
      result?.error?.message ||
      result?.status_txt ||
      `ImgBB upload failed with HTTP ${response.status}.`;
    throw new Error(errMsg);
  }

  const directUrl: string = result.data.url || result.data.display_url;
  if (!isValidHttpsImageUrl(directUrl)) {
    throw new Error('ImgBB did not return a valid https:// image URL.');
  }

  return {
    url: directUrl,
    displayUrl: result.data.display_url,
    deleteUrl: result.data.delete_url
  };
}

/**
 * Helper to attempt a Firebase Storage upload against a specific bucket URL with a fast timeout
 */
async function tryFirebaseBucketUpload(
  targetStorage: FirebaseStorage,
  storagePath: string,
  file: File,
  bucketName: string,
  timeoutMs: number,
  options: StorageUploadOptions
): Promise<StorageUploadResult> {
  const fileRef = storageRefBuilder(targetStorage, storagePath);

  return new Promise((resolve, reject) => {
    let settled = false;
    let lastBytes = 0;

    const uploadTask = uploadBytesResumable(fileRef, file, {
      contentType: file.type,
      cacheControl: 'public,max-age=31536000'
    });

    if (options.onTaskCreated) {
      options.onTaskCreated(uploadTask);
    }

    const stallTimer = setTimeout(() => {
      if (!settled && lastBytes === 0) {
        settled = true;
        try {
          uploadTask.cancel();
        } catch {
          // ignore
        }
        reject(new Error(`Bucket ${bucketName} timed out or blocked by CORS/404.`));
      }
    }, timeoutMs);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        lastBytes = snapshot.bytesTransferred;
        if (snapshot.totalBytes > 0 && options.onProgress) {
          const pct = Math.max(5, Math.min(95, Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)));
          options.onProgress(pct);
        }
      },
      async (error) => {
        clearTimeout(stallTimer);
        if (settled) return;

        if (error?.code === 'storage/canceled') {
          settled = true;
          reject(error);
          return;
        }

        try {
          const directSnap = await uploadBytes(fileRef, file, {
            contentType: file.type,
            cacheControl: 'public,max-age=31536000'
          });
          const url = await getDownloadURL(directSnap.ref);
          if (!url || !url.startsWith('https://')) {
            throw new Error('Invalid download URL returned from Firebase Storage.');
          }
          settled = true;
          if (options.onProgress) options.onProgress(100);
          resolve({
            downloadURL: url,
            storagePath,
            bucket: bucketName
          });
        } catch {
          settled = true;
          reject(error);
        }
      },
      async () => {
        clearTimeout(stallTimer);
        if (settled) return;
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          if (!downloadURL || !downloadURL.startsWith('https://')) {
            throw new Error('Invalid HTTPS download URL received from Firebase Storage.');
          }
          settled = true;
          if (options.onProgress) options.onProgress(100);
          resolve({
            downloadURL,
            storagePath,
            bucket: bucketName
          });
        } catch (urlErr) {
          settled = true;
          reject(urlErr);
        }
      }
    );
  });
}

/**
 * Upload an image file directly to Firebase Storage using uploadBytesResumable (with uploadBytes fallback),
 * trying both primary (.firebasestorage.app) and legacy (.appspot.com) buckets, and automatically falling back
 * to optimized Realtime Database cloud persistence if the Storage bucket returns 404 or CORS block.
 */
export async function uploadImageToFirebaseStorage(
  file: File,
  folder: 'blog_covers' | 'editor_images' | 'gallery' | 'sliders' | 'branding' | 'education' | 'experience' = 'blog_covers',
  options: StorageUploadOptions = {}
): Promise<StorageUploadResult> {
  const validation = validateImageFile(file, options.maxSizeMB ?? 10);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileName = options.customFileName || `${Date.now()}_${file.name}`;
  const storagePath = `${folder}/${fileName}`;

  if (options.onProgress) {
    options.onProgress(20);
  }

  // Primary: Upload via ImgBB API to return an instant https://i.ibb.co/... URL without CORS blocks or base64
  try {
    const imgbbRes = await uploadImageToImgBB(file);
    if (options.onProgress) {
      options.onProgress(100);
    }
    return {
      downloadURL: imgbbRes.url,
      storagePath,
      bucket: 'imgbb'
    };
  } catch (imgbbErr) {
    // Fallback: Direct Firebase Storage upload (never base64)
    await ensureFirebaseAdminAuth();
    const activeStorage = storage || (app ? getStorage(app) : getStorage());
    const storageRef = storageRefBuilder(activeStorage, storagePath);

    await uploadBytes(storageRef, file);

    if (options.onProgress) {
      options.onProgress(85);
    }

    const downloadURL = await getDownloadURL(storageRef);

    if (options.onProgress) {
      options.onProgress(100);
    }

    return {
      downloadURL,
      storagePath,
      bucket: firebaseConfig.storageBucket
    };
  }
}

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

/**
 * Normalize legacy `/src/assets/images/` asset paths to `/assets/images/` so production builds never log 404s
 */
export function normalizeAssetUrls<T>(data: T): T {
  if (!data) return data;
  if (typeof data === 'string') {
    return data.replace(/\/src\/assets\/images\//g, '/assets/images/') as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map((item) => normalizeAssetUrls(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(data as Record<string, any>)) {
      if (
        (k === 'cover_image' || k === 'coverImage') &&
        typeof v === 'string' &&
        v.trim().toLowerCase().startsWith('data:')
      ) {
        out[k] = 'https://drpremrajjoshi.com.np/assets/images/hero_ayurveda_clinic_1791392890876.jpg';
      } else {
        out[k] = normalizeAssetUrls(v);
      }
    }
    return out as T;
  }
  return data;
}
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
        return normalizeAssetUrls(parsed);
      }
    }
  } catch (e) {
    // ignore
  }
  return normalizeAssetUrls(fallback);
}

export function setLocal<T>(key: string, data: T, updateModifiedTimestamp = true): void {
  try {
    const normalized = normalizeAssetUrls(data);
    localStorage.setItem(key, JSON.stringify(normalized));
    if (updateModifiedTimestamp) {
      localStorage.setItem(`${key}_modified_at`, String(Date.now()));
    }
  } catch (e) {
    // If localStorage quota is exceeded (e.g. multiple high-res base64 images),
    // clear old draft keys and retry so CMS updates are never lost!
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('rte_draft_') || k.startsWith('blog_en_') || k.startsWith('blog_np_'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      const normalized = normalizeAssetUrls(data);
      localStorage.setItem(key, JSON.stringify(normalized));
      if (updateModifiedTimestamp) {
        localStorage.setItem(`${key}_modified_at`, String(Date.now()));
      }
    } catch {
      // ignore if still over quota
    }
  }
}

// Track keys modified locally during this session where Firebase write has not yet succeeded,
// preventing stale Firebase snapshots from overwriting newly saved local CMS items.
const locallyModifiedPendingSync = new Set<string>();

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
        // If the user has unsynced local CMS changes in this browser, do not let a stale remote snapshot overwrite them!
        const hasPendingLocal =
          locallyModifiedPendingSync.has(storageKey) ||
          localStorage.getItem(`${storageKey}_pending_sync`) === 'true';

        if (snapshot.exists()) {
          const val = snapshot.val();
          let parsedData: any = val;

          // If empty list sentinel was stored in Firebase
          if (val && typeof val === 'object' && val._emptyList) {
            parsedData = [];
          } else if (Array.isArray(initialFallback)) {
            if (Array.isArray(val)) {
              parsedData = val.filter(Boolean);
            } else if (typeof val === 'object' && val !== null) {
              parsedData = Object.keys(val)
                .filter((k) => val[k] !== null && val[k] !== undefined)
                .map((k) => ({
                  ...val[k],
                  firebaseKey: k
                }));
            }
          }

          if (parsedData !== null && parsedData !== undefined) {
            const normalized = normalizeAssetUrls(parsedData);

            // If there are pending local edits that failed to push to Firebase (e.g. Permission Denied),
            // merge or preserve local edits so newly added blogs/items never disappear!
            if (hasPendingLocal) {
              const localCurrent = getLocal<T>(storageKey, initialFallback);
              if (Array.isArray(localCurrent) && Array.isArray(normalized)) {
                // Merge any local items not in remote snapshot at the front
                const remoteIds = new Set(normalized.map((item: any) => item?.id));
                const localOnly = localCurrent.filter((item: any) => item?.id && !remoteIds.has(item.id));
                const merged = [...localOnly, ...normalized] as unknown as T;
                setLocal(storageKey, merged, false);
                onData(merged);
                return;
              }
              onData(localCurrent);
              return;
            }

            setLocal(storageKey, normalized, false);
            onData(normalized);
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
 * Recursively strip undefined values so Firebase Realtime Database set() never throws
 * "set failed: value argument contains undefined"
 */
function sanitizeForFirebase<T>(obj: T): T {
  if (obj === undefined) return null as unknown as T;
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirebase(item)) as unknown as T;
  }
  const clean: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj as Record<string, any>)) {
    if (v !== undefined) {
      clean[k] = sanitizeForFirebase(v);
    }
  }
  return clean as T;
}

/**
 * Update a node in Firebase and Local Cache simultaneously
 */
export async function saveNodeData<T>(
  nodePath: string,
  storageKey: string,
  data: T
): Promise<SaveResult> {
  const cleanData = sanitizeForFirebase(data);

  // Mark as pending sync until Firebase confirms write
  locallyModifiedPendingSync.add(storageKey);
  try {
    localStorage.setItem(`${storageKey}_pending_sync`, 'true');
  } catch {
    // ignore
  }

  // Always update local storage first so changes appear instantly on screen
  setLocal(storageKey, cleanData, true);

  if (database) {
    try {
      const nodeRef = ref(database, nodePath);
      // Firebase RTDB deletes nodes on empty arrays []; persist sentinel to prevent wiping
      const dataToPersist =
        Array.isArray(cleanData) && cleanData.length === 0 ? { _emptyList: true } : cleanData;
      await set(nodeRef, dataToPersist);

      // If saving the 'branding' node, also mirror logoUrl and title to '/settings'
      // so Cloudflare Pages Functions (/settings/logo.json and /branding.json) always stay in sync.
      if (nodePath === 'branding' && cleanData && typeof cleanData === 'object') {
        const b = cleanData as Record<string, any>;
        if (b.logoUrl) {
          try {
            const settingsRef = ref(database, 'settings');
            await update(settingsRef, {
              logo: b.logoUrl,
              logoUrl: b.logoUrl,
              title:
                b.doctorName?.en && b.degreeTitle?.en
                  ? `${b.doctorName.en} - ${b.degreeTitle.en}`
                  : 'Dr. Prem Raj Joshi - BAMS, IOM, TU | Ayurvedic Physician',
              updatedAt: Date.now()
            });
          } catch {
            // ignore if /settings rules are restricted
          }
        }
      }

      // Write succeeded in Firebase; clear pending flag
      locallyModifiedPendingSync.delete(storageKey);
      try {
        localStorage.removeItem(`${storageKey}_pending_sync`);
      } catch {
        // ignore
      }
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

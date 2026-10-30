/**
 * Dynamic Favicon Synchronizer
 * Immediately and persistently updates browser tab favicon and Apple touch icon
 * whenever the doctor logo is changed, uploaded, or loaded from database.
 */

export function updateFavicon(url?: string | null): void {
  if (!url || typeof url !== 'string') return;
  const cleanUrl = url.trim();

  // Strictly skip base64 data: URLs to prevent quota bloat and browser rendering issues
  if (!cleanUrl || cleanUrl.toLowerCase().startsWith('data:')) return;

  // Persist into localStorage so index.html pre-hydration script applies it instantaneously on next page visit
  try {
    localStorage.setItem('dr_joshi_custom_favicon', cleanUrl);
  } catch {
    // ignore
  }

  if (typeof document === 'undefined') return;

  // 1. Update all existing link[rel*='icon'] and apple-touch-icon tags
  const existingLinks = document.querySelectorAll<HTMLLinkElement>(
    "link[rel~='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
  );

  if (existingLinks.length > 0) {
    existingLinks.forEach((link) => {
      link.href = cleanUrl;
    });
  }

  // 2. Ensure explicit #dynamic-favicon link tag exists and has the correct URL
  let dynamicLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
  if (!dynamicLink) {
    dynamicLink = document.createElement('link');
    dynamicLink.id = 'dynamic-favicon';
    dynamicLink.rel = 'icon';
    document.head.appendChild(dynamicLink);
  }
  dynamicLink.href = cleanUrl;

  // 3. Ensure apple-touch-icon exists and has the correct URL
  let appleTouch = document.querySelector<HTMLLinkElement>("link[rel='apple-touch-icon']");
  if (!appleTouch) {
    appleTouch = document.createElement('link');
    appleTouch.rel = 'apple-touch-icon';
    document.head.appendChild(appleTouch);
  }
  appleTouch.href = cleanUrl;
}

export function getStoredFavicon(): string | null {
  try {
    const custom = localStorage.getItem('dr_joshi_custom_favicon');
    if (custom && !custom.toLowerCase().startsWith('data:')) return custom;

    const rawBranding = localStorage.getItem('dr_joshi_branding');
    if (rawBranding) {
      const parsed = JSON.parse(rawBranding);
      if (parsed?.logoUrl && !parsed.logoUrl.toLowerCase().startsWith('data:')) {
        return parsed.logoUrl;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

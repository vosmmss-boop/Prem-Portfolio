/**
 * Universal YouTube URL parser & embed normalizer.
 * Fixes "www.youtube.com refused to connect" caused by pasting watch?v=, youtu.be/,
 * shorts/, live/, or raw iframe HTML snippets instead of a valid embed URL.
 */

export interface ParsedYouTubeInfo {
  videoId: string | null;
  embedUrl: string;
  watchUrl: string;
  thumbnailUrl: string;
}

/**
 * Extract the 11-character YouTube Video ID from any YouTube URL or iframe string
 */
export function extractYouTubeVideoId(input: string | undefined | null): string | null {
  if (!input || typeof input !== 'string') return null;
  let raw = input.trim();
  if (!raw) return null;

  // If user pasted a full <iframe src="..."> snippet, extract src attribute first
  const iframeSrcMatch = raw.match(/src=["']([^"']+)["']/i);
  if (iframeSrcMatch && iframeSrcMatch[1]) {
    raw = iframeSrcMatch[1].trim();
  }

  // If user entered a bare 11-char video ID directly
  if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
    return raw;
  }

  try {
    const urlObj = new URL(raw.startsWith('http') ? raw : `https://${raw}`);
    const host = urlObj.hostname.replace(/^www\./i, '').toLowerCase();

    if (host === 'youtu.be') {
      const id = urlObj.pathname.split('/').filter(Boolean)[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) return id;
    }

    if (
      host.includes('youtube.com') ||
      host.includes('youtube-nocookie.com')
    ) {
      // 1. Standard ?v=VIDEO_ID
      const vParam = urlObj.searchParams.get('v');
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) {
        return vParam;
      }

      // 2. /embed/VIDEO_ID, /shorts/VIDEO_ID, /live/VIDEO_ID, /v/VIDEO_ID
      const segments = urlObj.pathname.split('/').filter(Boolean);
      const markerIdx = segments.findIndex((s) =>
        ['embed', 'shorts', 'live', 'v', 'e'].includes(s.toLowerCase())
      );
      if (markerIdx !== -1 && segments[markerIdx + 1]) {
        const candidate = segments[markerIdx + 1].split('?')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
          return candidate;
        }
      }
    }
  } catch {
    // Fallback regex if URL constructor fails
  }

  const regexMatch = raw.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts|live)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i
  );
  if (regexMatch && regexMatch[1]) {
    return regexMatch[1];
  }

  return null;
}

/**
 * Convert any YouTube link (watch, share, shorts, embed) into a clean embeddable URL
 * and provide direct watch + thumbnail URLs so the player never shows "refused to connect".
 */
export function parseYouTubeUrl(input: string | undefined | null): ParsedYouTubeInfo {
  const videoId = extractYouTubeVideoId(input);
  if (videoId) {
    return {
      videoId,
      embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    };
  }

  const trimmed = (input || '').trim();
  return {
    videoId: null,
    embedUrl: trimmed,
    watchUrl: trimmed || 'https://youtube.com/@drpremrajjoshi',
    thumbnailUrl: '/assets/images/hero_ayurveda_clinic_1791392890876.jpg'
  };
}

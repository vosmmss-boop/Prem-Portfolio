/**
 * Cloudflare Pages Root Function: /functions/index.js
 * Forces full 200 OK HTML responses (ignoring incoming Range headers) for social media crawlers,
 * fetches the latest logo URL from Firebase Realtime Database (/settings/logo.json & /branding.json),
 * and uses HTMLRewriter to dynamically inject/replace og:image, og:title, and favicon tags.
 */

const CSP_HEADER_VALUE =
  "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://connect.facebook.net https://*.facebook.com; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https: wss: https://*.facebook.com https://*.facebook.net https://graph.facebook.com https://*.fbcdn.net; img-src 'self' data: blob: https:; frame-src 'self' https: https://*.facebook.com https://*.facebook.net;";

const SOCIAL_CRAWLER_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Discordbot|TelegramBot|Slackbot|Pinterest|Applebot|SkypeUriPreview/i;

function toAbsoluteHttpsUrl(rawUrl, origin) {
  if (!rawUrl || typeof rawUrl !== 'string') return `${origin}/logo.png`;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith('data:')) return `${origin}/logo.png`;
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) return trimmed;
  return `${origin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

async function fetchLiveBrandingFromFirebase(env, origin) {
  const defaultResult = {
    logoUrl: `${origin}/logo.png`,
    siteTitle: 'Dr. Prem Raj Joshi - BAMS, IOM, TU | Ayurvedic Physician'
  };

  const rtdbBases = [
    env?.FIREBASE_DATABASE_URL,
    'https://drsaap-52b17-default-rtdb.asia-southeast1.firebasedatabase.app',
    'https://drsaap-52b17-default-rtdb.firebaseio.com',
    'https://drsaap-52b17.firebaseio.com'
  ]
    .filter(Boolean)
    .map((u) => u.replace(/\/+$/, ''));

  for (const baseUrl of rtdbBases) {
    try {
      const [settingsLogoRes, brandingRes] = await Promise.allSettled([
        fetch(`${baseUrl}/settings/logo.json`, { headers: { Accept: 'application/json' } }),
        fetch(`${baseUrl}/branding.json`, { headers: { Accept: 'application/json' } })
      ]);

      let resolvedLogo = null;
      let resolvedTitle = null;

      if (settingsLogoRes.status === 'fulfilled' && settingsLogoRes.value.ok) {
        const logoData = await settingsLogoRes.value.json();
        if (typeof logoData === 'string' && logoData.trim()) {
          resolvedLogo = logoData.trim();
        } else if (logoData && typeof logoData === 'object') {
          resolvedLogo = logoData.url || logoData.logoUrl || logoData.logo || null;
        }
      }

      if (brandingRes.status === 'fulfilled' && brandingRes.value.ok) {
        const brandingData = await brandingRes.value.json();
        if (brandingData && typeof brandingData === 'object') {
          if (!resolvedLogo && brandingData.logoUrl) {
            resolvedLogo = brandingData.logoUrl;
          }
          if (brandingData.doctorName?.en) {
            const docName = brandingData.doctorName.en.trim();
            const degTitle = (brandingData.degreeTitle?.en || 'BAMS, IOM, TU | Ayurvedic Physician').trim();
            resolvedTitle = `${docName} - ${degTitle}`;
          }
        }
      }

      if (resolvedLogo || resolvedTitle) {
        return {
          logoUrl: toAbsoluteHttpsUrl(resolvedLogo || defaultResult.logoUrl, origin),
          siteTitle: resolvedTitle || defaultResult.siteTitle
        };
      }
    } catch {
      // Continue to next fallback URL
    }
  }

  return defaultResult;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Bypass crawler interception for static assets (favicon.ico, logo.png, .svg, .png, .jpg)
  if (pathname.includes('.') && !pathname.endsWith('.html')) {
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return fetch(request);
  }

  const userAgent = request.headers.get('user-agent') || '';
  const isCrawler = SOCIAL_CRAWLER_REGEX.test(userAgent);

  if (!isCrawler) {
    return context.next();
  }

  // Fetch latest logo and title from Firebase RTDB
  const { logoUrl, siteTitle } = await fetchLiveBrandingFromFirebase(env, url.origin);
  const safeLogoUrl = logoUrl.replace(/"/g, '&quot;');
  const safeTitle = siteTitle.replace(/"/g, '&quot;');

  // Fetch original HTML ignoring Range headers so crawlers always get a full 200 OK instead of 206 Partial Content
  const cleanRequest = new Request(new URL('/', request.url).toString(), {
    method: 'GET',
    headers: { 'User-Agent': userAgent }
  });

  const baseResponse =
    env && env.ASSETS ? await env.ASSETS.fetch(cleanRequest) : await fetch(cleanRequest);

  let hasFbAppId = false;

  const transformed = new HTMLRewriter()
    .on('title', {
      element(el) {
        el.setInnerContent(safeTitle);
      }
    })
    .on('meta[property="fb:app_id"]', {
      element(el) {
        hasFbAppId = true;
        el.setAttribute('content', '966242223397117');
      }
    })
    .on('meta[property="og:image"], meta[name="twitter:image"]', {
      element(el) {
        el.setAttribute('content', safeLogoUrl);
      }
    })
    .on('meta[property="og:title"], meta[name="twitter:title"]', {
      element(el) {
        el.setAttribute('content', safeTitle);
      }
    })
    .on('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]', {
      element(el) {
        el.setAttribute('href', safeLogoUrl);
      }
    })
    .on('head', {
      element(el) {
        if (!hasFbAppId) {
          el.append('<meta property="fb:app_id" content="966242223397117" />', { html: true });
        }
      }
    })
    .transform(baseResponse);

  const html = await transformed.text();

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Content-Security-Policy': CSP_HEADER_VALUE
    }
  });
}

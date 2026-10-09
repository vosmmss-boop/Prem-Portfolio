/**
 * Cloudflare Pages Global Middleware: /functions/_middleware.js
 *
 * 1. Passes normal user traffic and static assets (.png, .ico, .js, .css, etc.) through cleanly
 *    without slowing down page load.
 * 2. Intercepts social media crawlers (Facebook, WhatsApp, Twitter/X, LinkedIn, Discord, Telegram, etc.).
 * 3. Fetches the latest CMS logo URL & site title directly from Firebase Realtime Database REST API:
 *    - `https://<PROJECT-ID>.firebaseio.com/settings/logo.json`
 *    - `https://<PROJECT-ID>-default-rtdb.asia-southeast1.firebasedatabase.app/branding.json`
 * 4. Uses Cloudflare's `HTMLRewriter` to dynamically inject/replace:
 *    - `<meta property="og:image">` & `<meta name="twitter:image">`
 *    - `<meta property="og:title">` & `<meta name="twitter:title">` & `<title>`
 *    - `<link rel="icon">` & `<link rel="apple-touch-icon">`
 */

const CSP_HEADER_VALUE =
  "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://connect.facebook.net https://*.facebook.com; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https: wss: https://*.facebook.com https://*.facebook.net https://graph.facebook.com https://*.fbcdn.net; img-src 'self' data: blob: https:; frame-src 'self' data: blob: https: https://www.youtube.com https://www.youtube-nocookie.com https://*.facebook.com https://*.facebook.net;";

// Regex matching major social media and link-preview crawler User-Agents
const SOCIAL_CRAWLER_REGEX =
  /facebookexternalhit|Facebot|Twitterbot|WhatsApp|LinkedInBot|Discordbot|TelegramBot|Slackbot|Pinterest|Applebot|vkShare|W3C_Validator|redditbot|SkypeUriPreview/i;

/**
 * Helper: Resolve a potentially relative asset path (e.g. "/logo.png") to an absolute HTTPS URL
 * required by Facebook, WhatsApp, Twitter, and LinkedIn crawlers.
 */
function toAbsoluteHttpsUrl(rawUrl, origin) {
  if (!rawUrl || typeof rawUrl !== 'string') return `${origin}/logo.png`;
  const trimmed = rawUrl.trim();
  if (!trimmed || trimmed.startsWith('data:')) return `${origin}/logo.png`;
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  return `${origin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
}

/**
 * Fetch the latest logo URL and site title from Firebase Realtime Database REST API.
 * Checks both `/settings/logo.json` and `/branding.json` with a fast timeout so crawlers never hang.
 */
async function fetchLiveBrandingFromFirebase(env, origin) {
  const defaultResult = {
    logoUrl: `${origin}/logo.png`,
    siteTitle: 'Dr. Prem Raj Joshi - BAMS, IOM, TU | Ayurvedic Physician',
    siteDescription:
      'Official medical portal of Dr. Prem Raj Joshi (BAMS, IOM, TU). Expert Ayurvedic consultations, holistic wellness guides, and health articles in Nepal.'
  };

  // Support custom env var or project default Firebase RTDB base URLs
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
      // 1. Fetch `/settings/logo.json` and `/branding.json` in parallel
      const [settingsLogoRes, brandingRes] = await Promise.allSettled([
        fetch(`${baseUrl}/settings/logo.json`, {
          headers: { Accept: 'application/json' }
        }),
        fetch(`${baseUrl}/branding.json`, {
          headers: { Accept: 'application/json' }
        })
      ]);

      let resolvedLogo = null;
      let resolvedTitle = null;

      // Check /settings/logo.json first
      if (settingsLogoRes.status === 'fulfilled' && settingsLogoRes.value.ok) {
        const logoData = await settingsLogoRes.value.json();
        if (typeof logoData === 'string' && logoData.trim()) {
          resolvedLogo = logoData.trim();
        } else if (logoData && typeof logoData === 'object') {
          resolvedLogo = logoData.url || logoData.logoUrl || logoData.logo || null;
        }
      }

      // Check /branding.json (CMS BrandingManager storage node)
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
          siteTitle: resolvedTitle || defaultResult.siteTitle,
          siteDescription: defaultResult.siteDescription
        };
      }
    } catch {
      // Try next Firebase RTDB endpoint if current fails
    }
  }

  return defaultResult;
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Bypass static files (images, CSS, JS, fonts, XML, JSON) immediately for zero latency
  if (pathname.includes('.') && !pathname.endsWith('.html')) {
    return context.next();
  }

  const userAgent = request.headers.get('user-agent') || '';
  const isCrawler = SOCIAL_CRAWLER_REGEX.test(userAgent);

  // 2. Normal user traffic: pass through immediately without waiting on Firebase REST calls
  if (!isCrawler) {
    const response = await context.next();
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('Content-Security-Policy', CSP_HEADER_VALUE);
    return newResponse;
  }

  // 3. If the request is for a specific blog post (/blog/:slug), delegate to /functions/blog/[slug].js
  //    which handles per-article OG images while falling back to the live Firebase logo.
  if (pathname.startsWith('/blog/') && pathname !== '/blog/' && pathname !== '/blog') {
    return context.next();
  }

  // 4. Social Media Crawler detected on root/site pages:
  //    Fetch the latest logo URL & title from Firebase Realtime Database
  const { logoUrl, siteTitle } = await fetchLiveBrandingFromFirebase(env, url.origin);
  const safeLogoUrl = logoUrl.replace(/"/g, '&quot;');
  const safeTitle = siteTitle.replace(/"/g, '&quot;');

  // Create a clean GET request without `Range` headers so Cloudflare never returns 206 Partial Content to Facebook/Twitter
  const cleanRequest = new Request(new URL('/', request.url).toString(), {
    method: 'GET',
    headers: { 'User-Agent': userAgent }
  });

  let baseResponse;
  if (env && env.ASSETS) {
    baseResponse = await env.ASSETS.fetch(cleanRequest);
  } else {
    baseResponse = await fetch(cleanRequest);
  }

  let hasOgImage = false;
  let hasOgTitle = false;
  let hasTwitterImage = false;
  let hasTwitterTitle = false;
  let hasFbAppId = false;

  // 5. Dynamically rewrite <meta property="og:image">, <meta property="og:title">, and <link rel="icon"> using HTMLRewriter
  const rewriter = new HTMLRewriter()
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
    .on('meta[property="og:image"]', {
      element(el) {
        hasOgImage = true;
        el.setAttribute('content', safeLogoUrl);
      }
    })
    .on('meta[property="og:title"]', {
      element(el) {
        hasOgTitle = true;
        el.setAttribute('content', safeTitle);
      }
    })
    .on('meta[name="twitter:image"]', {
      element(el) {
        hasTwitterImage = true;
        el.setAttribute('content', safeLogoUrl);
      }
    })
    .on('meta[name="twitter:title"]', {
      element(el) {
        hasTwitterTitle = true;
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
        if (!hasOgTitle) {
          el.append(`<meta property="og:title" content="${safeTitle}" />`, { html: true });
        }
        if (!hasOgImage) {
          el.append(`<meta property="og:image" content="${safeLogoUrl}" />`, { html: true });
        }
        if (!hasTwitterTitle) {
          el.append(`<meta name="twitter:title" content="${safeTitle}" />`, { html: true });
        }
        if (!hasTwitterImage) {
          el.append(`<meta name="twitter:image" content="${safeLogoUrl}" />`, { html: true });
        }
      }
    });

  const transformedResponse = rewriter.transform(baseResponse);
  const finalHtml = await transformedResponse.text();

  return new Response(finalHtml, {
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


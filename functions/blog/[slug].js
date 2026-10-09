/**
 * Cloudflare Pages Function / Worker: /functions/blog/[slug].js
 * Forces full 200 OK HTML responses (ignoring incoming Range headers) for social media crawlers
 * (facebookexternalhit, Facebot, Twitterbot, LinkedInBot, etc.) and injects dynamic Open Graph & Twitter tags.
 */

const CSP_HEADER_VALUE =
  "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://connect.facebook.net https://*.facebook.com; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https: wss: https://*.facebook.com https://*.facebook.net https://graph.facebook.com https://*.fbcdn.net; img-src 'self' data: blob: https:; frame-src 'self' https: https://*.facebook.com https://*.facebook.net;";

const RESPONSE_HEADERS = {
  'Content-Type': 'text/html; charset=utf-8',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Content-Security-Policy': CSP_HEADER_VALUE
};

export async function onRequest(context) {
  const { request, params, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. Bypass crawler interception for static assets (e.g., favicon.ico, logo.png, .svg, .png, .jpg)
  if (pathname.includes('.') && !pathname.endsWith('.html')) {
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return fetch(request);
  }

  const userAgent = request.headers.get('user-agent') || '';
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Applebot|Pinterest|SkypeUriPreview/i.test(
    userAgent
  );

  // Clean GET request to root HTML shell ignoring incoming Range headers (prevents 206 Partial Content)
  const cleanRootRequest = new Request(new URL('/', request.url).toString(), {
    method: 'GET',
    headers: { 'User-Agent': userAgent }
  });

  // 2. If regular user browser, serve the SPA root HTML shell
  if (!isCrawler) {
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(cleanRootRequest);
    }
    try {
      return await fetch(cleanRootRequest);
    } catch {
      return context.next();
    }
  }

  // 3. If crawler requests root path ('/' or '/index.html'), return full 200 OK HTML ignoring Range headers
  if (pathname === '/' || pathname === '' || pathname === '/index.html') {
    let rootResponse;
    if (env && env.ASSETS) {
      rootResponse = await env.ASSETS.fetch(cleanRootRequest);
    } else {
      rootResponse = await fetch(cleanRootRequest);
    }

    let html = await rootResponse.text();
    if (!html.includes('fb:app_id')) {
      html = html.replace(
        '</head>',
        '  <meta property="fb:app_id" content="966242223397117" />\n</head>'
      );
    }

    return new Response(html, {
      status: 200,
      headers: RESPONSE_HEADERS
    });
  }

  // 4. Crawler requested /blog/:slug -> Fetch blog metadata & live logo fallback from Firebase Realtime Database
  const slug = params?.slug || pathname.split('/').filter(Boolean).pop();
  const origin = url.origin;
  let defaultImage = `${origin}/logo.png`;
  const defaultTitle = 'Dr. Prem Raj Joshi - BAMS, IOM, TU | Ayurvedic Physician';

  const RTDB_URL =
    env?.FIREBASE_DATABASE_URL ||
    'https://drsaap-52b17-default-rtdb.asia-southeast1.firebasedatabase.app';

  let blogData = null;

  try {
    // Fetch live CMS logo fallback from /settings/logo.json or /branding.json in parallel with blog lookup
    const [settingsLogoRes, brandingRes] = await Promise.allSettled([
      fetch(`${RTDB_URL}/settings/logo.json`),
      fetch(`${RTDB_URL}/branding/logoUrl.json`)
    ]);

    if (settingsLogoRes.status === 'fulfilled' && settingsLogoRes.value.ok) {
      const logoVal = await settingsLogoRes.value.json();
      if (typeof logoVal === 'string' && logoVal.startsWith('https://')) {
        defaultImage = logoVal.trim();
      }
    } else if (brandingRes.status === 'fulfilled' && brandingRes.value.ok) {
      const brandLogoVal = await brandingRes.value.json();
      if (typeof brandLogoVal === 'string' && brandLogoVal.startsWith('https://')) {
        defaultImage = brandLogoVal.trim();
      }
    }
  } catch {
    // keep defaultImage fallback
  }

  try {
    const queryUrl = `${RTDB_URL}/blogs.json?orderBy="slug"&equalTo="${encodeURIComponent(slug)}"`;
    let res = await fetch(queryUrl);

    if (!res.ok && RTDB_URL.includes('.asia-southeast1.')) {
      const fallbackUrl = `https://drsaap-52b17-default-rtdb.firebaseio.com/blogs.json?orderBy="slug"&equalTo="${encodeURIComponent(slug)}"`;
      res = await fetch(fallbackUrl);
    }

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        const keys = Object.keys(data);
        if (keys.length > 0) {
          blogData = data[keys[0]];
        }
      }
    }

    if (!blogData) {
      const allRes = await fetch(`${RTDB_URL}/blogs.json`);
      if (allRes.ok) {
        const allData = await allRes.json();
        if (allData && typeof allData === 'object') {
          const list = Array.isArray(allData) ? allData : Object.values(allData);
          blogData = list.find((b) => b && (b.slug === slug || b.id === slug)) || null;
        }
      }
    }
  } catch {
    blogData = null;
  }

  const rawBlogTitle =
    blogData?.title_en ||
    blogData?.titleEn ||
    blogData?.title ||
    blogData?.title_np ||
    blogData?.titleNp;

  const pageTitle = rawBlogTitle
    ? `${rawBlogTitle} | Dr. Prem Raj Joshi`
    : defaultTitle;

  const description =
    blogData?.summary_en ||
    blogData?.summaryEn ||
    blogData?.excerptEn ||
    blogData?.summary ||
    blogData?.description ||
    blogData?.summary_np ||
    blogData?.summaryNp ||
    'Integrative Ayurvedic medicine consultations, holistic wellness therapies, and lifestyle guidance by Dr. Prem Raj Joshi (BAMS, IOM, TU).';

  const coverImage =
    blogData?.cover_image ||
    blogData?.coverImage ||
    blogData?.image ||
    blogData?.thumbnail ||
    defaultImage;

  const canonicalUrl = `${origin}/blog/${slug}`;

  // Fetch original HTML ignoring Range headers
  let baseResponse;
  if (env && env.ASSETS) {
    baseResponse = await env.ASSETS.fetch(cleanRootRequest);
  } else {
    baseResponse = await fetch(cleanRootRequest);
  }

  const safeTitle = pageTitle.replace(/"/g, '&quot;');
  const safeDesc = description.replace(/"/g, '&quot;');
  const safeImage = coverImage;
  const safeUrl = canonicalUrl;

  let hasFbAppId = false;

  const transformed = new HTMLRewriter()
    .on('meta[property="fb:app_id"]', {
      element(el) {
        hasFbAppId = true;
        el.setAttribute('content', '966242223397117');
      }
    })
    .on('meta[property^="og:"]', {
      element(el) {
        el.remove();
      }
    })
    .on('meta[name^="twitter:"]', {
      element(el) {
        el.remove();
      }
    })
    .on('meta[name="description"]', {
      element(el) {
        el.setAttribute('content', safeDesc);
      }
    })
    .on('title', {
      element(el) {
        el.setInnerContent(safeTitle);
      }
    })
    .on('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]', {
      element(el) {
        el.setAttribute('href', defaultImage.replace(/"/g, '&quot;'));
      }
    })
    .on('head', {
      element(el) {
        if (!hasFbAppId) {
          el.append(`<meta property="fb:app_id" content="966242223397117" />`, { html: true });
        }
        el.append(`<meta property="og:type" content="article" />`, { html: true });
        el.append(`<meta property="og:title" content="${safeTitle}" />`, { html: true });
        el.append(`<meta property="og:description" content="${safeDesc}" />`, { html: true });
        el.append(`<meta property="og:image" content="${safeImage}" />`, { html: true });
        el.append(`<meta property="og:image:width" content="1200" />`, { html: true });
        el.append(`<meta property="og:image:height" content="630" />`, { html: true });
        el.append(`<meta property="og:url" content="${safeUrl}" />`, { html: true });
        el.append(`<meta property="og:site_name" content="Dr. Prem Raj Joshi - Ayurvedic Physician" />`, { html: true });

        el.append(`<meta name="twitter:card" content="summary_large_image" />`, { html: true });
        el.append(`<meta name="twitter:title" content="${safeTitle}" />`, { html: true });
        el.append(`<meta name="twitter:description" content="${safeDesc}" />`, { html: true });
        el.append(`<meta name="twitter:image" content="${safeImage}" />`, { html: true });
      }
    })
    .transform(baseResponse);

  const finalHtml = await transformed.text();

  return new Response(finalHtml, {
    status: 200,
    headers: RESPONSE_HEADERS
  });
}

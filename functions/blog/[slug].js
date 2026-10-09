/**
 * Cloudflare Pages Function / Worker: /functions/blog/[slug].js
 * Dynamic Open Graph (OG) & Twitter Card Meta Tag Injection for Social Media Crawlers
 * Connected to Firebase Realtime Database REST API with flexible queries & schema fallbacks.
 * Ensures fb:app_id is injected and Cache-Control: no-cache, no-store, must-revalidate is set.
 */

const CSP_HEADER_VALUE =
  "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://connect.facebook.net https://*.facebook.com; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https: wss: https://*.facebook.com https://*.facebook.net https://graph.facebook.com https://*.fbcdn.net; img-src 'self' data: blob: https:; frame-src 'self' https: https://*.facebook.com https://*.facebook.net;";

function withNoCacheHtmlHeaders(response) {
  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set('Content-Security-Policy', CSP_HEADER_VALUE);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

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

  // 2. For root path requests ('/' or '/index.html'), return the static index.html with hardcoded
  // logo.png metadata and fb:app_id without dynamic overrides getting in the way.
  if (pathname === '/' || pathname === '' || pathname === '/index.html') {
    let rootResponse;
    if (env && env.ASSETS) {
      rootResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
    } else {
      try {
        rootResponse = await fetch(new Request(new URL('/', request.url), request));
      } catch {
        rootResponse = await context.next();
      }
    }

    let html = await rootResponse.text();
    if (!html.includes('property="fb:app_id"')) {
      html = html.replace(
        /<head[^>]*>/i,
        (match) => `${match}\n    <meta property="fb:app_id" content="966242223397117" />`
      );
    }

    const headers = new Headers(rootResponse.headers);
    headers.set('Content-Type', 'text/html; charset=utf-8');
    headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    headers.set('Pragma', 'no-cache');
    headers.set('Expires', '0');
    headers.set('Content-Security-Policy', CSP_HEADER_VALUE);

    return new Response(html, {
      status: rootResponse.status,
      statusText: rootResponse.statusText,
      headers
    });
  }

  const slug = params?.slug || pathname.split('/').filter(Boolean).pop();
  const userAgent = request.headers.get('user-agent') || '';

  // Detect social media and search crawlers
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Applebot|Pinterest|SkypeUriPreview/i.test(
    userAgent
  );

  // If regular user browser, forward request to standard root SPA HTML shell with no-cache headers
  if (!isCrawler) {
    let spaResponse;
    if (env && env.ASSETS) {
      spaResponse = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
    } else {
      try {
        spaResponse = await fetch(new Request(new URL('/', request.url), request));
      } catch {
        spaResponse = await context.next();
      }
    }
    return withNoCacheHtmlHeaders(spaResponse);
  }

  const origin = url.origin;
  const defaultImage = `${origin}/logo.png`;
  const defaultTitle = 'Dr. Prem Raj Joshi - BAMS, IOM, TU | Ayurvedic Physician';

  // Firebase Realtime Database default endpoint
  const RTDB_URL =
    env?.FIREBASE_DATABASE_URL ||
    'https://drsaap-52b17-default-rtdb.asia-southeast1.firebasedatabase.app';

  let blogData = null;

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
          const firstKey = keys[0];
          blogData = data[firstKey];
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
  } catch (err) {
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

  let response;
  if (env && env.ASSETS) {
    response = await env.ASSETS.fetch(new Request(new URL('/', request.url), request));
  } else {
    try {
      response = await fetch(new Request(new URL('/', request.url), request));
    } catch {
      response = await context.next();
    }
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
    .transform(response);

  return withNoCacheHtmlHeaders(transformed);
}

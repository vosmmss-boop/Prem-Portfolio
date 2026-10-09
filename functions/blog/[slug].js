/**
 * Cloudflare Pages Function / Worker: /functions/blog/[slug].js
 * Dynamic Open Graph (OG) & Twitter Card Meta Tag Injection for Social Media Crawlers
 * Connected to Firebase Realtime Database REST API with flexible queries & schema fallbacks
 */

export async function onRequest(context) {
  const { request, params, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Bypass crawler interception for static assets (e.g., favicon.ico, logo.png, .svg, .png, .jpg)
  if (pathname.includes('.') && !pathname.endsWith('.html')) {
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }
    return fetch(request);
  }

  const slug = params?.slug || pathname.split('/').filter(Boolean).pop();
  const userAgent = request.headers.get('user-agent') || '';

  // Detect social media and search crawlers
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Applebot|Pinterest|SkypeUriPreview/i.test(
    userAgent
  );

  // If regular user browser, forward request to standard root SPA HTML shell
  if (!isCrawler) {
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(new Request(new URL('/', request.url), request));
    }
    try {
      return await fetch(new Request(new URL('/', request.url), request));
    } catch {
      return context.next();
    }
  }

  const origin = url.origin;
  const defaultImage = `${origin}/logo.png`;
  const defaultTitle = 'Dr. Prem Raj Joshi - BAMS, IOM, TU | Ayurvedic Physician';

  // If request is for root path ('/' or '/index.html'), ensure <title>, og:title, twitter:title, og:image, and twitter:image match exactly
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

    return new HTMLRewriter()
      .on('title', {
        element(el) {
          el.setInnerContent(defaultTitle);
        }
      })
      .on('meta[property="og:title"]', {
        element(el) {
          el.setAttribute('content', defaultTitle);
        }
      })
      .on('meta[name="twitter:title"]', {
        element(el) {
          el.setAttribute('content', defaultTitle);
        }
      })
      .on('meta[property="og:image"]', {
        element(el) {
          el.setAttribute('content', defaultImage);
        }
      })
      .on('meta[name="twitter:image"]', {
        element(el) {
          el.setAttribute('content', defaultImage);
        }
      })
      .transform(rootResponse);
  }

  // Firebase Realtime Database default endpoint
  // Works with both default regional domain and default rtdb
  const RTDB_URL = env?.FIREBASE_DATABASE_URL ||
    'https://drsaap-52b17-default-rtdb.asia-southeast1.firebasedatabase.app';

  let blogData = null;

  try {
    // 1. Flexible Firebase Querying using orderBy="slug"&equalTo="${slug}"
    const queryUrl = `${RTDB_URL}/blogs.json?orderBy="slug"&equalTo="${encodeURIComponent(slug)}"`;
    let res = await fetch(queryUrl);

    // If region query fails or index isn't ready, try default firebaseio.com or fetch fallback
    if (!res.ok && RTDB_URL.includes('.asia-southeast1.')) {
      const fallbackUrl = `https://drsaap-52b17-default-rtdb.firebaseio.com/blogs.json?orderBy="slug"&equalTo="${encodeURIComponent(slug)}"`;
      res = await fetch(fallbackUrl);
    }

    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object') {
        // Firebase returns a map keyed by push ID (e.g., {"-NkJ1829s": { ...blogData }})
        const keys = Object.keys(data);
        if (keys.length > 0) {
          const firstKey = keys[0];
          blogData = data[firstKey];
        }
      }
    }

    // Secondary fallback: if query by slug returned null/empty, fetch blogs list and search
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
    // Network or parse issue: fall back gracefully
    blogData = null;
  }

  // 2. Fallback Object Access
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

  // 3. Fetch the root HTML shell ('/') to ensure 200 OK status
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

  // 4. HTMLRewriter: strip existing static og: / twitter: meta tags and inject dynamic ones
  return new HTMLRewriter()
    // Strip existing static open graph & twitter tags to avoid duplicate tag conflicts
    .on('meta[property^="og:"]', {
      element(el) {
        el.remove();
      }
    })
    .on('meta[property="fb:app_id"]', {
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
        // Append dynamic Open Graph tags
        el.append(`<meta property="fb:app_id" content="966242223397117" />`, { html: true });
        el.append(`<meta property="og:type" content="article" />`, { html: true });
        el.append(`<meta property="og:title" content="${safeTitle}" />`, { html: true });
        el.append(`<meta property="og:description" content="${safeDesc}" />`, { html: true });
        el.append(`<meta property="og:image" content="${safeImage}" />`, { html: true });
        el.append(`<meta property="og:image:width" content="1200" />`, { html: true });
        el.append(`<meta property="og:image:height" content="630" />`, { html: true });
        el.append(`<meta property="og:url" content="${safeUrl}" />`, { html: true });
        el.append(`<meta property="og:site_name" content="Dr. Prem Raj Joshi - Ayurvedic Physician" />`, { html: true });

        // Append dynamic Twitter Card tags
        el.append(`<meta name="twitter:card" content="summary_large_image" />`, { html: true });
        el.append(`<meta name="twitter:title" content="${safeTitle}" />`, { html: true });
        el.append(`<meta name="twitter:description" content="${safeDesc}" />`, { html: true });
        el.append(`<meta name="twitter:image" content="${safeImage}" />`, { html: true });
      }
    })
    .transform(response);
}


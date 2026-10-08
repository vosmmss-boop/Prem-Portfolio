/**
 * Cloudflare Pages Function: /functions/blog/[slug].js
 * Dynamic Open Graph (OG) & Twitter Card Meta Tag Injection for Social Media Crawlers
 * Connected to Firebase Realtime Database REST API
 */

export async function onRequest(context) {
  const { request, params, env } = context;
  const slug = params.slug;
  const userAgent = request.headers.get('user-agent') || '';

  // Detect social media crawlers
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot|Applebot/i.test(
    userAgent
  );

  // If regular user browser, forward request to standard SPA index page
  if (!isCrawler) {
    return context.next();
  }

  // Firebase Realtime Database endpoint
  // Using user project id: drsaap-52b17 (asia-southeast1 region)
  const firebaseRestUrl = `https://drsaap-52b17-default-rtdb.asia-southeast1.firebasedatabase.app/blogs.json`;

  let blogData = {
    titleEn: 'Dr. Prem Raj Joshi - Health Article',
    excerptEn: 'Ayurvedic Medical Article by Dr. Prem Raj Joshi (BAMS, IOM, TU).',
    coverImage: 'https://drpremrajjoshi.com.np/src/assets/images/doctor_portrait_1791392878397.jpg'
  };

  try {
    const res = await fetch(firebaseRestUrl);
    if (res.ok) {
      const allBlogs = await res.json();
      if (allBlogs) {
        // Find matching blog by slug
        const blogsList = Array.isArray(allBlogs) ? allBlogs : Object.values(allBlogs);
        const match = blogsList.find((b) => b && b.slug === slug);
        if (match) {
          blogData = match;
        }
      }
    }
  } catch (err) {
    // Graceful fallback to default metadata
  }

  // Fetch the base HTML response
  const response = await context.next();

  const title = blogData.titleEn || 'Dr. Prem Raj Joshi - Ayurvedic Physician';
  const description = blogData.excerptEn || 'Integrative Ayurvedic medicine and consultations.';
  const image = blogData.coverImage || 'https://drpremrajjoshi.com.np/src/assets/images/doctor_portrait_1791392878397.jpg';
  const url = `https://drpremrajjoshi.com.np/blog/${slug}`;

  // HTMLRewriter dynamic head injection
  return new HTMLRewriter()
    .on('title', {
      element(e) {
        e.setInnerContent(`${title} | Dr. Prem Raj Joshi`);
      }
    })
    .on('head', {
      element(e) {
        e.append(`<meta property="og:type" content="article" />`, { html: true });
        e.append(`<meta property="og:title" content="${title.replace(/"/g, '&quot;')}" />`, { html: true });
        e.append(`<meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />`, { html: true });
        e.append(`<meta property="og:image" content="${image}" />`, { html: true });
        e.append(`<meta property="og:url" content="${url}" />`, { html: true });
        e.append(`<meta name="twitter:card" content="summary_large_image" />`, { html: true });
        e.append(`<meta name="twitter:title" content="${title.replace(/"/g, '&quot;')}" />`, { html: true });
        e.append(`<meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />`, { html: true });
        e.append(`<meta name="twitter:image" content="${image}" />`, { html: true });
      }
    })
    .transform(response);
}

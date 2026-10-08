/**
 * Cloudflare Pages Function: /functions/sitemap.xml.js
 * Hidden Dynamic Serverless XML Sitemap Generation
 * Dynamically queries Firebase Realtime Database for blogs, education, experience slugs
 */

export async function onRequest(context) {
  const baseUrl = 'https://drpremrajjoshi.com.np';
  const currentDate = new Date().toISOString().slice(0, 10);

  // Static Anchors
  const staticRoutes = [
    { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/#home`, priority: '0.9', changefreq: 'weekly' },
    { loc: `${baseUrl}/#about`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/#journey`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/#experience`, priority: '0.8', changefreq: 'monthly' },
    { loc: `${baseUrl}/#blogs`, priority: '0.9', changefreq: 'daily' },
    { loc: `${baseUrl}/#faq`, priority: '0.7', changefreq: 'monthly' },
    { loc: `${baseUrl}/#gallery`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${baseUrl}/#socialmedia`, priority: '0.5', changefreq: 'monthly' }
  ];

  // Fetch dynamic slugs from Firebase RTDB REST API
  let dynamicBlogs = [];
  try {
    const res = await fetch(`https://drsaap-52b17-default-rtdb.asia-southeast1.firebasedatabase.app/blogs.json`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        const list = Array.isArray(data) ? data : Object.values(data);
        dynamicBlogs = list.filter((b) => b && b.slug).map((b) => ({
          loc: `${baseUrl}/blog/${b.slug}`,
          lastmod: b.publishDate || currentDate,
          priority: '0.85',
          changefreq: 'weekly'
        }));
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  // Pre-seed known education & experience slugs
  const journeyRoutes = [
    'bams-iom-tu',
    'clinical-residency-kirtipur',
    'isc-ascol-tu'
  ].map((slug) => ({
    loc: `${baseUrl}/journey/${slug}`,
    lastmod: currentDate,
    priority: '0.7',
    changefreq: 'monthly'
  }));

  const experienceRoutes = [
    'consultant-ayurvedic-physician-kathmandu',
    'rural-community-health-outreach-director',
    'medical-officer-ayurveda-teaching-hospital'
  ].map((slug) => ({
    loc: `${baseUrl}/experience/${slug}`,
    lastmod: currentDate,
    priority: '0.7',
    changefreq: 'monthly'
  }));

  const allUrls = [...staticRoutes, ...dynamicBlogs, ...journeyRoutes, ...experienceRoutes];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod || currentDate}</lastmod>
    <changefreq>${u.changefreq || 'weekly'}</changefreq>
    <priority>${u.priority || '0.7'}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400'
    }
  });
}

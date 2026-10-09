/**
 * Cloudflare Pages Root Function: /functions/index.js
 * Forces full 200 OK HTML responses (ignoring incoming Range headers) for social media crawlers
 * (facebookexternalhit, Facebot, Twitterbot, LinkedInBot, etc.) and ensures fb:app_id is present.
 */

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
  const isCrawler = /facebookexternalhit|Facebot|Twitterbot|LinkedInBot|WhatsApp|TelegramBot|Slackbot|Discordbot/i.test(
    userAgent
  );

  if (isCrawler) {
    // Fetch original HTML ignoring Range headers so crawlers always get a full 200 OK instead of 206 Partial Content
    const cleanRequest = new Request(new URL('/', request.url).toString(), {
      method: 'GET',
      headers: { 'User-Agent': userAgent }
    });

    let response;
    if (env && env.ASSETS) {
      response = await env.ASSETS.fetch(cleanRequest);
    } else {
      response = await fetch(cleanRequest);
    }

    let html = await response.text();

    // Ensure fb:app_id exists in head
    if (!html.includes('fb:app_id')) {
      html = html.replace(
        '</head>',
        '  <meta property="fb:app_id" content="966242223397117" />\n</head>'
      );
    }

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Content-Security-Policy':
          "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://connect.facebook.net https://*.facebook.com; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https: wss: https://*.facebook.com https://*.facebook.net https://graph.facebook.com https://*.fbcdn.net; img-src 'self' data: blob: https:; frame-src 'self' https: https://*.facebook.com https://*.facebook.net;"
      }
    });
  }

  return context.next();
}

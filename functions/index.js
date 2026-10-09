/**
 * Cloudflare Pages Root Function: /functions/index.js
 * Serves the static index.html for root path requests ('/') with hardcoded logo.png metadata
 * and fb:app_id without dynamic overrides getting in the way, ensuring fb:app_id is present
 * and setting Cache-Control: no-cache, no-store, must-revalidate on HTML responses.
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

  let html = await response.text();

  // Ensure <meta property="fb:app_id" content="966242223397117" /> is present in <head> if not already present
  if (!html.includes('property="fb:app_id"')) {
    html = html.replace(
      /<head[^>]*>/i,
      (match) => `${match}\n    <meta property="fb:app_id" content="966242223397117" />`
    );
  }

  const headers = new Headers(response.headers);
  headers.set('Content-Type', 'text/html; charset=utf-8');
  headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  headers.set('Pragma', 'no-cache');
  headers.set('Expires', '0');
  headers.set(
    'Content-Security-Policy',
    "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://connect.facebook.net https://*.facebook.com; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https: wss: https://*.facebook.com https://*.facebook.net https://graph.facebook.com https://*.fbcdn.net; img-src 'self' data: blob: https:; frame-src 'self' https: https://*.facebook.com https://*.facebook.net;"
  );

  return new Response(html, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

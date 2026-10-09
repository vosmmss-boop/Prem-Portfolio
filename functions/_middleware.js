/**
 * Cloudflare Pages Global Middleware: /functions/_middleware.js
 * Applies Content-Security-Policy header allowing Facebook domains (`connect.facebook.net`,
 * `*.facebook.com`, `*.facebook.net`, `graph.facebook.com`, `*.fbcdn.net`) alongside Firebase/ImgBB.
 */

const CSP_HEADER_VALUE =
  "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: https://connect.facebook.net https://*.facebook.com; style-src 'self' 'unsafe-inline' https:; font-src 'self' data: https:; connect-src 'self' https: wss: https://*.facebook.com https://*.facebook.net https://graph.facebook.com https://*.fbcdn.net; img-src 'self' data: blob: https:; frame-src 'self' https: https://*.facebook.com https://*.facebook.net;";

export async function onRequest(context) {
  const response = await context.next();
  const newResponse = new Response(response.body, response);
  newResponse.headers.set('Content-Security-Policy', CSP_HEADER_VALUE);
  return newResponse;
}

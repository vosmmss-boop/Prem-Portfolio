/**
 * Cloudflare Pages Root Function: /functions/index.js
 * Ensures homepage ('/') requests serve `${origin}/logo.png` in og:image and twitter:image
 * along with fb:app_id for Facebook Sharing Debugger & social crawlers.
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

  const origin = url.origin;
  const defaultImage = `${origin}/logo.png`;
  const pageTitle = 'Dr. Prem Raj Joshi - BAMS, IOM, TU | Ayurvedic Physician';

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

  return new HTMLRewriter()
    .on('title', {
      element(el) {
        el.setInnerContent(pageTitle);
      }
    })
    .on('meta[property="og:title"]', {
      element(el) {
        el.setAttribute('content', pageTitle);
      }
    })
    .on('meta[name="twitter:title"]', {
      element(el) {
        el.setAttribute('content', pageTitle);
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
    .transform(response);
}

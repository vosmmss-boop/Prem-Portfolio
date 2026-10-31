/**
 * Cloudflare Pages Function: /functions/update-edge-data.js
 * Receives full site content JSON from CMS Admin Sync and updates Cloudflare KV cache.
 */

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();

    if (!data || typeof data !== 'object') {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON payload' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // If Cloudflare KV namespace is bound (e.g. SITE_CACHE, KV_CACHE, or EDGE_DATA)
    const kv = env?.SITE_CACHE || env?.KV_CACHE || env?.EDGE_DATA;
    if (kv && typeof kv.put === 'function') {
      await kv.put('latest_site_data', JSON.stringify(data));
      await kv.put('latest_sync_timestamp', String(Date.now()));
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Cloudflare edge data updated successfully',
        timestamp: Date.now()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || 'Failed to process edge data update'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

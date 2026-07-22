export const config = {
  runtime: 'edge',
};

// Server-side proxy for Google Programmable Search (Custom Search JSON API) in
// image mode. The API key never reaches the browser — it lives in Vercel env vars
// GOOGLE_CSE_KEY (API key) and GOOGLE_CSE_CX (search engine id). When those aren't
// configured the endpoint returns 503 and the client quietly falls back to its
// keyless sources (Wikipedia / Commons / Openverse).
export default async function handler(req) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const key = process.env.GOOGLE_CSE_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!key || !cx) {
    return new Response(JSON.stringify({ error: 'not_configured', results: [] }), {
      status: 503,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get('q') || '').trim();
    if (!q) {
      return new Response(JSON.stringify({ error: 'missing_query', results: [] }), {
        status: 400,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    const start = Math.max(1, Math.min(91, parseInt(url.searchParams.get('start') || '1', 10) || 1));

    const api = new URL('https://www.googleapis.com/customsearch/v1');
    api.searchParams.set('key', key);
    api.searchParams.set('cx', cx);
    api.searchParams.set('q', q);
    api.searchParams.set('searchType', 'image');
    api.searchParams.set('num', '10');
    api.searchParams.set('start', String(start));
    api.searchParams.set('safe', 'active');

    const gRes = await fetch(api.toString());
    if (!gRes.ok) {
      const body = await gRes.text();
      return new Response(JSON.stringify({ error: 'google_error', status: gRes.status, detail: body.slice(0, 500), results: [] }), {
        status: 502,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
    const data = await gRes.json();
    const results = (data.items || []).map((it, i) => ({
      id: `g-${start + i}`,
      title: it.title,
      thumbnail: it.image?.thumbnailLink || it.link,
      url: it.link,
      width: it.image?.width,
      height: it.image?.height,
      source: 'Google',
      license: 'เว็บ',
      context: it.image?.contextLink,
    })).filter(r => r.thumbnail);

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json', 'Cache-Control': 's-maxage=3600' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error?.message || error), results: [] }), {
      status: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
}

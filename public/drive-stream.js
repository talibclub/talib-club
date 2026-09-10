// Loaded by sw.js. Reassembles small authenticated responses into a streaming
// media response, staying below Vercel's per-response payload limit. No file
// content (including private notes/slips) is ever written to CacheStorage.
async function streamDriveFile(request) {
  const url = new URL(request.url);
  const metaUrl = new URL(url); metaUrl.searchParams.set('meta', '1');
  const fetchHeaders = new Headers();
  if (request.headers.has('authorization')) fetchHeaders.set('Authorization', request.headers.get('authorization'));
  const metadata = await fetch(metaUrl, { headers: fetchHeaders, credentials: 'same-origin', cache: 'no-store' });
  if (!metadata.ok) return metadata;
  const meta = await metadata.json();
  let start = 0, end = meta.size - 1;
  const range = request.headers.get('range');
  if (range) {
    const m = /^bytes=(\d*)-(\d*)$/.exec(range);
    if (!m || (!m[1] && !m[2])) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${meta.size}` } });
    start = m[1] ? Number(m[1]) : Math.max(0, meta.size - Number(m[2]));
    end = m[1] && m[2] ? Math.min(Number(m[2]), end) : end;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= meta.size) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${meta.size}` } });
  }
  const headers = new Headers({ 'Content-Type': meta.type, 'Content-Length': String(end - start + 1), 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'; sandbox" });
  if (range) headers.set('Content-Range', `bytes ${start}-${end}/${meta.size}`);
  if (url.searchParams.get('download') === '1' || meta.type === 'application/octet-stream') headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(meta.name)}`);
  url.searchParams.set('part', '1');
  const abort = new AbortController();
  const stream = new ReadableStream({
    async pull(controller) {
      if (start > end) { controller.close(); return; }
      const last = Math.min(start + meta.chunkSize - 1, end);
      const headers = new Headers(fetchHeaders); headers.set('Range', `bytes=${start}-${last}`);
      try {
        const response = await fetch(url, { headers, credentials: 'same-origin', cache: 'no-store', signal: abort.signal });
        if (response.status !== 206) throw new Error(`Drive read failed: ${response.status}`);
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes.length !== last - start + 1) throw new Error('Incomplete Drive response');
        controller.enqueue(bytes);
        start = last + 1;
      } catch (error) { controller.error(error); }
    },
    cancel() { abort.abort(); },
  });
  return new Response(stream, { status: range ? 206 : 200, headers });
}

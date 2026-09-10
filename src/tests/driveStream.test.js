import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { describe, it, expect, vi } from 'vitest';
const { Headers, Request, ReadableStream } = globalThis;
const script = readFileSync(new URL('../../public/drive-stream.js', import.meta.url), 'utf8');
function setup() {
  const bytes = new Uint8Array([0,1,2,3,4,5,6,7]);
  const fetch = vi.fn(async (url, options) => {
    if (new URL(url).searchParams.has('meta')) return Response.json({ size: 8, type: 'video/mp4', name: 'clip.mp4', chunkSize: 3 });
    const range = options.headers.get('Range').match(/bytes=(\d+)-(\d+)/);
    return new Response(bytes.slice(Number(range[1]), Number(range[2])+1), { status: 206 });
  });
  const context = vm.createContext({ URL, Headers, Request, Response, ReadableStream, AbortController, Uint8Array, fetch });
  vm.runInContext(script, context);
  return { run: context.streamDriveFile, fetch };
}
describe('Drive streaming across bounded serverless responses', () => {
  it('assembles a file larger than a backend chunk with no missing bytes', async () => {
    const { run, fetch } = setup();
    const res = await run(new Request('https://talibclub.org/api/files?id=abc'));
    expect(res.status).toBe(200);
    expect([...new Uint8Array(await res.arrayBuffer())]).toEqual([0,1,2,3,4,5,6,7]);
    expect(fetch).toHaveBeenCalledTimes(4);
    expect(res.headers.get('Cache-Control')).toBe('no-store');
  });
  it('supports seeking and suffix requests', async () => {
    const { run } = setup();
    const res = await run(new Request('https://talibclub.org/api/files?id=abc', { headers: { Range: 'bytes=2-6' } }));
    expect(res.status).toBe(206);
    expect(res.headers.get('Content-Range')).toBe('bytes 2-6/8');
    expect([...new Uint8Array(await res.arrayBuffer())]).toEqual([2,3,4,5,6]);
    const suffix = await run(new Request('https://talibclub.org/api/files?id=abc', { headers: { Range: 'bytes=-2' } }));
    expect([...new Uint8Array(await suffix.arrayBuffer())]).toEqual([6,7]);
  });
  it('rejects multi-range requests', async () => {
    const { run } = setup();
    expect((await run(new Request('https://talibclub.org/api/files?id=abc', { headers: { Range: 'bytes=1-2,4-5' } }))).status).toBe(416);
  });
});

import { lookup } from 'node:dns/promises';
import { request } from 'node:https';
import { Readable } from 'node:stream';

export function publicIPv4(address) {
  const parts = address.split('.').map(Number);
  if (parts.length !== 4 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = parts;
  return !(a === 0 || a === 10 || a === 127 || a >= 224
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && [0, 168].includes(b)) || (a === 198 && [18, 19, 51].includes(b))
    || (a === 203 && b === 0));
}

export async function resolvePublicAddress(hostname) {
  // Use only IPv4 for outbound proxies; no mapped-IPv6/private-address ambiguity.
  const addresses = await lookup(hostname, { all: true, family: 4 });
  if (!addresses.length || addresses.some(item => !publicIPv4(item.address))) throw new Error('Host not allowed');
  return addresses[0].address;
}

export async function safeFetch(url, options = {}) {
  const target = new URL(url);
  if (target.protocol !== 'https:' || target.username || target.password || (target.port && target.port !== '443')) throw new Error('Invalid destination');
  const address = await resolvePublicAddress(target.hostname);
  return new Promise((resolve, reject) => {
    const req = request(target, {
      method: 'GET', headers: options.headers, agent: false,
      // Pin the socket to the IP we validated. TLS still validates the original hostname.
      lookup: (_hostname, opts, callback) => opts.all
        ? callback(null, [{ address, family: 4 }]) : callback(null, address, 4),
    }, incoming => {
      const headers = new Headers();
      for (const [key, value] of Object.entries(incoming.headers)) {
        if (value !== undefined) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      }
      const status = incoming.statusCode || 502;
      if ([204, 205, 304].includes(status)) { incoming.resume(); resolve(new Response(null, { status, headers })); }
      else resolve(new Response(Readable.toWeb(incoming), { status, headers }));
    });
    const deadline = setTimeout(() => req.destroy(new Error('Upstream timeout')), 30000);
    req.on('close', () => clearTimeout(deadline));
    req.on('error', reject);
    req.end();
  });
}

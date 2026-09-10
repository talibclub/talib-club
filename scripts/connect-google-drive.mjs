import { createServer } from 'node:http';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

// Usage: node --env-file=.env.drive.local scripts/connect-google-drive.mjs
// The user opens the URL manually and consents as the owner of the target Drive.
const file = '.env.drive.local';
const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
if (!clientId || !clientSecret) throw new Error('Set GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET in .env.drive.local first.');
const redirect = 'http://127.0.0.1:53682/callback';
const state = randomBytes(32).toString('hex');
const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
for (const [key, value] of Object.entries({ client_id: clientId, redirect_uri: redirect, response_type: 'code', scope: 'https://www.googleapis.com/auth/drive.file', access_type: 'offline', prompt: 'consent', state })) url.searchParams.set(key, value);
const server = createServer(async (req, res) => {
  const incoming = new URL(req.url, redirect);
  if (incoming.pathname === '/') {
    res.writeHead(302, { Location: url.href, 'Cache-Control': 'no-store' }).end();
    return;
  }
  if (incoming.pathname !== '/callback') { res.writeHead(404).end(); return; }
  const supplied = incoming.searchParams.get('state') || '';
  if (supplied.length !== state.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(state))) { res.writeHead(403).end('Invalid state'); return; }
  try {
    const code = incoming.searchParams.get('code');
    if (!code) throw new Error('Authorization cancelled.');
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirect, grant_type: 'authorization_code' }),
    });
    if (!response.ok) throw new Error('Token exchange failed. Check OAuth client and redirect URI.');
    const tokens = await response.json();
    if (!tokens.refresh_token) throw new Error('No refresh token returned. Reconnect with consent.');
    const folderResponse = await fetch('https://www.googleapis.com/drive/v3/files?fields=id', {
      method: 'POST', headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Talib Club Website Files', mimeType: 'application/vnd.google-apps.folder' }),
    });
    if (!folderResponse.ok) throw new Error('Cannot create Drive folder. Enable Drive API and check available space.');
    const folder = await folderResponse.json();
    let contents = await readFile(file, 'utf8');
    for (const [key, value] of Object.entries({ GOOGLE_DRIVE_REFRESH_TOKEN: tokens.refresh_token, GOOGLE_DRIVE_FOLDER_ID: folder.id })) {
      const line = `${key}=${JSON.stringify(value)}`;
      const pattern = new RegExp(`^${key}=.*$`, 'm');
      contents = pattern.test(contents) ? contents.replace(pattern, () => line) : `${contents.trimEnd()}\n${line}\n`;
    }
    await writeFile(file, contents, { mode: 0o600 });
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }).end('เชื่อม Google Drive แล้ว ปิดหน้านี้ได้');
    console.log('Connected. Server credentials saved to .env.drive.local (git-ignored). Do not paste its contents into chat or commit it.');
  } catch (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end('Connection failed. See terminal.');
    console.error(error.message);
    process.exitCode = 1;
  } finally { clearTimeout(timeout); server.close(); }
});
const timeout = setTimeout(() => { console.error('Authorization timed out. Run the command again.'); server.close(); }, 15 * 60 * 1000);
server.listen(53682, '127.0.0.1', () => console.log('Open http://127.0.0.1:53682/ in your browser to connect the website owner’s Google Drive. This link expires after 15 minutes.'));

# Google Drive storage for Talib Club

## สำหรับผู้ดูแล

โค้ดส่วนอัปโหลดเปลี่ยนเป็น Google Drive แล้ว แต่ยังไม่ได้เชื่อมบัญชีหรือ deploy ใช้งานจริง ขั้นถัดไปคือเข้าสู่ระบบ Google แล้วสร้าง OAuth Client ตามขั้นตอนด้านล่าง ไม่ต้องสมัคร Free Trial หรือเพิ่มบัตรเพื่อทำขั้นตอนนี้

ผลตรวจวันที่ 10 กันยายน 2026: build ผ่าน และเทสต์ Drive 18 กรณีผ่าน เทสต์เดิมด้าน pageGrowth/dedupePage มี 3 กรณีไม่ผ่าน โดยไฟล์เหล่านั้นไม่ได้ถูกแก้ในงานนี้

ตรวจรายการ Firebase แบบอ่านอย่างเดียวพบ 372 ไฟล์ เตรียมย้ายได้ 276 ไฟล์ และเว้นรูปปกเก่า 96 ไฟล์ที่ไม่พบอ้างอิงในเนื้อหาสาธารณะปัจจุบันไว้ก่อน การทดลองอ่านข้อมูลจริงของรูปปก 16 ไบต์ตอบ 403 แม้จะอ่านรายชื่อได้ จึงยังไม่ได้ย้ายไฟล์ใด ต้องกู้สิทธิ์อ่าน Firebase หรือใช้ต้นฉบับอัปโหลดใหม่

## Status

The application now sends new uploads to the website owner's Google Drive, including library/article/campaign covers, media covers, PDFs, videos, audio, slips, staff attachments, bookshelf files and notebook content. Firebase Auth and Firestore remain in use. Existing external URLs still work as before. Existing Firebase files are **not** automatically recoverable when Firebase denies access.

This change is not connected or deployed until the owner completes the setup below. Build/mock tests cannot verify a real Google account's consent, remaining space, upload CORS, quotas or deployed playback. Do not describe the migration as completed before those checks pass.

## Connect the owner's account once

1. In Google Cloud Console select/create a project and enable **Google Drive API**. The ordinary Drive free quota does not require upgrading Firebase Storage. Do not request a paid quota increase.
2. Configure Google Auth Platform (OAuth consent). Use the minimal `https://www.googleapis.com/auth/drive.file` scope. For initial testing, add the Drive owner's email as a test user. Testing-mode refresh tokens normally expire after seven days for this scope; move the OAuth app to Production for continued use and complete whatever consent/verification Google requests. This step is separate from deploying the website.
3. Create an OAuth client of type **Web application** with this exact authorized redirect URI: `http://127.0.0.1:53682/callback`.
4. Create `.env.drive.local` in the repository (already ignored by Git):

   ```dotenv
   GOOGLE_DRIVE_CLIENT_ID="your-client-id"
   GOOGLE_DRIVE_CLIENT_SECRET="your-client-secret"
   ```

5. Run with Node 20.6+:

   ```powershell
   node --env-file=.env.drive.local scripts/connect-google-drive.mjs
   ```

   Open the printed URL manually and sign in as the owner of the Drive that will hold the files. The script listens only on localhost, validates OAuth state, creates a **private** folder named `Talib Club Website Files`, and saves the refresh token and folder ID into `.env.drive.local`. It does not print secrets. Do not paste secrets into chat, commit them, or put them in any `VITE_` variable.

6. Add these server environment variables to the actual hosting project:

   - `GOOGLE_DRIVE_CLIENT_ID`
   - `GOOGLE_DRIVE_CLIENT_SECRET`
   - `GOOGLE_DRIVE_REFRESH_TOKEN`
   - `GOOGLE_DRIVE_FOLDER_ID`
   - Existing `FIREBASE_SERVICE_ACCOUNT` for the same Firebase project used by the frontend
   - `ALLOWED_ORIGIN` matching the canonical site exactly, for example `https://talibclub.org`

7. Deploy the code and refresh the site. The existing Service Worker must update to v5 to stream large files. Do not share the Drive folder publicly: it also contains private files. The site controls public access to covers/library/media; staff and member assets require Firebase authentication.

Service accounts cannot own files in a personal My Drive. Sharing a personal folder with a Firebase service account is not a replacement for the owner's OAuth connection.

## How the app works

- `api/files.js` dispatches storage operations, media reads and the existing external-PDF proxy in one function, preserving the original number of deployable API functions. The old `/api/proxy-pdf` route is rewritten for compatibility.
- The server verifies Firebase identity and role, chooses the allowed path/access class, reserves daily quota and creates a narrowly scoped Drive resumable upload session. The browser uploads file bytes directly to that session. The owner OAuth access/refresh tokens never leave the server.
- Completion verifies Drive file ID, parent, MIME type, size and app upload marker before publishing a mapping. A compare-and-swap prevents two simultaneous writes from silently replacing each other. It is not a general multi-device notebook merge system.
- `_driveFiles`, `_drivePaths`, `_driveUploads`, `_driveUsage` are server-only Firestore collections. Existing rules deny client access by default; never add a broad client read/write rule for these collections.
- Stable `/api/files?id=...` URLs render covers and persist in Firestore. Files stay private in Drive even when published through the public website. Private IDs alone are not authorization: the API checks the viewer, and media uses an HttpOnly cookie synchronized with Firebase login/logout/token refresh.
- `public/drive-stream.js` assembles 2 MiB chunks into streaming responses and supports byte ranges for seeking. This avoids Vercel's per-response size limit. It never caches private media in CacheStorage. PDF/notebook fetches also have a chunked client helper for first-load cases without a controlling Service Worker.
- A browser without Service Worker support can still read files up to 2 MiB directly; large native video/downloads require a controlling Service Worker. On first visit, refresh after worker installation if large media cannot open. Deployed Safari/iOS, seeking and new-tab downloads must be tested with real files.
- Each chunk still consumes Google API requests, Firestore reads, host invocations and outbound host traffic. Drive space being free does **not** mean unlimited delivery on the host. Do not enable paid plans automatically. Monitor all free quotas.
- Public cover images: 2 MiB after compression. Slips: 5 MiB. Member files: 50 MiB. Staff files/video: 500 MiB. Daily upload reservations: 250 MiB/member, 2 GiB/staff, up to 300 upload starts per user. Failed/abandoned starts count until the next UTC day.
- Notebook autosave keeps the current and one previous Drive generation; after a committed save it removes older app-created generations. Failed uploads/cleanup can leave orphan files; review `_driveUploads` against `_drivePaths` before removing orphans from the dedicated folder. Never delete the folder or current notebook generations as a cleanup shortcut.

## Move existing Firebase assets

Keep a backup and run a dry run first. This requires working read access to the old Firebase bucket; it cannot bypass the billing suspension.

```powershell
node --env-file=.env.local --env-file=.env.drive.local scripts/migrate-firebase-files-to-drive.mjs
```

The environment must include `VITE_WEB_FIREBASE_STORAGE_BUCKET`, `FIREBASE_SERVICE_ACCOUNT`, the four Google Drive variables and the canonical `ALLOWED_ORIGIN`. Inspect `drive-migration-report.json`; it lists supported/unknown paths without printing download tokens. When ready:

```powershell
node --env-file=.env.local --env-file=.env.drive.local scripts/migrate-firebase-files-to-drive.mjs --apply
```

The migration copies supported Firebase objects to Drive, verifies size, creates app mappings, then walks Firestore collections/subcollections and replaces only URLs from the configured Firebase bucket. Original document snapshots are saved under the ignored `backup_data/drive-migration/` directory. Firestore writes check update timestamps to avoid overwriting concurrent changes. Original Firebase objects are never deleted. Unknown prefixes are left for manual review. Static source-code URLs and third-party URLs are not rewritten.

If old Storage is inaccessible, re-upload original covers/PDFs/video through the admin forms instead. Notebook JSON/media need their original data or a reviewed backup, not a blank replacement. Until legacy notebooks are copied or confirmed absent, the notebook read path attempts the old Firebase location and blocks cloud writes on permission/network failures.

Only after reviewing the migration report and confirming that all old notebooks are accounted for, set `GOOGLE_DRIVE_LEGACY_NOTEBOOKS_MIGRATED=true` on the server. This makes an absent Drive mapping mean a new notebook and enables creation without consulting the blocked Firebase bucket. Do not set it to bypass an unresolved migration error.

## Acceptance checks before going live

1. Connect the owner account and verify the dedicated private folder and remaining space.
2. As staff, upload a cover, PDF larger than 4.5 MB, audio and a video. Refresh, open an incognito public page, display the cover, download/read the PDF and seek within the video.
3. Upload a slip and a private notebook/book as member A. Member B and an anonymous visitor must receive 401/403 even with the exact file URL. Staff may read slips/staff attachments but not other members' notebooks. Sign out and ensure private URLs stop loading.
4. Reopen a notebook, save twice, test concurrent saves and a network failure. Confirm that the last valid content remains and previous generations are bounded.
5. Check desktop and iOS Service Worker installation, first visit, refresh, streaming, downloads and logout. API credentials and resumable-session URLs must not appear in logs.
6. Revoke/reconnect OAuth in a test setup and confirm that connection errors are visible and no successful upload is reported.

Automated local checks: `npm test` and `npm run build`. These are not substitutes for the deployed Google Drive acceptance checks.

References: [Drive resumable uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads), [Drive OAuth scopes](https://developers.google.com/workspace/drive/api/guides/api-specific-auth), [OAuth refresh token expiration](https://developers.google.com/identity/protocols/oauth2#expiration), [Drive quotas](https://developers.google.com/workspace/drive/api/guides/limits), [Vercel function limits](https://vercel.com/docs/functions/limitations).

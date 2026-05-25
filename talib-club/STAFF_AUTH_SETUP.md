# Staff Auth Setup

ระบบล็อกอินใช้ Firebase Authentication แบบ Email/Password หรือ Google และอ่านสิทธิ์จาก Firestore collection `users`

ตอนนี้โค้ดแยก Firebase เป็น 2 ชุด:

- Tracking ใช้โปรเจกต์เดิม `talib-trackingnumber`
- สมาชิก/สตาฟ ใช้ Firebase เว็บตัวใหม่ผ่านค่าใน `.env`

## เปิดระบบสมัคร/ล็อกอิน

1. ไปที่ Firebase Console แล้วสร้างโปรเจกต์ใหม่สำหรับเว็บ เช่น `talib-club-web`
2. เพิ่ม Web app ใน Project settings
3. คัดลอก Firebase config มาใส่ไฟล์ `.env` โดยดูชื่อตัวแปรจาก `.env.example`
4. เข้า Authentication
5. เปิด Sign-in method แบบ Email/Password
6. เปิด Sign-in method แบบ Google
7. ที่ Authentication > Settings > Authorized domains ให้มี `localhost` สำหรับทดสอบในเครื่อง และมีโดเมน deploy จริง เช่น `talib-club.vercel.app`

ตัวอย่าง `.env`

```txt
VITE_WEB_FIREBASE_API_KEY=...
VITE_WEB_FIREBASE_AUTH_DOMAIN=talib-club-web.firebaseapp.com
VITE_WEB_FIREBASE_PROJECT_ID=talib-club-web
VITE_WEB_FIREBASE_STORAGE_BUCKET=talib-club-web.appspot.com
VITE_WEB_FIREBASE_MESSAGING_SENDER_ID=...
VITE_WEB_FIREBASE_APP_ID=...
VITE_WEB_FIREBASE_MEASUREMENT_ID=...
```

## ทำให้บัญชีเป็นสตาฟ

หลังจากผู้ใช้สมัครสมาชิกครั้งแรก ระบบจะสร้างเอกสาร:

```txt
users/{uid}
```

ให้แก้ field:

```js
role: "staff"
```

บัญชีที่ไม่มี field นี้ หรือมีค่าอื่น จะเป็นสมาชิกทั่วไป (`member`)

## Firestore collections ที่ใช้เผยแพร่ข้อมูลจริง

หน้า Staff/Admin บันทึกข้อมูลขึ้น Firestore และหน้าเว็บหลักอ่านจาก collections เหล่านี้ทันที:

```txt
content_articles
content_books
content_media
content_scholars
content_settings/site
content_settings/taxonomy
```

ถ้า collection ยังว่าง ระบบจะแสดงข้อมูลตั้งต้นจากไฟล์ `src/data/*` ก่อน เพื่อให้เว็บไม่ว่างเปล่า

ตัวอย่าง security rules เริ่มต้น:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function signedIn() {
      return request.auth != null;
    }

    function isStaff() {
      return signedIn()
        && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "staff";
    }

    match /users/{userId} {
      allow read: if signedIn() && (request.auth.uid == userId || isStaff());
      allow create: if signedIn() && request.auth.uid == userId;
      allow update: if isStaff()
        || (signedIn()
          && request.auth.uid == userId
          && request.resource.data.role == resource.data.role);
      allow delete: if isStaff();
    }

    match /content_articles/{docId} {
      allow read: if true;
      allow write: if isStaff();
    }

    match /content_books/{docId} {
      allow read: if true;
      allow write: if isStaff();
    }

    match /content_media/{docId} {
      allow read: if true;
      allow write: if isStaff();
    }

    match /content_scholars/{docId} {
      allow read: if true;
      allow write: if isStaff();
    }

    match /content_settings/{docId} {
      allow read: if true;
      allow write: if isStaff();
    }
  }
}
```

## หมายเหตุ

หลังตั้ง rules แล้ว ให้ล็อกอินด้วยบัญชีที่มี `role: "staff"` จากนั้นเข้า Staff Workspace > จัดการเนื้อหา เพื่อเพิ่ม/แก้/ลบข้อมูลที่เผยแพร่บนเว็บจริง

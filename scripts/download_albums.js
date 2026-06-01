import fs from 'fs';
import https from 'https';

const albums = {
  '11.html': '1QwEHHHfA-xB43tJloUDeoTesZf8dmhvv', // บาปใหญ่
  '21.html': '17yyCJMB0UdtljVIYF8zziPLdLDBzHaZm', // อัตตัซกียะฮฺ
  '22.html': '1YMYoqPx4fUpfuHebDlSOxwvXEXx1ly_7', // เตาฮีด
  '18.html': '1K5KL5x-zjkJTTLe7Ul9_wOK3kJWfcjjG', // วารสารอัซซอลิฮีน
  '20.html': '1Kr64kGdtTZ77SDg1wtFL8DidWG5kHgPm', // หนังสือน่าอ่าน
};

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      // handle redirects
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        download(response.headers.location, dest).then(resolve).catch(reject);
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function run() {
  for (const [filename, id] of Object.entries(albums)) {
    const url = `https://drive.google.com/uc?export=download&id=${id}`;
    const dest = `C:\\Users\\HP\\Documents\\GitHub\\talib-club\\scripts\\${filename}`;
    console.log(`Downloading ${filename} from Google Drive...`);
    try {
      await download(url, dest);
      console.log(`Saved ${filename}`);
    } catch (err) {
      console.error(`Failed to download ${filename}:`, err);
    }
  }
}

run();

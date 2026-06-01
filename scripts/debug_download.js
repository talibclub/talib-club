import https from 'https';

const id = '1QwEHHHfA-xB43tJloUDeoTesZf8dmhvv'; // 11.html
const url = `https://drive.google.com/uc?export=download&id=${id}`;

https.get(url, (res) => {
  console.log('Status code:', res.statusCode);
  console.log('Headers:', res.headers);
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Body length:', body.length);
    console.log('First 500 chars of body:', body.slice(0, 500));
  });
});

const q = 'ดาว';
async function searchDDG(query) {
  try {
    const res = await fetch(`https://duckduckgo.com/?q=${encodeURIComponent(query)}&iax=images&ia=images`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    const vqdMatch = html.match(/vqd="([^"]+)"/);
    if (!vqdMatch) return console.log("No VQD token found");
    const vqd = vqdMatch[1];
    
    const imgRes = await fetch(`https://duckduckgo.com/i.js?l=us-en&o=json&q=${encodeURIComponent(query)}&vqd=${vqd}&f=,,,&p=1`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    const data = await imgRes.json();
    console.log(JSON.stringify(data.results[0], null, 2));
  } catch (e) {
    console.log("Error:", e);
  }
}
searchDDG(q);

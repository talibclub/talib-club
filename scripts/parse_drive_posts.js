import fs from 'fs';

const htmlPath = 'C:\\Users\\HP\\.gemini\\antigravity\\brain\\d8a0c82b-5177-46a1-940b-a31fcc62cb22\\.system_generated\\steps\\2919\\content.md';
const content = fs.readFileSync(htmlPath, 'utf8');

// Search for patterns like [[null,"ID"],null,null,null,"application/vnd.google-apps.folder",... "NAME"
// We can use a regex to extract file names and IDs in the JSON payload
const matches = [];
const regex = /\[\[null,"([a-zA-Z0-9_\-]+)"\],null,null,null,"([^"]+)",null,null,null,null,null,null,\d+,null,null,null,[\s\S]*?\[\[\["([^"]+)"/g;

let match;
while ((match = regex.exec(content)) !== null) {
  matches.push({
    id: match[1],
    mimeType: match[2],
    name: match[3]
  });
}

// Alternative simpler regex for names and IDs
const simpleRegex = /"([a-zA-Z0-9_\-]{15,})",\s*\[[^\]]*\],\s*"([^"]+\.(?:html|jpg|png|mp4|json|txt))"/g;
while ((match = simpleRegex.exec(content)) !== null) {
  matches.push({
    id: match[1],
    name: match[2]
  });
}

console.log("Found matches:", JSON.stringify(matches, null, 2));

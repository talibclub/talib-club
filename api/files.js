import storage from './_drive-storage.js';
import file from './_drive-file.js';
import legacyPdf from './_legacy-pdf.js';

// Consolidated endpoint keeps the deployment within the free host's function
// count; existing PDF links and the Drive backend share one serverless function.
export default function handler(req, res) {
  if (req.query?.mode === 'storage') return storage(req, res);
  if (req.query?.mode === 'legacy') return legacyPdf(req, res);
  return file(req, res);
}

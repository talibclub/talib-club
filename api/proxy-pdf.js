export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');

    if (!targetUrl) {
      return new Response('Missing url parameter', { status: 400 });
    }

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    // Attempt to download the PDF from the target URL
    let response = await fetch(targetUrl);

    // Bypass Google Drive Virus Scan Warning
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html') && targetUrl.includes('drive.google.com')) {
      const text = await response.text();
      const match = text.match(/confirm=([a-zA-Z0-9_-]+)/);
      if (match) {
        const confirmToken = match[1];
        const joinChar = targetUrl.includes('?') ? '&' : '?';
        const newUrl = targetUrl + joinChar + 'confirm=' + confirmToken;
        response = await fetch(newUrl);
      } else {
        return new Response('Failed to bypass Google Drive virus scan. No confirm token found.', {
          status: 500,
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
    }

    if (!response.ok) {
      return new Response(`Failed to fetch PDF: ${response.status} ${response.statusText}`, {
        status: response.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // Set CORS headers
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    headers.set('Access-Control-Allow-Headers', '*');
    headers.set('Content-Disposition', 'inline; filename="document.pdf"');

    // Remove headers that might cause issues with proxying
    headers.delete('Content-Encoding');
    headers.delete('Transfer-Encoding');

    // Return the response as a stream
    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new Response(`Error proxying PDF: ${error.message}`, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
}

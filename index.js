// Cloudflare Worker for Gitcoin Passport API proxy
export default {
  async fetch(request, env, ctx) {
    // Parse the URL and pathname
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    // Check for the format /api/gitcoin/{address}
    const pathSegments = pathname.split('/').filter(segment => segment);
    
    // Check if this is a Gitcoin request
    if (pathSegments[0] === 'api' && pathSegments[1] === 'gitcoin' && pathSegments[2]) {
      const address = pathSegments[2];
      
      // Validate Ethereum address
      if (!address || !address.startsWith('0x')) {
        return new Response(
          JSON.stringify({ error: 'Invalid Ethereum address' }), 
          { 
            status: 400,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type',
            }
          }
        );
      }

      // Handle CORS preflight request
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }
      
      // Get API key from environment variable
      const apiKey = env.GITCOIN_API_KEY;
      if (!apiKey) {
        return new Response(
          JSON.stringify({ error: 'API key not configured' }), 
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-store',
            }
          }
        );
      }
      
      try {
        // Make request to Gitcoin Passport API
        const response = await fetch(`https://api.passport.xyz/v2/stamps/10862/score/${address}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'X-API-KEY': apiKey
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          return new Response(
            JSON.stringify({ 
              error: `API error: ${response.status}`,
              message: errorText
            }), 
            { 
              status: response.status,
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store',
              }
            }
          );
        }
        
        const data = await response.json();
        
        // Return the data with CORS headers and caching
        return new Response(
          JSON.stringify(data), 
          { 
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'public, max-age=600', // Cache for 10 minutes
              'CDN-Cache-Control': 'public, max-age=600',
              'Cloudflare-CDN-Cache-Control': 'public, max-age=600',
            }
          }
        );
      } catch (error) {
        // Return an error response
        return new Response(
          JSON.stringify({ error: error.message || 'Internal server error' }), 
          { 
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Cache-Control': 'no-store',
            }
          }
        );
      }
    }
    
    // Return a landing page for the root URL
    if (pathname === '/' || pathname === '') {
      return new Response(
        `<!DOCTYPE html>
        <html>
          <head>
            <title>Gitcoin Passport API Proxy</title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
              }
              h1 { color: #553c9a; }
              code {
                background-color: #f5f5f5;
                padding: 2px 5px;
                border-radius: 3px;
                font-family: monospace;
              }
              .container {
                background-color: white;
                border-radius: 8px;
                padding: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Gitcoin Passport API Proxy</h1>
              <p>This is a Cloudflare Worker that proxies requests to the Gitcoin Passport API.</p>
              <p>To use this API, make a GET request to:</p>
              <code>/api/gitcoin/0xYOUR_ADDRESS</code>
              <p>Example: <code>/api/gitcoin/0x1234567890abcdef1234567890abcdef12345678</code></p>
              <p>Developed for WalletsX - <a href="https://cryptowalletsx.com">cryptowalletsx.com</a></p>
            </div>
          </body>
        </html>`,
        {
          headers: {
            'Content-Type': 'text/html',
            'Cache-Control': 'public, max-age=3600',
          }
        }
      );
    }
    
    // If not a Gitcoin request, return a 404
    return new Response(
      JSON.stringify({ error: 'Not found' }), 
      { 
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store',
        }
      }
    );
  }
}; 
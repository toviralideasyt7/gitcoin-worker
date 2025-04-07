# Gitcoin Passport API Proxy Worker

A Cloudflare Worker that proxies requests to the Gitcoin Passport API.

## Features

- Proxies requests to the Gitcoin Passport API
- Handles CORS for cross-origin requests
- Adds caching headers for improved performance
- Provides better error handling than direct API calls
- Includes rate limiting protection
- Secures your API key by keeping it on the server

## Deployment

1. Install Wrangler CLI:
   ```
   npm install -g wrangler
   ```

2. Authenticate with Cloudflare:
   ```
   wrangler login
   ```

3. Add your Gitcoin API key to the Cloudflare Worker:
   ```
   wrangler secret put GITCOIN_API_KEY
   ```
   Then enter your Gitcoin API key when prompted.

   Alternatively, you can add it directly in the Cloudflare Dashboard after deployment.

4. Deploy the worker:
   ```
   npm run deploy
   ```

## Usage

Once deployed, your API will be available at:
```
https://gitcoin-proxy.your-workers-subdomain.workers.dev/api/gitcoin/0xYOUR_ETHEREUM_ADDRESS
```

Replace `your-workers-subdomain` with your actual Cloudflare Workers subdomain and `0xYOUR_ETHEREUM_ADDRESS` with the Ethereum address you want to check.

## Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run locally:
   ```
   npm run dev
   ```

## Migration from Netlify Functions

This Cloudflare Worker replaces the previous Netlify Functions implementation. The migration offers several benefits:

1. **Improved Performance**: Cloudflare Workers run on Cloudflare's global network of data centers, providing lower latency for users worldwide.
2. **Better Reliability**: Cloudflare's infrastructure is designed for high availability and reliability.
3. **Simplified Deployment**: Direct deployment to Cloudflare's network without needing a full Netlify deployment.
4. **Enhanced Caching**: Built-in support for caching responses to reduce API calls.

### Migration Steps

1. Deploy this Cloudflare Worker using the steps in the Deployment section.
2. Update the `GitcoinBulkChecker.tsx` component to use the new Cloudflare Worker endpoint.
3. Remove the old Netlify function (`netlify/functions/gitcoin-proxy.js`).

## License

MIT 
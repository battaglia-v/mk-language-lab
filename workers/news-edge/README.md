# News Edge Worker

Cloudflare Worker that serves the news feed API and image proxy to reduce Vercel CPU usage.

## Endpoints
- `GET /` or `GET /news` or `GET /api/news`: RSS aggregation + enrichment, JSON response.
- `GET /image?src=<url>` or `GET /api/news/image?src=<url>`: image proxy with caching + SSRF guardrails.

## Deploy
```bash
cd workers/news-edge
npx wrangler login
npx wrangler deploy
```

## Configure
Set variables in Cloudflare (or update `wrangler.toml`):
- `ALLOWED_ORIGIN` (optional): restrict CORS, defaults to `*`
- `NEWS_CACHE_TTL` (seconds, default `180`)
- `IMAGE_CACHE_TTL` (seconds, default `86400`)
- `NEWS_FETCH_TIMEOUT_MS` (default `15000`)
- `PREVIEW_FETCH_LIMIT` (default `24`)

## Wire Into the App
Set these Vercel environment variables:
```
NEWS_API_URL=https://<worker-domain>
NEXT_PUBLIC_NEWS_API_URL=https://<worker-domain>
NEXT_PUBLIC_NEWS_IMAGE_PROXY_URL=https://<worker-domain>/api/news/image
```

Optional (only used if the Next.js API route is still enabled):
```
NEWS_IMAGE_PROXY_URL=https://<worker-domain>/api/news/image
```

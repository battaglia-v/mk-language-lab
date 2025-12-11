# Instagram Integration for Daily Lessons

## Instagram API Options Research

### 1. Instagram Basic Display API ❌
- **Pros:** Official API, legitimate access to own account
- **Cons:**
  - Being deprecated by Meta
  - Complex OAuth setup required
  - Requires Facebook App creation
  - Limited to 200 requests/hour
  - Not recommended for new projects

### 2. Instagram Graph API ✅ **RECOMMENDED**
- **Pros:**
  - Official API from Meta
  - Reliable and maintained
  - Good for Business/Creator accounts
  - Reasonable rate limits (200 calls/hour)
  - Long-lived access tokens (60 days, refreshable)
  - Rich media data
- **Cons:**
  - Requires Instagram Business/Creator account
  - One-time Facebook App setup
  - Need to link Instagram to Facebook Page
  - Requires generating access token

### 3. Web Scraping ❌
- **Pros:** No API setup needed, free
- **Cons:**
  - Violates Instagram Terms of Service
  - Unreliable (breaks when HTML changes)
  - Risk of IP blocking
  - Not production-ready
  - **NOT RECOMMENDED**

### 4. Instagram oEmbed API ⚠️
- **Pros:** Simple, no auth, free, official
- **Cons:**
  - Only works with individual post URLs
  - Can't fetch list of recent posts
  - Limited data
  - Would require manual post URL management

### 5. Third-party Services (Juicer, SnapWidget, etc.) ⚠️
- **Pros:** Easy setup, no maintenance
- **Cons:** Usually paid, external dependency, limited control

---

## Chosen Approach: Instagram Graph API

### Why This Approach?
1. **Official and Reliable:** Supported by Meta, won't break unexpectedly
2. **Good Rate Limits:** 200 calls/hour is plenty for this use case
3. **Long-lived Tokens:** 60-day tokens that can be auto-refreshed
4. **Rich Data:** Access to captions, images, videos, timestamps
5. **Production Ready:** Used by thousands of businesses
6. **Server-side Caching:** We cache responses to minimize API calls

---

## Setup Instructions

### Prerequisites
1. **Instagram Business or Creator Account**
   - The account must be a Business or Creator account (not personal)
   - Convert at: Instagram Settings → Account → Switch to Professional Account

2. **Facebook Page**
   - Create a Facebook Page
   - Link Instagram account to the Facebook Page
   - Go to Facebook Page Settings → Instagram → Connect Account

3. **Facebook App**
   - Go to https://developers.facebook.com/
   - Create a new app (choose "Business" type)
   - Add the "Instagram Graph API" product

### Getting Your Access Token

#### Step 1: Get Short-lived Token
1. Go to Facebook Graph API Explorer: https://developers.facebook.com/tools/explorer/
2. Select your app
3. Add these permissions:
   - `instagram_basic`
   - `pages_show_list`
   - `pages_read_engagement`
4. Click "Generate Access Token"
5. Copy the token (this is a short-lived user access token)

#### Step 2: Get Long-lived Token
Replace `{short-lived-token}`, `{app-id}`, and `{app-secret}`:

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-token}"
```

This returns a long-lived token (60 days).

#### Step 3: Get Instagram Business Account ID
Replace `{long-lived-token}`:

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/me/accounts?access_token={long-lived-token}"
```

Find your page's `id`, then get the Instagram account ID:

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/{page-id}?fields=instagram_business_account&access_token={long-lived-token}"
```

Copy the `instagram_business_account.id`.

#### Step 4: Add to Environment Variables
Add to your `.env.local`:

```env
# Instagram Integration
INSTAGRAM_ACCESS_TOKEN=your-long-lived-token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your-instagram-business-account-id
```

### Token Refresh
Long-lived tokens expire after 60 days but can be refreshed. The API will automatically refresh if the token is older than 30 days:

```bash
curl -i -X GET "https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={current-long-lived-token}"
```

Consider setting up a monthly cron job to refresh the token.

---

## Implementation Details

### API Route: `/api/instagram/posts`
- **Method:** GET
- **Query Parameters:**
  - `limit` (optional): Number of posts to return (default: 10, max: 25)
- **Caching:**
  - Server-side in-memory cache
  - Cache TTL: 30 minutes (configurable)
  - Reduces API calls and improves performance
- **Error Handling:**
  - Graceful degradation if API fails
  - Returns empty array with error message
  - Mock data available for development

### Response Format
```json
{
  "items": [
    {
      "id": "instagram-post-id",
      "caption": "Post caption text",
      "media_type": "IMAGE | VIDEO | CAROUSEL_ALBUM",
      "media_url": "https://...",
      "permalink": "https://instagram.com/p/...",
      "timestamp": "2025-01-15T10:30:00+0000",
      "thumbnail_url": "https://..." // for videos
    }
  ],
  "meta": {
    "count": 10,
    "fetchedAt": "2025-01-15T10:35:00.000Z",
    "cached": false,
    "source": "instagram-graph-api"
  }
}
```

### Component: `DailyLessons`
- Displays recent Instagram posts in a responsive grid
- Shows post image, caption (truncated), and date
- Links to actual Instagram post
- Loading and error states
- Responsive: 1 column mobile, 2 tablet, 3 desktop

---

## Rate Limits & Caching Strategy

### Instagram Graph API Limits
- **Rate Limit:** 200 calls per hour per user
- **With our caching (30 min TTL):** Maximum ~2 calls per hour
- **Daily API calls:** ~48 calls per day (well under limit)

### Caching Strategy
1. **Server-side in-memory cache**
   - Stores responses for 30 minutes
   - Reduces API calls by 98%
   - Automatic cache invalidation

2. **Future Enhancement: Vercel KV**
   - For production, consider Vercel KV for persistent cache
   - Shared across serverless function instances
   - Better performance at scale

---

## Fallback Behavior

If the API fails:
1. Returns cached data (if available)
2. Returns empty array with error message
3. Component shows friendly error message
4. User experience is not broken

---

## Development Mode

For local development without API credentials:
1. Set `INSTAGRAM_ACCESS_TOKEN=demo` in `.env.local`
2. API returns mock data
3. Allows testing UI without Instagram setup

---

## Limitations & Trade-offs

### Limitations
1. **Account Type Required:** Must be Business/Creator account
2. **Setup Complexity:** Initial Facebook App setup required (30-60 min)
3. **Token Expiry:** Tokens expire every 60 days (can be auto-refreshed)
4. **Rate Limits:** 200 calls/hour (mitigated by caching)
5. **Public Posts Only:** Only returns public posts

### Trade-offs
- **Complexity vs Reliability:** More setup required, but officially supported
- **Setup Time vs Maintenance:** 1-hour setup, minimal ongoing maintenance
- **Rate Limits vs Freshness:** 30-min cache means posts may be delayed

### What We Get
- ✅ Official, reliable API
- ✅ High-quality images and data
- ✅ Won't break unexpectedly
- ✅ Production-ready
- ✅ No scraping violations
- ✅ Automatic caching

---

## Maintenance

### Regular Tasks
1. **Token Refresh (every 60 days):**
   - Set calendar reminder
   - Run token exchange API call
   - Update `.env.local` on Vercel

2. **Monitor API Usage:**
   - Check API error logs
   - Verify cache is working
   - Review rate limit headers

### Potential Issues
- **Token Expired:** Error message in logs, empty posts returned
- **Account Changed:** Re-link Instagram to Facebook Page
- **API Changes:** Meta occasionally updates API versions

---

## Alternative: Instagram Widget Embed

If the Graph API setup is too complex, consider Instagram's official widget:

```html
<!-- Instagram Feed Widget -->
<script src="https://cdn.lightwidget.com/widgets/lightwidget.js"></script>
<iframe src="//lightwidget.com/widgets/your-widget-id.html"></iframe>
```

**Pros:** No API setup, visual widget
**Cons:** External dependency, less customization, usually paid

---

## Cost Analysis

- **Instagram Graph API:** FREE
- **Facebook App:** FREE
- **Hosting (Vercel):** FREE tier is sufficient
- **Alternative (Third-party widgets):** $6-20/month

**Total Cost: $0**

---

## Next Steps

1. ✅ Convert Instagram account to Business/Creator
2. ✅ Create/link Facebook Page
3. ✅ Create Facebook App
4. ✅ Generate access tokens
5. ✅ Add tokens to `.env.local`
6. ✅ Test API endpoint
7. ✅ Deploy to Vercel
8. ✅ Add token refresh reminder to calendar

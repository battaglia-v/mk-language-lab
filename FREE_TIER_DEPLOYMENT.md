# 100% Free MVP Deployment Guide

## Summary: Zero Cost Full-Feature Setup

✅ **Total Monthly Cost: $0** (with usage limits)
🎯 **Good for:** 100-500 users/month, light API usage

---

## Free Tier Breakdown

### 1. **Vercel** (Hosting) - FREE ✅
**What you get:**
- Unlimited deployments
- 100GB bandwidth/month
- 100 serverless function executions/day
- Custom domain support
- SSL certificates
- Analytics

**Limits:**
- No credit card required
- Perfect for MVP with <1000 users

**Cost:** $0/month

---

### 2. **Neon** (PostgreSQL Database) - FREE ✅
**What you get:**
- 512MB storage
- 1 database
- 10GB data transfer/month
- No credit card required

**Limits:**
- Database sleeps after 5 minutes of inactivity (wakes instantly on query)
- Perfect for MVP

**Cost:** $0/month

**Alternative:** Vercel Postgres (256MB, less generous but also free)

---

### 3. **Google Cloud Translation API** - FREE ✅ (with limits)
**What you get:**
- $10/month credit = ~500,000 characters
- That's ~250-500 translations/day
- No credit card required for first $300 trial credit

**Limits:**
- After $10/month free credit, costs $20 per 1M characters
- For MVP: 10-50 translations/day = ~10,000 chars/day = 300,000/month
- **You'll stay in free tier easily**

**Cost:** $0/month for MVP usage

---

### 4. **OpenAI API** (AI Tutor) - ⚠️ PAID (but cheapest option)
**What you get:**
- GPT-4o-mini: $0.150 per 1M input tokens
- $5 free credit on new accounts

**Estimated MVP costs:**
- 10 tutor conversations/day
- ~500 tokens per conversation
- 5,000 tokens/day = 150,000/month
- **Cost: ~$0.02/month** (less than 3 cents!)

**Without free credit:**
- First month: FREE ($5 credit covers ~33M tokens)
- Ongoing: <$1/month for light usage

**Cost:** $0-1/month

**Alternative:** Keep mock mode for AI tutor (fully free)

---

## Recommended 100% Free Setup

### Configuration
```
DATABASE_URL=postgresql://... (from Neon)
GOOGLE_PROJECT_ID=your-project-id (from GCP free tier)
GOOGLE_APPLICATION_CREDENTIALS_JSON={...} (from GCP)
GOOGLE_DOCS_ID=1_9n8FTXTjE15jJiwvhc0nSLM3odY6CanV97t2VW7Zpw
DICTIONARY_PDF_URL=https://ofs-cdn.italki.com/u/11847001/message/d30vg2pjlt9bmtu5ki9g.pdf
```

**Skip for now (optional):**
- `OPENAI_API_KEY` - Use mock tutor mode (100% free)
- Or add it later with $5 free credit

### What Works:
- ✅ Full translation feature (real API, not mock!)
- ✅ Full database with user progress
- ✅ News feed
- ✅ Practice exercises
- ✅ All navigation and UI
- ⚠️ AI Tutor (mock mode OR pay <$1/month)

---

## Step-by-Step: Free Tier Setup

### 1. Create Neon Database (5 minutes)

```bash
# Visit https://neon.tech
# 1. Sign up with GitHub (no credit card!)
# 2. Create new project: "mk-language-lab"
# 3. Copy the connection string (looks like):
#    postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb
```

**Save this connection string** - you'll add it to Vercel as `DATABASE_URL`

---

### 2. Set Up Google Cloud Translation (15 minutes)

#### A. Create Project
1. Go to https://console.cloud.google.com
2. Sign in with Google account
3. Create new project: "mk-language-lab"
4. **No billing account needed initially** - you get $300 free trial credit

#### B. Enable Translation API
1. Search for "Cloud Translation API"
2. Click "Enable"

#### C. Create Service Account
1. Go to "IAM & Admin" → "Service Accounts"
2. Click "Create Service Account"
3. Name: "mk-translator"
4. Click "Create and Continue"
5. Select role: "Cloud Translation API User"
6. Click "Done"

#### D. Create JSON Key
1. Click on the service account you just created
2. Go to "Keys" tab
3. Click "Add Key" → "Create new key"
4. Choose JSON format
5. Download file (keep it safe!)

#### E. Prepare for Vercel
```bash
# Open the downloaded JSON file
# Copy the entire contents
# You'll paste this into Vercel as: GOOGLE_APPLICATION_CREDENTIALS_JSON
```

**Also note your Project ID** (found in GCP dashboard) - add as `GOOGLE_PROJECT_ID`

---

### 3. Deploy to Vercel (5 minutes)

#### Option A: Via Dashboard (Easiest)

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import `battaglia-v/mk-language-lab`
5. Add environment variables:
   ```
   DATABASE_URL=postgresql://... (from Neon)
   GOOGLE_PROJECT_ID=your-project-id
   GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account"...}
   GOOGLE_DOCS_ID=1_9n8FTXTjE15jJiwvhc0nSLM3odY6CanV97t2VW7Zpw
   DICTIONARY_PDF_URL=https://ofs-cdn.italki.com/u/11847001/message/d30vg2pjlt9bmtu5ki9g.pdf
   ```
6. Click "Deploy"

#### Option B: Via CLI

```bash
cd /Users/vbattaglia/macedonian-learning-app
vercel

# During setup:
# - Link to existing project? No
# - Project name? mk-language-lab
# - Directory? ./ (press enter)
# - Override settings? No

# After first deploy, add env vars:
vercel env add DATABASE_URL
# Paste Neon connection string

vercel env add GOOGLE_PROJECT_ID
# Paste GCP project ID

vercel env add GOOGLE_APPLICATION_CREDENTIALS_JSON
# Paste entire service account JSON

# Deploy to production
vercel --prod
```

---

### 4. Run Database Migration (2 minutes)

After deploying, initialize your production database:

```bash
# Pull production environment variables locally
vercel env pull .env.production

# Run Prisma migrations against production DB
DATABASE_URL="$(grep DATABASE_URL .env.production | cut -d '=' -f2-)" npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

---

## Usage Monitoring (Stay in Free Tier)

### Neon Database
Check usage: https://console.neon.tech/app/projects
- Watch storage (512MB limit)
- For MVP: You'll use <50MB

### Google Cloud Translation
Check usage: https://console.cloud.google.com/apis/dashboard
- Watch character usage
- Alert threshold: 400,000 chars/month (80% of free tier)

### Vercel
Check usage: https://vercel.com/dashboard/usage
- Bandwidth: 100GB/month (very generous)
- Function executions: 100/day on free tier

---

## Cost Projections

### Scenario 1: MVP Testing (You + 5 family members)
- **Users:** 6
- **Daily translations:** 20
- **Monthly translations:** 600 (~30,000 chars)
- **Database size:** <10MB
- **Bandwidth:** <1GB

**Total Cost: $0/month** ✅

### Scenario 2: Small Beta (50 active users)
- **Users:** 50
- **Daily translations:** 100
- **Monthly translations:** 3,000 (~150,000 chars)
- **Database size:** ~50MB
- **Bandwidth:** ~10GB

**Total Cost: $0/month** ✅

### Scenario 3: When You Outgrow Free Tier (~500 users)
- **Users:** 500
- **Translations exceed free tier**
- **Database approaches 512MB**

**Upgrade costs:**
- Neon: $19/month (3GB storage, no sleep)
- Google Cloud Translation: ~$5-10/month overage
- Vercel: Still free (or $20/month for Pro features)

**Total: ~$25-50/month** (when you have 500 active users - good problem!)

---

## Adding OpenAI Later (Optional)

If you want the real AI tutor:

### Free Credit Method
1. Create OpenAI account: https://platform.openai.com
2. New accounts get $5 free credit
3. Add API key to Vercel: `OPENAI_API_KEY=sk-...`

**$5 lasts:** ~2-3 months of light MVP usage

### Paid Method (Post-MVP)
- Add payment method to OpenAI
- Costs ~$0.50-2/month for <100 users
- Set usage limit: $5/month (safety)

---

## Summary: Your Free MVP Stack

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| Vercel | 100GB bandwidth | <5GB | $0 |
| Neon DB | 512MB storage | <50MB | $0 |
| Google Translate | $10 credit/month | ~$2-3/month | $0 |
| OpenAI (optional) | $5 one-time | Skip or use credit | $0 |
| **Total** | | | **$0/month** |

---

## Quick Start (Copy-Paste Guide)

### If you want to deploy RIGHT NOW with 100% free setup:

1. **Get Neon DB** (2 min):
   - https://neon.tech → Sign up → Copy connection string

2. **Get Google Cloud** (15 min):
   - https://console.cloud.google.com → Create project
   - Enable Translation API → Create service account
   - Download JSON key

3. **Deploy**:
   - Go to https://vercel.com/new
   - Import `battaglia-v/mk-language-lab`
   - Add 5 environment variables (see above)
   - Click Deploy

4. **Done!** 🎉

**Your app is live with real translations and database, zero cost.**

---

## Alternative: Super Fast Mock Deploy (1 minute)

If you want to see it live IMMEDIATELY without any setup:

```bash
cd /Users/vbattaglia/macedonian-learning-app
vercel

# Accept all defaults
# Skip env variables for now
```

**What you get:**
- Live URL in 60 seconds
- All UI/UX works
- Mock translations/tutor
- Add real APIs later in 5 minutes via dashboard

---

**Which path do you prefer?**
1. Full free setup with real APIs (~20 min total)
2. Quick mock deploy now, add APIs later (1 min + 5 min later)

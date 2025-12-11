# Vercel Deployment Checklist

## Current Status
✅ Vercel CLI installed
✅ Code pushed to GitHub
⚠️ Environment variables need setup for full functionality

---

## Environment Variables Setup

Your app currently has minimal env vars configured. Here's what each does and whether it's required:

### Required (App works without, but limited features)

#### 1. **DATABASE_URL** (Currently: SQLite)
- **Current:** `file:./dev.db` (SQLite - dev only)
- **For Production:** You'll need PostgreSQL
- **Setup Options:**
  - **Vercel Postgres** (Recommended): Free tier, auto-provision in Vercel dashboard
  - **Neon**: https://neon.tech (generous free tier)
  - **Supabase**: https://supabase.com (includes auth + database)

#### 2. **GOOGLE_PROJECT_ID** + **GOOGLE_APPLICATION_CREDENTIALS_JSON** (Translation API)
- **What it does:** Powers the /translate page (Macedonian ↔ English)
- **Without it:** App shows mock/fallback translations
- **How to set up:**
  1. Go to https://console.cloud.google.com
  2. Create a new project (or use existing)
  3. Enable "Cloud Translation API"
  4. Create a service account:
     - IAM & Admin → Service Accounts → Create Service Account
     - Grant role: "Cloud Translation API User"
  5. Download JSON key
  6. For Vercel:
     - `GOOGLE_PROJECT_ID`: Your project ID (e.g., "mk-language-lab-12345")
     - `GOOGLE_APPLICATION_CREDENTIALS_JSON`: Paste entire JSON content OR base64 encode it

#### 3. **OPENAI_API_KEY** (AI Tutor)
- **What it does:** Powers the /tutor page (GPT-4 conversation practice)
- **Without it:** App shows mock tutor responses
- **How to set up:**
  1. Go to https://platform.openai.com/api-keys
  2. Create new secret key
  3. Copy key starting with `sk-...`
  4. Add to Vercel: `OPENAI_API_KEY=sk-...`

### Optional (Already configured)

#### 4. **GOOGLE_DOCS_ID** ✅
- Current: `1_9n8FTXTjE15jJiwvhc0nSLM3odY6CanV97t2VW7Zpw`
- For resources/content management

#### 5. **DICTIONARY_PDF_URL** ✅
- Current: `https://ofs-cdn.italki.com/u/11847001/message/d30vg2pjlt9bmtu5ki9g.pdf`
- For PDF dictionary resource

---

## Deployment Options

### Option A: Deploy with Mock Mode (Fastest)
**Best for:** Quick preview, testing UI/UX, family to see progress

**Steps:**
```bash
cd /Users/vbattaglia/macedonian-learning-app
vercel
# Follow prompts:
# - Link to existing project? No
# - Project name: mk-language-lab
# - Directory: ./ (press enter)
# - Override settings? No
```

**What works:**
- ✅ All pages load
- ✅ Navigation
- ✅ UI/design
- ✅ Practice exercises
- ✅ News feed
- ⚠️ Translation shows mock responses
- ⚠️ Tutor shows mock responses
- ⚠️ SQLite database (resets on deploy)

### Option B: Deploy with Full Features (Recommended)
**Best for:** Production use, real learners

**Steps:**

1. **Set up PostgreSQL** (Choose one):

   **Via Vercel Dashboard** (Easiest):
   - Go to https://vercel.com/dashboard
   - Click your project → Storage → Create Database
   - Choose Postgres → Continue
   - Vercel automatically sets `DATABASE_URL`

   **Via Neon** (More control):
   - Go to https://neon.tech
   - Create project → Copy connection string
   - Add to Vercel as `DATABASE_URL`

2. **Set up Google Cloud Translation** (Optional but recommended):
   - Follow steps in section 2 above
   - Add `GOOGLE_PROJECT_ID` and `GOOGLE_APPLICATION_CREDENTIALS_JSON` to Vercel

3. **Set up OpenAI API** (Optional but recommended):
   - Follow steps in section 3 above
   - Add `OPENAI_API_KEY` to Vercel

4. **Deploy:**
   ```bash
   cd /Users/vbattaglia/macedonian-learning-app
   vercel --prod
   ```

---

## Step-by-Step: Vercel Dashboard Deployment

### 1. Go to Vercel
Open https://vercel.com and sign in with GitHub

### 2. Import Repository
- Click "Add New Project"
- Find `battaglia-v/mk-language-lab`
- Click "Import"

### 3. Configure Project
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)

### 4. Add Environment Variables

Click "Environment Variables" and add:

**Minimal (Mock Mode):**
```
DATABASE_URL=file:./dev.db
GOOGLE_DOCS_ID=1_9n8FTXTjE15jJiwvhc0nSLM3odY6CanV97t2VW7Zpw
DICTIONARY_PDF_URL=https://ofs-cdn.italki.com/u/11847001/message/d30vg2pjlt9bmtu5ki9g.pdf
```

**Full Features (Add these too):**
```
GOOGLE_PROJECT_ID=your-project-id
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account"...}
OPENAI_API_KEY=sk-...
```

### 5. Deploy
Click "Deploy" and wait 2-3 minutes

### 6. Test Deployment
- Visit the deployment URL (e.g., `mk-language-lab.vercel.app`)
- Test:
  - ✅ Homepage loads
  - ✅ Journey page works
  - ✅ Translate page (check if real or mock)
  - ✅ Tutor page (check if real or mock)
  - ✅ News page works
  - ✅ Practice page works

---

## After First Deploy

### Set Up Production Database
If you used SQLite for initial deploy:

1. **Add Vercel Postgres:**
   - Project dashboard → Storage → Create Database
   - Choose Postgres → Auto-provisions `DATABASE_URL`

2. **Run Migrations:**
   ```bash
   # Pull production env vars locally
   vercel env pull .env.production

   # Run migrations against production DB
   npx prisma migrate deploy
   ```

### Enable Analytics
Already configured! Check:
- https://vercel.com/[username]/mk-language-lab/analytics

### Set Up Custom Domain (Optional)
- Project Settings → Domains
- Add: `mklab.yourdomain.com`

---

## Troubleshooting

### Build fails with "DATABASE_URL not found"
Add `DATABASE_URL=file:./dev.db` to environment variables

### Translation API returns errors
Check that:
1. `GOOGLE_PROJECT_ID` matches your GCP project
2. Cloud Translation API is enabled in GCP console
3. Service account has "Cloud Translation API User" role

### Tutor returns "Mock mode" messages
Add `OPENAI_API_KEY` to environment variables

### "Middleware error" on deploy
Ensure `.env.local` is in `.gitignore` (it is) and env vars are in Vercel dashboard

---

## Quick Decision Guide

**"I just want to see it live and show family"**
→ Use Option A (Mock Mode) - 5 minutes

**"I want real translations and AI tutor"**
→ Set up Google Cloud + OpenAI first (30-60 min), then deploy

**"I need to scale this for real users"**
→ Full setup with Postgres, monitoring, and all APIs (2-3 hours)

---

## Next Steps After Deployment

1. ✅ Share preview URL with family for feedback
2. ⏳ Expand vocabulary content (current: 66 phrases, goal: 300+)
3. ⏳ Add authentication (NextAuth.js or Clerk)
4. ⏳ Set up error tracking (Sentry)
5. ⏳ Add rate limiting for APIs (Upstash Redis)
6. ⏳ Progressive Web App setup for mobile

---

**Need help?** Open an issue on GitHub or check the [Vercel docs](https://vercel.com/docs)

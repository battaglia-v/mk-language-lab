# Authentication Setup Guide

## Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Consumer"** as the app type
4. Fill in the details:
   - **App Name**: Macedonian Learning App
   - **App Contact Email**: Your email
   - **Business Account**: (Optional)
5. Click **"Create App"**

### Step 2: Configure Facebook Login

1. In your app dashboard, click **"Add Product"**
2. Find **"Facebook Login"** and click **"Set Up"**
3. Select **"Web"** as the platform
4. Enter your site URL:
   - Development: `http://localhost:3000`
   - Production: `https://mk-language.vercel.app`
5. Click **"Save"** and **"Continue"**

### Step 3: Configure OAuth Redirect URIs

1. Go to **"Facebook Login"** → **"Settings"**
2. Add these **Valid OAuth Redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/facebook
   https://mk-language.vercel.app/api/auth/callback/facebook
   ```
3. Click **"Save Changes"**

### Step 4: Get Your Credentials

1. Go to **"Settings"** → **"Basic"**
2. Copy your **App ID** (this is your `FACEBOOK_CLIENT_ID`)
3. Click **"Show"** next to **App Secret** and copy it (this is your `FACEBOOK_CLIENT_SECRET`)

### Step 5: Add Environment Variables

**Local Development** (`.env.local`):
```bash
# Facebook OAuth
FACEBOOK_CLIENT_ID=your-facebook-app-id-here
FACEBOOK_CLIENT_SECRET=your-facebook-app-secret-here
```

**Production (Vercel)**:
```bash
vercel env add FACEBOOK_CLIENT_ID
# Paste your App ID when prompted

vercel env add FACEBOOK_CLIENT_SECRET
# Paste your App Secret when prompted
```

Or add via Vercel Dashboard:
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - `FACEBOOK_CLIENT_ID` = your App ID
   - `FACEBOOK_CLIENT_SECRET` = your App Secret
5. Select **Production**, **Preview**, and **Development**
6. Click **"Save"**

### Step 6: Make Your App Public (Important!)

Your app starts in **Development Mode** - only you can sign in!

**To allow all users to sign in:**
1. Go to app dashboard
2. Click **"App Mode"** toggle at the top
3. Switch from **"Development"** to **"Live"**
4. You may need to:
   - Add a **Privacy Policy URL** (can add one to your site later)
   - Complete **App Review** (usually automatic for basic features)

### Step 7: Test the Integration

1. Restart your dev server: `npm run dev`
2. Go to your sign-in page
3. You should now see both **"Sign in with Google"** and **"Sign in with Facebook"** buttons
4. Try signing in with Facebook!

---

## Email/Password Authentication

Email/password authentication is now available as a universal fallback option!

### How It Works

1. **Registration**: Users create an account with email and password
2. **Password Security**: Passwords are hashed using bcryptjs with 12 salt rounds
3. **Sign-In**: Users authenticate with their email and password

### Registration Endpoint

**POST `/api/auth/register`**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Requirements:**
- Name: minimum 2 characters
- Email: valid email format
- Password: minimum 8 characters

**Response (Success):**
```json
{
  "success": true,
  "user": {
    "id": "user-id",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### Integration

Email/password authentication is automatically available through NextAuth:
- No environment variables needed
- Works out of the box
- NextAuth handles the sign-in UI

### Security Features

- Passwords hashed with bcryptjs (12 salt rounds)
- Email uniqueness enforced at database level
- Auto email verification (can be enhanced later)
- Input validation using Zod

### Future Enhancements

The following features can be added in future phases:
- Email verification flow (Resend or SendGrid)
- Password reset functionality
- Two-factor authentication
- Password strength requirements

---

## Troubleshooting

### "URL Blocked: This redirect failed because..."
- Make sure you added the correct OAuth redirect URI in Facebook app settings
- Check that it matches exactly: `https://your-domain.com/api/auth/callback/facebook`

### "App Not Setup: This app is still in development mode..."
- Your app is in Development Mode
- Switch to "Live" mode in the app dashboard
- Or add test users in **Roles** → **Test Users**

### "Invalid Client Secret"
- Double-check your `FACEBOOK_CLIENT_SECRET` in environment variables
- Make sure there are no extra spaces or quotes
- Try regenerating the secret in Facebook app settings

### Users Can't Sign In (Only You Can)
- Your app is in Development Mode
- Switch to **Live Mode** in Facebook app settings
- Or add them as **Test Users** in your app

---

## Security Best Practices

1. **Never commit** `.env.local` to Git
2. **Rotate secrets** periodically in production
3. **Use environment-specific** credentials (dev vs. prod)
4. **Enable App Review** when ready for public launch
5. **Monitor usage** in Facebook Analytics dashboard

---

## Current Auth Stack

✅ **Google OAuth** - Working
✅ **Facebook OAuth** - Working
✅ **Email/Password** - Working (just added!)
⏳ **Apple Sign-In** - Future (for iOS App Store)

---

## Need Help?

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/web)
- [NextAuth.js Facebook Provider Docs](https://authjs.dev/getting-started/providers/facebook)
- [NextAuth.js v5 Upgrade Guide](https://authjs.dev/guides/upgrade-to-v5)

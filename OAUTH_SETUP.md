# Google Workspace OAuth Setup Guide for SAGE

This guide will help you set up Google Workspace OAuth authentication for SAGE, allowing your colleagues to sign in with their Google Workspace accounts instead of manually entering API keys.

## 🎯 Overview

**Benefits:**
- ✅ No need to share API keys with colleagues
- ✅ Colleagues just click "Sign in with Google"
- ✅ Domain-restricted to your Google Workspace only
- ✅ Centralized API usage and cost management
- ✅ 100% free (Cloudflare free tier)
- ✅ Easy rollback to current setup

**Cost:** $0/month (Cloudflare Workers free tier: 100,000 requests/day)

## 📋 Prerequisites

1. Google Workspace admin access (to set up OAuth)
2. Your Gemini API key
3. A Cloudflare account (free)
4. Your Google Workspace domain name

## 🚀 Setup Steps

### Part 1: Google OAuth Setup (10 minutes)

#### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Create Project"
3. Name it "SAGE OAuth" (or any name)
4. Click "Create"

#### 1.2 Configure OAuth Consent Screen

1. In the left menu, go to **APIs & Services** > **OAuth consent screen**
2. Select **Internal** (this restricts to your workspace)
3. Click **Create**
4. Fill in the required fields:
   - **App name:** SAGE
   - **User support email:** Your email
   - **Developer contact:** Your email
5. Click **Save and Continue**
6. On "Scopes" page, click **Save and Continue** (no additional scopes needed)
7. Click **Back to Dashboard**

#### 1.3 Create OAuth Credentials

1. In the left menu, go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **OAuth client ID**
3. Choose **Application type:** Web application
4. **Name:** SAGE Worker
5. Under **Authorized redirect URIs**, click **+ Add URI**
6. Add: `https://sage-oauth-worker.YOUR-SUBDOMAIN.workers.dev/auth/callback`
   - ⚠️ Replace `YOUR-SUBDOMAIN` with your actual Cloudflare subdomain (you'll get this in Part 2)
7. Click **Create**
8. **Save the Client ID and Client Secret** - you'll need these!

### Part 2: Cloudflare Worker Setup (15 minutes)

#### 2.1 Install Wrangler CLI

```bash
npm install -g wrangler
```

#### 2.2 Login to Cloudflare

```bash
wrangler login
```

This will open a browser window to authenticate.

#### 2.3 Configure Worker

1. Open `worker/wrangler.toml`
2. Update these values:
   ```toml
   WORKSPACE_DOMAIN = "yourdomain.com"  # Your Google Workspace domain
   ```

#### 2.4 Set Secrets

Run these commands to set your secrets (you'll be prompted to paste each value):

```bash
cd worker
wrangler secret put GOOGLE_CLIENT_ID
# Paste your Google OAuth Client ID

wrangler secret put GOOGLE_CLIENT_SECRET
# Paste your Google OAuth Client Secret

wrangler secret put GEMINI_API_KEY
# Paste your Gemini API key

wrangler secret put JWT_SECRET
# Paste a random secret (generate with: openssl rand -base64 32)
```

#### 2.5 Deploy Worker

```bash
wrangler deploy
```

You'll see output like:
```
Published sage-oauth-worker (X.XX sec)
  https://sage-oauth-worker.your-subdomain.workers.dev
```

**Save this URL!** This is your worker URL.

#### 2.6 Update Google OAuth Redirect URI

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth client
4. Update the **Authorized redirect URIs** with your actual worker URL:
   - `https://sage-oauth-worker.YOUR-ACTUAL-SUBDOMAIN.workers.dev/auth/callback`
5. Click **Save**

### Part 3: Update SAGE Configuration (2 minutes)

#### 3.1 Update Worker Redirect URL

1. Open `worker/wrangler.toml`
2. Update `REDIRECT_URI` with your actual worker URL:
   ```toml
   REDIRECT_URI = "https://sage-oauth-worker.YOUR-ACTUAL-SUBDOMAIN.workers.dev/auth/callback"
   ```
3. Redeploy:
   ```bash
   wrangler deploy
   ```

#### 3.2 Update Worker callback URL

1. Open `worker/index.js`
2. Find the `redirectToApp` function (line ~385)
3. Update the app URL to your actual SAGE URL:
   ```javascript
   const appUrl = new URL('/auth-callback.html', 'https://your-actual-sage-url.com');
   ```
4. Redeploy:
   ```bash
   wrangler deploy
   ```

#### 3.3 Enable OAuth in SAGE

1. Open `js/config.js`
2. Update these values:
   ```javascript
   OAUTH_ENABLED: true,
   WORKER_URL: 'https://sage-oauth-worker.YOUR-ACTUAL-SUBDOMAIN.workers.dev'
   ```

3. Open `auth-callback.html`
4. Update the `WORKER_URL` constant:
   ```javascript
   const WORKER_URL = 'https://sage-oauth-worker.YOUR-ACTUAL-SUBDOMAIN.workers.dev';
   ```

#### 3.4 Deploy SAGE

Commit and push your changes to your git repository. If you're using GitHub Pages, it will auto-deploy.

## ✅ Testing

1. Open SAGE in your browser
2. You should now see a "Sign in with Google Workspace" button
3. Click it and sign in with a Google Workspace account from your domain
4. After authentication, you should see your profile info
5. Try generating questions - they should work without entering an API key!

## 🔧 Troubleshooting

### "Invalid domain" error
- Check that `WORKSPACE_DOMAIN` in `wrangler.toml` matches your Google Workspace domain
- Redeploy the worker: `wrangler deploy`

### "Redirect URI mismatch" error
- Make sure the redirect URI in Google Cloud Console exactly matches your worker URL
- Format: `https://sage-oauth-worker.YOUR-SUBDOMAIN.workers.dev/auth/callback`

### Authentication works but API calls fail
- Check that `GEMINI_API_KEY` secret is set correctly
- Test: `wrangler secret list` should show all 4 secrets

### Still showing API key as required
- Check that `OAUTH_ENABLED: true` in `js/config.js`
- Check that `WORKER_URL` is set correctly in `js/config.js`
- Clear browser cache and reload

### Worker logs
View worker logs to debug issues:
```bash
wrangler tail
```

## 🔒 Security Notes

1. **Domain Restriction:** Only users with `@yourdomain.com` emails can authenticate
2. **Session Expiry:** User sessions expire after 24 hours
3. **API Key Security:** Your Gemini API key is stored as a Cloudflare secret (encrypted)
4. **JWT Signing:** Sessions are cryptographically signed

## 💰 Cost Management

**Free Tier Limits:**
- Cloudflare Workers: 100,000 requests/day
- Cloudflare Workers KV: 1GB storage
- Google OAuth: Free
- Estimated team usage: ~100-500 requests/day

**Monitoring:**
```bash
wrangler metrics
```

## 🔄 Rollback Instructions

If you want to disable OAuth and go back to the original setup:

1. Open `js/config.js`:
   ```javascript
   OAUTH_ENABLED: false,
   ```

2. That's it! SAGE will work exactly as before with API key input.

To fully remove OAuth code (optional):
1. Remove the OAuth button from `index.html` (lines 101-125)
2. Remove `js/auth.js` import from `index.html`
3. Remove `css/oauth.css` import from `index.html`
4. Delete `worker/` folder
5. Delete `auth-callback.html`

## 📚 Additional Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Google OAuth 2.0 Docs](https://developers.google.com/identity/protocols/oauth2)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

## 🆘 Support

If you encounter issues:
1. Check the troubleshooting section above
2. View worker logs: `wrangler tail`
3. Check browser console for errors (F12)
4. Create an issue in the GitHub repo

## 📝 Summary Checklist

- [ ] Google Cloud Project created
- [ ] OAuth consent screen configured (Internal)
- [ ] OAuth credentials created
- [ ] Cloudflare account created
- [ ] Wrangler CLI installed
- [ ] Worker secrets set (all 4)
- [ ] Worker deployed
- [ ] Google OAuth redirect URI updated
- [ ] SAGE config updated (OAuth enabled)
- [ ] SAGE deployed
- [ ] Tested with Google Workspace account
- [ ] Colleagues notified and onboarded

---

**Time to complete:** ~30 minutes
**Difficulty:** Beginner-friendly (step-by-step guide)
**Reversibility:** 100% (can rollback in 2 minutes)

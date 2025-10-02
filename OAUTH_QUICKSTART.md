# 🚀 OAuth Quick Start (30 minutes)

Get Google Workspace OAuth working for SAGE in 3 simple steps.

## ⚡ TL;DR

1. **Google Setup** (10 min) - Create OAuth credentials
2. **Deploy Worker** (15 min) - Deploy Cloudflare Worker
3. **Enable OAuth** (5 min) - Update SAGE config

---

## Step 1: Google OAuth Credentials

### 1.1 Create Project
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click "Select Project" → "New Project"
3. Name: "SAGE OAuth" → Create

### 1.2 OAuth Consent Screen
1. Menu → "APIs & Services" → "OAuth consent screen"
2. Select **Internal** → Create
3. Fill in:
   - App name: **SAGE**
   - Support email: **Your email**
   - Developer email: **Your email**
4. Save and Continue → Save and Continue → Back to Dashboard

### 1.3 Create Credentials
1. Menu → "APIs & Services" → "Credentials"
2. "+ Create Credentials" → "OAuth client ID"
3. Application type: **Web application**
4. Name: **SAGE Worker**
5. Authorized redirect URIs: `https://sage-oauth-worker.REPLACE-THIS.workers.dev/auth/callback`
   - ⚠️ You'll update this after deploying the worker
6. **Create**
7. **Copy and save:**
   - Client ID
   - Client Secret

---

## Step 2: Deploy Cloudflare Worker

### 2.1 Install Wrangler
```bash
npm install -g wrangler
```

### 2.2 Login
```bash
wrangler login
```

### 2.3 Configure
Edit `worker/wrangler.toml`:
```toml
WORKSPACE_DOMAIN = "REPLACE-WITH-YOUR-DOMAIN.com"
```

### 2.4 Set Secrets
```bash
cd worker

wrangler secret put GOOGLE_CLIENT_ID
# Paste your Client ID from Step 1.3

wrangler secret put GOOGLE_CLIENT_SECRET
# Paste your Client Secret from Step 1.3

wrangler secret put GEMINI_API_KEY
# Paste your Gemini API key

wrangler secret put JWT_SECRET
# Generate and paste: openssl rand -base64 32
```

### 2.5 Deploy
```bash
wrangler deploy
```

**Save the output URL!** Example:
```
https://sage-oauth-worker.abc123.workers.dev
```

### 2.6 Update Google OAuth
1. Go back to [Google Cloud Console](https://console.cloud.google.com)
2. APIs & Services → Credentials → Click your OAuth client
3. Update **Authorized redirect URIs** with actual worker URL:
   - `https://sage-oauth-worker.YOUR-ACTUAL-URL.workers.dev/auth/callback`
4. **Save**

---

## Step 3: Enable OAuth in SAGE

### 3.1 Update Worker Config
Edit `worker/wrangler.toml`:
```toml
REDIRECT_URI = "https://sage-oauth-worker.YOUR-ACTUAL-URL.workers.dev/auth/callback"
```

Redeploy:
```bash
wrangler deploy
```

### 3.2 Update Worker Code
Edit `worker/index.js`, line ~385:
```javascript
const appUrl = new URL('/auth-callback.html', 'https://YOUR-SAGE-URL.com');
```

Redeploy:
```bash
wrangler deploy
```

### 3.3 Enable in SAGE
Edit `js/config.js`:
```javascript
OAUTH_ENABLED: true,
WORKER_URL: 'https://sage-oauth-worker.YOUR-ACTUAL-URL.workers.dev'
```

Edit `auth-callback.html`, line ~32:
```javascript
const WORKER_URL = 'https://sage-oauth-worker.YOUR-ACTUAL-URL.workers.dev';
```

### 3.4 Deploy SAGE
```bash
git add .
git commit -m "Enable Google Workspace OAuth"
git push
```

---

## ✅ Test It!

1. Open SAGE
2. Click "Sign in with Google Workspace"
3. Sign in with your workspace account
4. Generate questions - no API key needed!

---

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| "Redirect URI mismatch" | Update Google OAuth with exact worker URL |
| "Invalid domain" | Check `WORKSPACE_DOMAIN` in `wrangler.toml` |
| Button not showing | Check `OAUTH_ENABLED: true` in `js/config.js` |
| API calls fail | Verify `GEMINI_API_KEY` secret is set |

View worker logs:
```bash
wrangler tail
```

---

## 🔄 Disable OAuth (Rollback)

Edit `js/config.js`:
```javascript
OAUTH_ENABLED: false,
```

That's it! SAGE works exactly as before.

---

## 📚 Full Documentation

See [OAUTH_SETUP.md](./OAUTH_SETUP.md) for detailed documentation.

---

## 💰 Cost: $0/month

Cloudflare Workers free tier: 100,000 requests/day

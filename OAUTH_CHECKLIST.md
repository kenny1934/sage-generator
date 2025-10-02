# OAuth Deployment Checklist

Use this checklist when you're ready to enable OAuth.

## ✅ Pre-Deployment Checklist

### Prerequisites
- [ ] I have a Google Workspace account with admin access
- [ ] I have a Cloudflare account (free tier is fine)
- [ ] I have Node.js installed (for Wrangler CLI)
- [ ] I have my Gemini API key ready
- [ ] I have 30 minutes to complete the setup

---

## 📋 Step-by-Step Deployment

### Part 1: Google Cloud Setup (10 minutes)

- [ ] **1.1** Create new project in [Google Cloud Console](https://console.cloud.google.com)
  - Project name: `SAGE OAuth`

- [ ] **1.2** Configure OAuth consent screen
  - Type: **Internal** (workspace only)
  - App name: `SAGE`
  - Support email: ________________
  - Developer email: ________________

- [ ] **1.3** Create OAuth credentials
  - Application type: **Web application**
  - Name: `SAGE Worker`
  - Redirect URI: `https://sage-oauth-worker.TEMP.workers.dev/auth/callback` (will update later)
  - **Save credentials:**
    - Client ID: _________________________________
    - Client Secret: _____________________________

---

### Part 2: Cloudflare Worker Setup (15 minutes)

- [ ] **2.1** Install Wrangler CLI
  ```bash
  npm install -g wrangler
  ```

- [ ] **2.2** Login to Cloudflare
  ```bash
  wrangler login
  ```

- [ ] **2.3** Update worker config
  - Edit `worker/wrangler.toml`
  - Set `WORKSPACE_DOMAIN` to: ________________

- [ ] **2.4** Set secrets
  ```bash
  cd worker
  wrangler secret put GOOGLE_CLIENT_ID
  wrangler secret put GOOGLE_CLIENT_SECRET
  wrangler secret put GEMINI_API_KEY
  wrangler secret put JWT_SECRET  # Generate with: openssl rand -base64 32
  ```

- [ ] **2.5** Deploy worker
  ```bash
  wrangler deploy
  ```
  - **Worker URL:** _________________________________

- [ ] **2.6** Update Google OAuth redirect URI
  - Go back to Google Cloud Console
  - Update redirect URI with actual worker URL
  - Format: `https://YOUR-ACTUAL-URL.workers.dev/auth/callback`

---

### Part 3: Update SAGE Configuration (5 minutes)

- [ ] **3.1** Update worker config (again)
  - Edit `worker/wrangler.toml`
  - Set `REDIRECT_URI` to actual worker callback URL
  - Redeploy: `wrangler deploy`

- [ ] **3.2** Update worker app URL
  - Edit `worker/index.js` line ~385
  - Update `redirectToApp` function with your SAGE URL
  - Redeploy: `wrangler deploy`

- [ ] **3.3** Enable OAuth in SAGE
  - Edit `js/config.js`
  - Set `OAUTH_ENABLED: true`
  - Set `WORKER_URL` to your worker URL

- [ ] **3.4** Update callback page
  - Edit `auth-callback.html` line ~32
  - Update `WORKER_URL` constant

- [ ] **3.5** Deploy SAGE
  ```bash
  git add .
  git commit -m "Enable Google Workspace OAuth"
  git push
  ```

---

## 🧪 Testing Checklist

- [ ] **Test 1:** Open SAGE in browser
  - [ ] "Sign in with Google Workspace" button is visible

- [ ] **Test 2:** Click sign in button
  - [ ] Redirects to Google sign-in page
  - [ ] Shows correct app name "SAGE"

- [ ] **Test 3:** Sign in with workspace account
  - [ ] Email is from correct domain (@yourdomain.com)
  - [ ] Authentication succeeds
  - [ ] Redirects back to SAGE

- [ ] **Test 4:** Check authenticated state
  - [ ] User name and email displayed correctly
  - [ ] Profile picture loads
  - [ ] "Sign Out" button visible

- [ ] **Test 5:** Generate questions
  - [ ] Click "Generate Maths Questions"
  - [ ] Questions generate successfully
  - [ ] No API key required
  - [ ] Math renders correctly

- [ ] **Test 6:** Sign out
  - [ ] Click "Sign Out"
  - [ ] User info disappears
  - [ ] "Sign in with Google" button reappears

- [ ] **Test 7:** API key fallback
  - [ ] Enter API key manually (while signed out)
  - [ ] Generate questions with API key
  - [ ] Works as before

---

## 🐛 Troubleshooting Checklist

If authentication fails:

- [ ] Check browser console (F12) for errors
- [ ] View worker logs: `wrangler tail`
- [ ] Verify all 4 secrets are set: `wrangler secret list`
- [ ] Check redirect URI exactly matches in Google console
- [ ] Verify `WORKSPACE_DOMAIN` matches your domain
- [ ] Clear browser cache and cookies
- [ ] Try incognito/private browsing mode

Common issues:

- [ ] **"Redirect URI mismatch"**
  - Solution: Update Google OAuth with exact worker URL

- [ ] **"Invalid domain"**
  - Solution: Check `WORKSPACE_DOMAIN` in `wrangler.toml`

- [ ] **Button not showing**
  - Solution: Verify `OAUTH_ENABLED: true` in `js/config.js`

- [ ] **"Session expired"**
  - Solution: Sign in again (sessions expire after 24h)

---

## 👥 Team Onboarding Checklist

After successful testing:

- [ ] **Notify colleagues**
  - [ ] Share SAGE URL
  - [ ] Explain they can sign in with Google
  - [ ] No API key needed

- [ ] **Create simple guide for team**
  - [ ] How to access SAGE
  - [ ] Click "Sign in with Google"
  - [ ] Choose topic and generate

- [ ] **Monitor initial usage**
  - [ ] Check worker metrics: `wrangler metrics`
  - [ ] Watch for any errors: `wrangler tail`
  - [ ] Gather feedback from early users

- [ ] **Document internally**
  - [ ] Add to team wiki/docs
  - [ ] Include troubleshooting tips
  - [ ] Share keyboard shortcuts

---

## 📊 Post-Deployment Monitoring

Weekly checks (first month):

- [ ] Check Cloudflare dashboard for usage
- [ ] Review any error logs: `wrangler tail`
- [ ] Verify staying within free tier limits
- [ ] Collect user feedback

Monthly checks:

- [ ] Review API usage and costs
- [ ] Check for any authentication issues
- [ ] Update documentation if needed
- [ ] Consider feedback for improvements

---

## 🔄 Rollback Checklist

If you need to disable OAuth:

Immediate (2 minutes):
- [ ] Edit `js/config.js`
- [ ] Set `OAUTH_ENABLED: false`
- [ ] Commit and push
- [ ] Verify app works with API keys

Full removal (optional, 10 minutes):
- [ ] Complete immediate rollback first
- [ ] Remove OAuth files (see OAUTH_SUMMARY.md)
- [ ] Remove OAuth UI from HTML
- [ ] Clean up imports
- [ ] Test thoroughly

---

## ✅ Success Criteria

You know OAuth is working when:

- [ ] Colleagues can sign in with Google
- [ ] Questions generate without API keys
- [ ] No authentication errors in logs
- [ ] Users report positive experience
- [ ] Staying within free tier limits
- [ ] No maintenance required

---

## 📞 Support Resources

If you get stuck:

1. [ ] Check troubleshooting in this checklist
2. [ ] Review [OAUTH_QUICKSTART.md](./OAUTH_QUICKSTART.md)
3. [ ] Check [OAUTH_SETUP.md](./OAUTH_SETUP.md) for details
4. [ ] View worker logs: `wrangler tail`
5. [ ] Check browser console (F12)
6. [ ] Review [OAUTH_ARCHITECTURE.md](./OAUTH_ARCHITECTURE.md)

---

## 🎉 Completion

When all checkboxes are complete:

- [ ] OAuth is fully deployed and working
- [ ] Team has been onboarded
- [ ] Monitoring is in place
- [ ] Documentation is shared
- [ ] Success! 🚀

**Date completed:** ________________

**Deployed by:** ________________

**Notes:**
_____________________________________________
_____________________________________________
_____________________________________________

---

**Estimated time:** 30 minutes
**Difficulty:** Beginner-friendly
**Cost:** $0/month (free tier)
**Reversibility:** 2 minutes (config change)

# SAGE OAuth Worker

This Cloudflare Worker handles Google Workspace OAuth authentication and proxies Gemini API requests for authenticated users.

## Architecture

```
User Browser
    ↓
    ↓ (1) Sign in with Google
    ↓
Cloudflare Worker (/auth/google)
    ↓
    ↓ (2) Redirect to Google
    ↓
Google OAuth
    ↓
    ↓ (3) User authorizes
    ↓
Cloudflare Worker (/auth/callback)
    ↓
    ↓ (4) Create session token (JWT)
    ↓
SAGE App (with session token)
    ↓
    ↓ (5) Generate questions
    ↓
Cloudflare Worker (/api/generate)
    ↓
    ↓ (6) Verify token & proxy request
    ↓
Gemini API
```

## Endpoints

### Authentication

#### `GET /auth/google`
Initiates Google OAuth flow. Redirects user to Google sign-in.

**Response:** HTTP 302 redirect to Google OAuth

---

#### `GET /auth/callback`
OAuth callback endpoint. Exchanges auth code for tokens and creates session.

**Query Parameters:**
- `code` - Authorization code from Google
- `error` - Error code (if auth failed)

**Response:** HTTP 302 redirect to SAGE app with session token

---

#### `GET /auth/verify`
Verifies a session token.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "valid": true,
  "user": {
    "email": "user@domain.com",
    "name": "User Name",
    "picture": "https://..."
  }
}
```

---

#### `POST /auth/logout`
Logs out user (client-side cleanup).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true
}
```

---

### API Proxy

#### `POST /api/generate`
Proxies question generation request to Gemini API.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body:**
```json
{
  "model": "flash",
  "payload": {
    "contents": [...],
    "generationConfig": {...}
  }
}
```

**Response:** Gemini API response (proxied)

---

## Environment Variables

Set in `wrangler.toml`:

```toml
WORKSPACE_DOMAIN = "yourdomain.com"
REDIRECT_URI = "https://sage-oauth-worker.your-subdomain.workers.dev/auth/callback"
```

## Secrets

Set using `wrangler secret put <NAME>`:

| Secret | Description | Example |
|--------|-------------|---------|
| `GOOGLE_CLIENT_ID` | OAuth client ID | `123456-abc.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret | `GOCSPX-abc123...` |
| `GEMINI_API_KEY` | Gemini API key | `AIza...` |
| `JWT_SECRET` | JWT signing secret | Random 32-byte base64 string |

Generate JWT secret:
```bash
openssl rand -base64 32
```

---

## Deployment

### Initial Deploy

```bash
# Install dependencies
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set secrets
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put GEMINI_API_KEY
wrangler secret put JWT_SECRET

# Deploy
wrangler deploy
```

### Update Deployment

```bash
wrangler deploy
```

---

## Monitoring

### View Logs

```bash
wrangler tail
```

### View Metrics

```bash
wrangler metrics
```

---

## Security

### Domain Restriction
Only users with emails from `WORKSPACE_DOMAIN` can authenticate:
```javascript
if (userInfo.hd !== env.WORKSPACE_DOMAIN) {
    return redirectToApp('error=invalid_domain');
}
```

### Session Tokens
- Sessions expire after 24 hours
- Tokens are signed with HMAC-SHA256
- Token verification on every API call

### CORS
CORS headers are set to `*` in development. For production, restrict to your domain:
```javascript
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://your-sage-domain.com',
  // ...
};
```

---

## Development

### Local Testing

```bash
wrangler dev
```

This starts a local development server.

### Environment Variables for Local Dev

Create `.dev.vars` file:
```bash
WORKSPACE_DOMAIN=yourdomain.com
REDIRECT_URI=http://localhost:8787/auth/callback
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GEMINI_API_KEY=your-api-key
JWT_SECRET=your-jwt-secret
```

**⚠️ Do not commit `.dev.vars` to git!**

---

## Cost

Cloudflare Workers Free Tier:
- ✅ 100,000 requests/day
- ✅ 1GB Workers KV storage
- ✅ 10ms CPU time per request

Typical usage for small team (~10 users):
- ~200-500 requests/day
- **Cost: $0/month**

If you exceed free tier:
- $5/month for 10M requests

---

## Troubleshooting

### "Invalid signature" errors
- JWT secret mismatch
- Check: `wrangler secret list`
- Re-set: `wrangler secret put JWT_SECRET`

### "Invalid domain" errors
- Check `WORKSPACE_DOMAIN` in `wrangler.toml`
- Must match Google Workspace domain exactly

### API calls failing
- Check `GEMINI_API_KEY` is set
- View logs: `wrangler tail`

### Deployment fails
- Check `wrangler.toml` syntax
- Ensure logged in: `wrangler login`

---

## Files

- `index.js` - Main worker code
- `wrangler.toml` - Configuration
- `README.md` - This file

---

## License

Same as SAGE project

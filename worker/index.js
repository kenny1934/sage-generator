/**
 * SAGE - Cloudflare Worker Backend
 * Handles Google Workspace OAuth and proxies Gemini API requests
 */

// CORS headers for cross-origin requests
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // Will be restricted in production
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: CORS_HEADERS });
    }

    try {
      // Route handling
      if (url.pathname === '/auth/google') {
        return handleGoogleAuth(env);
      }

      if (url.pathname === '/auth/callback') {
        return handleGoogleCallback(request, env);
      }

      if (url.pathname === '/auth/verify') {
        return handleVerifyToken(request, env);
      }

      if (url.pathname === '/api/generate') {
        return handleGenerateQuestions(request, env);
      }

      if (url.pathname === '/auth/logout') {
        return handleLogout();
      }

      return new Response('Not Found', { status: 404 });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }
  }
};

/**
 * Initiates Google OAuth flow
 */
function handleGoogleAuth(env) {
  const scopes = [
    'openid',
    'email',
    'profile'
  ].join(' ');

  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: env.REDIRECT_URI,
    response_type: 'code',
    scope: scopes,
    hd: env.WORKSPACE_DOMAIN, // Restrict to specific Google Workspace domain
    access_type: 'online',
    prompt: 'select_account'
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  return Response.redirect(authUrl, 302);
}

/**
 * Handles OAuth callback from Google
 */
async function handleGoogleCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    return redirectToApp(`error=${error}`);
  }

  if (!code) {
    return redirectToApp('error=no_code');
  }

  try {
    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: env.REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();

    // Verify the ID token and extract user info
    const userInfo = await verifyGoogleToken(tokens.id_token, env);

    // Verify user is from allowed workspace domain
    if (userInfo.hd !== env.WORKSPACE_DOMAIN) {
      return redirectToApp('error=invalid_domain');
    }

    // Create session token (JWT)
    const sessionToken = await createSessionToken(userInfo, env);

    // Redirect back to app with token
    return redirectToApp(`token=${sessionToken}`);

  } catch (error) {
    console.error('OAuth callback error:', error);
    return redirectToApp(`error=auth_failed`);
  }
}

/**
 * Verifies a Google ID token and extracts user info
 */
async function verifyGoogleToken(idToken, env) {
  // Decode JWT (simplified - in production, verify signature)
  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

  // Basic validation
  if (payload.aud !== env.GOOGLE_CLIENT_ID) {
    throw new Error('Invalid audience');
  }

  if (payload.exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }

  return payload;
}

/**
 * Creates a session token for authenticated user
 */
async function createSessionToken(userInfo, env) {
  const payload = {
    email: userInfo.email,
    name: userInfo.name,
    picture: userInfo.picture,
    hd: userInfo.hd,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  const header = { alg: 'HS256', typ: 'JWT' };

  // Create JWT
  const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '');
  const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const token = `${encodedHeader}.${encodedPayload}`;

  // Sign token
  const signature = await signToken(token, env.JWT_SECRET);

  return `${token}.${signature}`;
}

/**
 * Signs a token with HMAC-SHA256
 */
async function signToken(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );

  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Verifies a session token
 */
async function verifySessionToken(token, env) {
  if (!token) {
    throw new Error('No token provided');
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    throw new Error('Invalid token format');
  }

  const [header, payload, signature] = parts;

  // Verify signature
  const expectedSignature = await signToken(`${header}.${payload}`, env.JWT_SECRET);
  if (signature !== expectedSignature) {
    throw new Error('Invalid signature');
  }

  // Decode and validate payload
  const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));

  if (decodedPayload.exp < Date.now() / 1000) {
    throw new Error('Token expired');
  }

  if (decodedPayload.hd !== env.WORKSPACE_DOMAIN) {
    throw new Error('Invalid domain');
  }

  return decodedPayload;
}

/**
 * Verifies a user's session token
 */
async function handleVerifyToken(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ valid: false }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  const token = authHeader.substring(7);

  try {
    const user = await verifySessionToken(token, env);
    return new Response(JSON.stringify({
      valid: true,
      user: {
        email: user.email,
        name: user.name,
        picture: user.picture
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  } catch (error) {
    return new Response(JSON.stringify({ valid: false, error: error.message }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}

/**
 * Handles logout
 */
function handleLogout() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

/**
 * Proxies Gemini API requests for authenticated users
 */
async function handleGenerateQuestions(request, env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  // Verify authentication
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }

  const token = authHeader.substring(7);

  try {
    // Verify user token
    await verifySessionToken(token, env);

    // Parse request body
    const body = await request.json();
    const { model, payload } = body;

    if (!model || !payload) {
      return new Response(JSON.stringify({ error: 'Missing model or payload' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
      });
    }

    // Get model endpoint
    const modelEndpoints = {
      'flash-lite': 'gemini-2.5-flash-lite',
      'flash': 'gemini-2.5-flash',
      'pro': 'gemini-2.5-pro'
    };

    const modelName = modelEndpoints[model] || 'gemini-2.5-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.GEMINI_API_KEY}`;

    // Forward request to Gemini API
    const geminiResponse = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    const result = await geminiResponse.json();

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });

  } catch (error) {
    console.error('Generate questions error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: error.message.includes('Unauthorized') ? 401 : 500,
      headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
    });
  }
}

/**
 * Redirects back to the main app with query parameters
 */
function redirectToApp(params) {
  // In production, this should be your actual app URL
  const appUrl = new URL('/auth-callback.html', 'https://your-app-domain.com');
  appUrl.search = params;

  return Response.redirect(appUrl.toString(), 302);
}

# Fix: OAuth Redirecting to Production Instead of Localhost

## Problem
When running locally (`localhost:3000`), after Google OAuth, it redirects to `https://www.sipher.in/?error=auth-failed` instead of staying on localhost.

## Root Cause
**Supabase redirect URLs configuration doesn't include localhost**. When Supabase validates the OAuth callback, if `http://localhost:3000/auth/callback` isn't in the allowed list, it redirects to the production URL.

## Solution

### Step 1: Add Localhost to Supabase Redirect URLs

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Under **Redirect URLs**, add:
   ```
   http://localhost:3000/auth/callback
   http://127.0.0.1:3000/auth/callback
   ```
5. Click **Save**

### Step 2: Verify Google OAuth Configuration

In Supabase Dashboard → **Authentication** → **Providers** → **Google**:

1. Ensure **Client ID** and **Client Secret** are set
2. In Google Cloud Console, verify the authorized redirect URI includes:
   ```
   https://[your-supabase-project-id].supabase.co/auth/v1/callback
   ```

### Step 3: Test Locally

1. Start your dev server: `npm run dev`
2. Open `http://localhost:3000`
3. Click "Sign in with Google"
4. After Google auth, you should be redirected back to `http://localhost:3000/auth/callback`
5. Check your terminal for `[OAuth Callback]` logs

## Debugging

### Check Server Logs
Look for logs like:
```
[OAuth Callback] Request received {
  url: 'http://localhost:3000/auth/callback?code=...',
  origin: 'http://localhost:3000',
  ...
}
```

If you see `origin: 'https://www.sipher.in'` instead of `http://localhost:3000`, the issue is in Supabase configuration.

### Common Issues

1. **Supabase redirect URLs missing localhost**
   - Fix: Add `http://localhost:3000/auth/callback` to Supabase settings

2. **Port mismatch**
   - If you're running on port 3001, add `http://localhost:3001/auth/callback`

3. **HTTPS vs HTTP**
   - Localhost should use `http://` not `https://`

4. **Trailing slash**
   - Use `/auth/callback` not `/auth/callback/`

## Verification Checklist

- [ ] `http://localhost:3000/auth/callback` added to Supabase redirect URLs
- [ ] `http://127.0.0.1:3000/auth/callback` added (alternative localhost)
- [ ] Google OAuth provider configured in Supabase
- [ ] Google Cloud Console redirect URI includes Supabase callback URL
- [ ] Dev server running on correct port
- [ ] Browser console shows no errors
- [ ] Server logs show `origin: 'http://localhost:3000'`

## Production vs Development

**Development (localhost)**:
- Redirect URL: `http://localhost:3000/auth/callback`
- Must be added to Supabase redirect URLs

**Production**:
- Redirect URL: `https://www.sipher.in/auth/callback`
- Should already be configured

Both environments need their respective URLs in Supabase settings.

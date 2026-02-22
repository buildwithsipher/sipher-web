# Professional OAuth Debugging Guide

## Understanding the Error

When users see `/?error=auth-failed` after selecting a Google account, it means the OAuth callback failed. This guide shows you how to debug this like a professional developer.

## Debugging Checklist

### 1. Check Server Logs (Most Important)

The enhanced callback route now logs detailed information. Check your server logs for:

```
[OAuth Callback] Request received
```

Look for:
- `hasCode`: Should be `true` if Google redirected back with a code
- `hasError`: Should be `false` (if true, Google/Supabase returned an error)
- `error` / `errorDescription`: Specific error from OAuth provider
- `env.hasSupabaseUrl` / `env.hasSupabaseKey`: Should both be `true`

### 2. Common Failure Points

#### A. OAuth Provider Error (Lines 29-50)
**Symptoms**: `hasError: true` in logs
**Causes**:
- User denied permission
- Google OAuth app misconfiguration
- Invalid redirect URI

**Debug Steps**:
1. Check the `error` and `errorDescription` in logs
2. Verify Google OAuth credentials in Supabase dashboard
3. Check redirect URI matches exactly (including `www` vs non-www)

#### B. Code Exchange Failure (Line 95)
**Symptoms**: `[OAuth Callback] Code exchange error` in logs
**Causes**:
- Redirect URL mismatch in Supabase settings
- Expired authorization code
- Network issues
- Invalid Supabase credentials

**Debug Steps**:
1. Check `errorCode` and `errorMessage` in logs
2. Verify Supabase redirect URLs match exactly:
   - Production: `https://www.sipher.in/auth/callback`
   - Development: `http://localhost:3000/auth/callback`
3. Check environment variables are set correctly

#### C. Missing Code Parameter (Line 175+)
**Symptoms**: `[OAuth Callback] No code parameter` in logs
**Causes**:
- OAuth flow didn't complete
- Redirect URL configuration issue
- User navigated away during OAuth

**Debug Steps**:
1. Check the full URL in logs
2. Verify redirect URL in Supabase matches your domain exactly

### 3. Supabase Configuration Checklist

#### Redirect URLs (Critical!)
In Supabase Dashboard → Authentication → URL Configuration:

**Production URLs** (must include ALL variations):
```
https://www.sipher.in/auth/callback
https://sipher.in/auth/callback
```

**Development URLs**:
```
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

**Common Mistakes**:
- ❌ Missing `www` variant
- ❌ Missing trailing slash (if your route uses it)
- ❌ HTTP vs HTTPS mismatch
- ❌ Wrong port number

#### Google OAuth Provider Settings
In Supabase Dashboard → Authentication → Providers → Google:

1. **Client ID**: Must match Google Cloud Console
2. **Client Secret**: Must match Google Cloud Console
3. **Authorized redirect URIs** in Google Cloud Console must include:
   ```
   https://[your-supabase-project].supabase.co/auth/v1/callback
   ```

### 4. Environment Variables Check

Verify these are set in your production environment:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
```

**Check in logs**: Look for `env.hasSupabaseUrl` and `env.hasSupabaseKey` - both should be `true`

### 5. Domain/URL Mismatch Issues

**Problem**: `www.sipher.in` vs `sipher.in`

**Solution**: Add BOTH to Supabase redirect URLs:
```
https://www.sipher.in/auth/callback
https://sipher.in/auth/callback
```

**Also check**: Your `redirectTo` in code matches the domain:
```typescript
redirectTo: `${window.location.origin}/auth/callback?next=/waitlist/complete`
```

### 6. Testing the Flow Manually

1. **Start OAuth flow**: Click "Sign in with Google"
2. **Check browser console**: Look for any client-side errors
3. **Check network tab**: 
   - Find the request to `/auth/callback`
   - Check the response/redirect
   - Look at query parameters (`code`, `error`, etc.)
4. **Check server logs**: Look for `[OAuth Callback]` logs

### 7. Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `redirect_uri_mismatch` | Redirect URL not in Supabase/Google settings | Add exact URL to both Supabase and Google OAuth settings |
| `invalid_grant` | Code expired or already used | User needs to try again (codes expire quickly) |
| `access_denied` | User denied permission | User needs to grant permissions |
| `server_error` | Supabase/Google server issue | Check Supabase status, retry later |
| No code parameter | OAuth flow didn't complete | Check redirect URL configuration |

### 8. Production-Specific Debugging

#### Check Vercel/Deployment Logs
1. Go to your deployment platform (Vercel, etc.)
2. Check function logs for the `/auth/callback` route
3. Look for the `[OAuth Callback]` prefixed logs

#### Verify Environment Variables in Production
```bash
# In Vercel dashboard or your deployment platform
# Check that these are set:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

#### Test with Different Browsers
- Some browsers block third-party cookies
- Test in incognito mode
- Check browser console for cookie/session errors

### 9. Advanced Debugging

#### Enable Verbose Logging
The callback route now logs:
- Full request URL
- All query parameters
- Environment variable presence (without exposing values)
- Code exchange results
- Session creation status

#### Check Supabase Logs
1. Go to Supabase Dashboard → Logs
2. Filter for "auth" events
3. Look for OAuth-related errors

#### Network Inspection
1. Open DevTools → Network tab
2. Filter for `/auth/callback`
3. Check:
   - Request URL (should have `code` parameter)
   - Response status (should be 302 redirect)
   - Response headers (check for cookies)

### 10. Quick Fix Checklist

If OAuth is failing, check these in order:

1. ✅ **Redirect URLs match exactly** (including www/non-www)
2. ✅ **Environment variables are set** (check logs)
3. ✅ **Google OAuth credentials are correct** (in Supabase)
4. ✅ **Supabase project is active** (not paused)
5. ✅ **Domain matches** (www.sipher.in vs sipher.in)
6. ✅ **No ad blockers** (can interfere with OAuth)
7. ✅ **Cookies enabled** (required for sessions)

### 11. Getting Help

When reporting the issue, include:

1. **Server logs** with `[OAuth Callback]` entries
2. **Browser console errors** (if any)
3. **Network tab** showing the callback request
4. **Supabase redirect URLs** configuration
5. **Environment** (production vs development)
6. **Domain** (www vs non-www)

### 12. Prevention

To prevent OAuth issues:

1. **Always test in production-like environment** before deploying
2. **Use environment-specific redirect URLs**
3. **Monitor error rates** in production
4. **Set up alerts** for auth failures
5. **Document your OAuth configuration** (redirect URLs, etc.)

## Example Debug Session

```
[OAuth Callback] Request received {
  url: 'https://www.sipher.in/auth/callback?code=abc123&next=/waitlist/complete',
  hasCode: true,
  hasError: false,
  env: {
    hasSupabaseUrl: true,
    hasSupabaseKey: true,
    supabaseUrlDomain: 'xyz.supabase.co'
  }
}

[OAuth Callback] Exchanging code for session...
[OAuth Callback] Code exchange error: {
  error: 'invalid_grant',
  status: 400
}
```

**Diagnosis**: Code exchange failed - likely redirect URL mismatch or expired code.

**Action**: Check Supabase redirect URLs include `https://www.sipher.in/auth/callback`

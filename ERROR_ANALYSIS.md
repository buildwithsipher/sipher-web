# 405/406 Error Analysis

## Why These Errors Occur

### **HTTP 406 (Not Acceptable) - Content Negotiation Failure**

The 406 error means the server cannot produce a response matching the `Accept` header sent by the client.

**Root Causes:**

1. **CORS Preflight Failure**
   - Browser sends OPTIONS request first
   - If OPTIONS fails or returns wrong headers, browser blocks POST
   - Browser may show 406 if it can't negotiate content type

2. **Missing Content-Type in Response**
   - Client sends `Accept: application/json`
   - Server must respond with `Content-Type: application/json`
   - If missing, browser treats it as 406

3. **Middleware Interference**
   - Middleware might be modifying headers
   - Security headers (CSP) might conflict with API responses

### **HTTP 405 (Method Not Allowed) - Wrong HTTP Method**

The 405 error means the HTTP method (GET/POST/PUT/etc.) is not allowed for this route.

**Root Causes:**

1. **Route Handler Not Registered**
   - Next.js hasn't loaded the route file
   - Build cache issue
   - Route file syntax error preventing export

2. **Request Method Mismatch**
   - Client sending GET instead of POST
   - Form submission defaulting to GET
   - Redirect converting POST → GET

3. **Middleware Redirecting**
   - Middleware might be redirecting before route handler runs
   - Authentication middleware blocking request

## The Supabase Error Connection

The Supabase REST API error (`usscnyubdqlroyojivvy.supabase.co/rest/v1/waitlist_users`) suggests:

1. **Request is reaching the API route** (good sign)
2. **API route is calling Supabase** (expected behavior)
3. **But the API route might be returning 405/406 BEFORE Supabase call completes**

This means:
- The route handler IS being called
- But something is failing early in the handler
- Possibly during request validation or header checking

## Most Likely Scenarios

### Scenario 1: Deployment Not Complete
- **Fix**: Wait for Vercel deployment to finish
- **Check**: Verify latest commit is deployed

### Scenario 2: Browser Cache
- **Fix**: Hard refresh (Ctrl+Shift+R) or incognito mode
- **Check**: Network tab shows cached response

### Scenario 3: CORS Preflight Failing
- **Fix**: Ensure OPTIONS handler returns correct headers
- **Check**: Network tab shows OPTIONS request failing

### Scenario 4: Middleware Interference
- **Fix**: Ensure middleware skips API routes (already done)
- **Check**: Middleware logs show it's running on `/api/waitlist`

## Debugging Steps

1. **Check Network Tab**
   - Look for OPTIONS request (preflight)
   - Check if it returns 200 or fails
   - Verify POST request headers

2. **Check Server Logs**
   - Look for `[Waitlist API]` logs
   - Verify route handler is being called
   - Check for any errors before Supabase call

3. **Check Deployment**
   - Verify latest commit is deployed
   - Check Vercel build logs
   - Ensure no build errors

4. **Test with curl/Postman**
   - Bypass browser cache
   - Test OPTIONS and POST separately
   - Verify headers are correct

## Solutions Applied

1. ✅ Added `Accept` to CORS allowed headers
2. ✅ Added `Content-Type: application/json` to all responses
3. ✅ Middleware now skips API routes
4. ✅ Added logging for debugging
5. ✅ Fixed OPTIONS handler

## Next Steps

1. **Deploy the middleware fix** (skip API routes)
2. **Clear browser cache** or test in incognito
3. **Check server logs** for `[Waitlist API]` messages
4. **Verify deployment** is complete

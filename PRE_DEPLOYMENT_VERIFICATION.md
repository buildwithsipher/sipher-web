# ✅ Pre-Deployment Verification

## 🔍 **Quick Verification Checklist**

Run through these checks before deploying:

### **1. Environment Variables Check**

Verify these are set (or will be set in production):

```bash
# Check if variables are referenced correctly
grep -r "process.env" src/app/api
grep -r "NEXT_PUBLIC" src
```

**Required Variables:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `ADMIN_SECRET`
- ✅ `RESEND_API_KEY`
- ✅ `NEXT_PUBLIC_APP_URL` (IMPORTANT for magic links!)

### **2. Magic Link Redirect**

The magic link in approval emails uses:
```typescript
redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
```

**⚠️ Critical:** Make sure `NEXT_PUBLIC_APP_URL` is set to your production domain!

### **3. OAuth Callback URL**

In Supabase Dashboard → Authentication → URL Configuration:
- Add: `https://your-domain.com/auth/callback`
- Remove localhost URLs (or keep for dev)

### **4. Build Test**

```bash
npm run build
```

Should complete without errors.

### **5. Key Files to Review**

- [ ] `src/app/(auth)/auth/callback/route.ts` - OAuth callback
- [ ] `src/app/api/admin/approve/route.ts` - Approval endpoint
- [ ] `src/app/api/waitlist/route.ts` - Waitlist signup
- [ ] `src/lib/email/templates.ts` - Email templates
- [ ] `.env.local` - Environment variables (don't commit!)

---

## 🎯 **What to Test After Deployment**

1. **Homepage** - Loads correctly
2. **OAuth** - Google login works
3. **Onboarding** - Form submission works
4. **Waitlist Dashboard** - User data displays
5. **Admin Panel** - Can approve users
6. **Email** - Approval email received
7. **Magic Link** - Clicking link logs user in

---

**Ready to deploy! 🚀**


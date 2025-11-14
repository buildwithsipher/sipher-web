# 🔐 Vercel Environment Variables Setup

## ⚠️ Build Error
The build failed because `RESEND_API_KEY` (and other environment variables) are not set in Vercel.

## ✅ Required Environment Variables

Add these in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

### 1. Supabase (Required)
```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
```

### 2. Resend Email (Required)
```
RESEND_API_KEY=your-resend-api-key
```

### 3. Admin Secret (Required)
```
ADMIN_SECRET=your-secure-admin-secret
```

### 4. App URL (Required for Magic Links)
```
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
```
Or your custom domain if you have one set up.

---

## 📋 Step-by-Step Instructions

### Step 1: Go to Vercel Dashboard
1. Go to: https://vercel.com/dashboard
2. Select your project: `sipher-web`

### Step 2: Add Environment Variables
1. Click **Settings** tab
2. Click **Environment Variables** in the sidebar
3. Add each variable:
   - **Name**: (e.g., `RESEND_API_KEY`)
   - **Value**: (paste your actual key)
   - **Environment**: Select **Production**, **Preview**, and **Development** (or just Production for now)
4. Click **Save**
5. Repeat for all variables above

### Step 3: Redeploy
1. After adding all variables, go to **Deployments** tab
2. Click the **⋯** menu on the failed deployment
3. Click **Redeploy**
4. Or push a new commit to trigger a new build

---

## 🔍 Where to Find Your Keys

### Supabase Keys
1. Go to: https://supabase.com/dashboard
2. Select your project
3. **Settings** → **API**
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` = service_role key (⚠️ Keep secret!)

### Resend API Key
1. Go to: https://resend.com/api-keys
2. Create or copy your API key

### Admin Secret
- Generate a secure random string:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```

### App URL
- Use your Vercel deployment URL: `https://sipher-web.vercel.app`
- Or your custom domain if configured

---

## ✅ Quick Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` added
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` added
- [ ] `SUPABASE_SERVICE_ROLE_KEY` added
- [ ] `RESEND_API_KEY` added
- [ ] `ADMIN_SECRET` added
- [ ] `NEXT_PUBLIC_APP_URL` added
- [ ] All variables set for **Production** environment
- [ ] Redeployed the project

---

## 🚀 After Adding Variables

Once all variables are added:
1. **Redeploy** the project
2. The build should succeed
3. Your app will be live!

---

**Note:** Environment variables are encrypted and only visible to project members with access.


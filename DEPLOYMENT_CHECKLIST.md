# 🚀 Deployment Checklist - Sipher Waitlist

## ✅ **Pre-Deployment Checklist**

### **1. Environment Variables**

Ensure all required environment variables are set in your hosting platform (Vercel/Netlify/etc.):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin
ADMIN_SECRET=your-secure-admin-secret

# Email (Resend)
RESEND_API_KEY=your-resend-api-key

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### **2. Supabase Configuration**

#### **OAuth Settings:**
- [ ] Google OAuth configured in Supabase Dashboard
- [ ] Redirect URL added: `https://your-domain.com/auth/callback`
- [ ] OAuth credentials (Client ID, Client Secret) set

#### **Email Settings:**
- [ ] Email templates configured (if using Supabase email)
- [ ] SMTP settings configured (if using custom SMTP)
- [ ] Email confirmation disabled (since we use OAuth)

#### **Database:**
- [ ] All migrations applied
- [ ] RLS policies tested
- [ ] Indexes created for performance

### **3. Resend Email Configuration**

- [ ] Domain verified (`updates.sipher.in`)
- [ ] DNS records added (SPF, DKIM, DMARC)
- [ ] API key generated and added to environment variables
- [ ] Test email sent successfully

### **4. Domain & SSL**

- [ ] Domain connected to hosting platform
- [ ] SSL certificate active (automatic on Vercel/Netlify)
- [ ] Custom domain configured
- [ ] `NEXT_PUBLIC_APP_URL` matches your domain

### **5. Security**

- [ ] `ADMIN_SECRET` is strong and unique
- [ ] Service role key is secure (never exposed to client)
- [ ] RLS policies are correct
- [ ] No sensitive data in client-side code

### **6. Testing Before Deploy**

- [ ] Local OAuth flow works
- [ ] Waitlist signup works
- [ ] Admin panel accessible
- [ ] Approval flow works
- [ ] Email delivery works (test with real email)

---

## 🚀 **Deployment Steps**

### **Step 1: Build & Test Locally**

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test production build locally
npm start
```

### **Step 2: Deploy to Platform**

#### **Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Or connect your GitHub repo to Vercel for automatic deployments.

#### **Netlify:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### **Step 3: Configure Environment Variables**

Add all environment variables in your hosting platform's dashboard:
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables

### **Step 4: Update Supabase Redirect URLs**

In Supabase Dashboard → Authentication → URL Configuration:
- Add production URL: `https://your-domain.com`
- Add callback URL: `https://your-domain.com/auth/callback`

---

## ✅ **Post-Deployment Testing**

### **1. Basic Functionality**
- [ ] Homepage loads
- [ ] Navigation works
- [ ] Footer links work
- [ ] Mobile responsive

### **2. Authentication Flow**
- [ ] "Join Waitlist" button works
- [ ] Google OAuth redirects correctly
- [ ] OAuth callback works
- [ ] User redirected to onboarding

### **3. Onboarding**
- [ ] Onboarding form loads
- [ ] Form validation works
- [ ] Submission works
- [ ] Redirect to waitlist dashboard

### **4. Waitlist Dashboard**
- [ ] Dashboard loads for authenticated users
- [ ] User data displays correctly
- [ ] Profile editing works
- [ ] Real-time updates work

### **5. Admin Panel**
- [ ] Admin panel accessible at `/admin`
- [ ] Admin secret prompt works
- [ ] User listing works
- [ ] Approval flow works
- [ ] Email sent after approval

### **6. Email Delivery**
- [ ] Welcome email received (after signup)
- [ ] Approval email received (after admin approval)
- [ ] Magic link in email works
- [ ] Email styling looks good

### **7. Magic Link**
- [ ] Magic link redirects correctly
- [ ] User logged in automatically
- [ ] Redirected to `/dashboard`
- [ ] Session persists

---

## 🔧 **Production Optimizations**

### **Performance:**
- [ ] Images optimized
- [ ] Code splitting working
- [ ] Lazy loading implemented
- [ ] Bundle size reasonable

### **SEO:**
- [ ] Meta tags set
- [ ] Sitemap generated
- [ ] Robots.txt configured
- [ ] Open Graph tags added

### **Analytics:**
- [ ] Vercel Analytics enabled (if using)
- [ ] Error tracking configured
- [ ] Performance monitoring set up

---

## 📋 **What's Ready for Production**

✅ **Landing Page**
- Hero section
- Problem/Solution sections
- Interactive demos
- Waitlist CTA

✅ **Authentication**
- Google OAuth
- Onboarding flow
- Session management

✅ **Waitlist Dashboard**
- Queue position
- Profile editing
- Live pulse
- Roadmap & manifesto

✅ **Admin Panel**
- User management
- Approval flow
- Email sending

✅ **Email Templates**
- Welcome email
- Approval email with magic link

---

## ⚠️ **What's Not Ready (Can Build After Deploy)**

🚧 **Main Dashboard (`/dashboard`)**
- BuilderLog interface
- Daily work logging
- ProofCard calculation
- Activity tracking
- Sharing functionality

**This is fine!** Users will be on the waitlist, and you can build these features while they wait.

---

## 🎯 **Recommended Deployment Strategy**

### **Phase 1: Deploy Waitlist (Now)**
1. Deploy current codebase
2. Test complete waitlist flow
3. Start collecting signups
4. Approve early users manually

### **Phase 2: Build Main Features (While Users Wait)**
1. Build BuilderLog interface
2. Implement daily logging
3. Calculate ProofCard scores
4. Add sharing features

### **Phase 3: Launch Main Dashboard**
1. Test with approved users
2. Gather feedback
3. Iterate and improve
4. Open to more users

---

## 🚨 **Important Notes**

1. **Magic Links:** Make sure `NEXT_PUBLIC_APP_URL` is set to your production domain
2. **OAuth Redirects:** Update Supabase redirect URLs to production
3. **Email Domain:** Verify `updates.sipher.in` is fully configured in Resend
4. **Admin Secret:** Use a strong, unique secret for production
5. **Database:** Ensure production Supabase project is separate or properly secured

---

## 📞 **Support & Monitoring**

After deployment:
- Monitor error logs
- Check email delivery rates
- Track user signups
- Monitor OAuth success rate
- Watch for any 404s or errors

---

**You're ready to deploy! 🚀**


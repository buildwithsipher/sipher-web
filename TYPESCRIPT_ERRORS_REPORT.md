# TypeScript State Management Errors Report

Generated: $(date)

## Summary

This report identifies potential TypeScript errors related to state management, Supabase queries, and form handling patterns that could cause build errors or runtime issues.

---

## 🔴 HIGH PRIORITY - Build Errors

### 1. Supabase Query Without Null Check

**File:** `src/app/(auth)/onboarding/welcome/page.tsx:47-58`
**Issue:** Supabase query result used without checking for error or null
**Risk:** TypeScript build error, potential runtime error

```typescript
// ❌ CURRENT (Line 47-51)
const { data: waitlistData } = await supabase
  .from('waitlist_users')
  .select('*')
  .eq('email', authUser.email)
  .single()

if (!waitlistData) {
  // Checks null but not error
  router.push('/?error=waitlist-entry-not-found')
  return
}
setWaitlistUser(waitlistData)
```

**Fix Required:**

```typescript
// ✅ SHOULD BE
const { data: waitlistData, error } = await supabase
  .from('waitlist_users')
  .select('*')
  .eq('email', authUser.email)
  .single()

if (error || !waitlistData) {
  router.push('/?error=waitlist-entry-not-found')
  return
}
setWaitlistUser(waitlistData)
```

**Priority:** HIGH - Could cause build error if TypeScript strict mode catches this

---

### 2. Settings Page Profile Query

**File:** `src/app/(app)/settings/page.tsx:37-43`
**Issue:** Profile data set without null check
**Risk:** TypeScript build error

```typescript
// ❌ CURRENT (Line 37-43)
const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()

setProfile(profileData) // profileData could be null
```

**Fix Required:**

```typescript
// ✅ SHOULD BE
const { data: profileData, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

if (error || !profileData) {
  toast.error('Failed to load profile')
  setLoading(false)
  return
}
setProfile(profileData)
```

**Priority:** HIGH - Already fixed with helper function, but query still needs error check

---

## 🟡 MEDIUM PRIORITY - Potential Runtime Errors

### 3. EditForm State Updates (Multiple Locations)

**File:** `src/app/(marketing)/waitlist/dashboard/page.tsx`
**Locations:** Lines 718, 730, 741, 763, 775, 787, 800
**Issue:** Spreading `editForm` without null check (though editForm is initialized, TypeScript may not know)
**Risk:** Runtime error if editForm becomes undefined

```typescript
// ❌ CURRENT (Multiple locations)
onChange={e => setEditForm({ ...editForm, name: e.target.value })}
onChange={e => setEditForm({ ...editForm, startup_name: e.target.value })}
onChange={e => setEditForm({ ...editForm, startup_stage: value })}
// ... 4 more similar patterns
```

**Current State Definition:**

```typescript
const [editForm, setEditForm] = useState({
  name: '',
  startup_name: '',
  startup_stage: '',
  city: '',
  what_building: '',
  website_url: '',
  linkedin_url: '',
})
```

**Status:** ✅ SAFE - editForm is initialized with default object, not null
**Priority:** LOW - No immediate risk, but could be improved with helper function

**Recommended Improvement:**

```typescript
const updateEditForm = (updates: Partial<typeof editForm>) => {
  setEditForm(prev => ({ ...prev, ...updates }))
}

// Then use:
onChange={e => updateEditForm({ name: e.target.value })}
```

---

### 4. LocalData State Updates

**File:** `src/components/onboarding/screens/screen3-profile.tsx`
**Locations:** Lines 78, 80, 224, 242, 258, 292, 310, 330, 337, 340, 351, 373, 380, 383, 394
**Issue:** Spreading `localData` in multiple places
**Risk:** Low - localData is initialized, but pattern could be improved

```typescript
// ❌ CURRENT (Multiple locations)
setLocalData({ ...localData, city: sanitized })
setLocalData({ ...localData, tagline: sanitized })
// ... 13 more similar patterns
```

**Current State Definition:**

```typescript
const [localData, setLocalData] = useState({
  name: formData.name || '',
  startupName: formData.startupName || '',
  // ... other fields
})
```

**Status:** ✅ SAFE - localData is initialized
**Priority:** LOW - No immediate risk, but could use helper function for consistency

**Recommended Improvement:**

```typescript
const updateLocalData = (updates: Partial<typeof localData>) => {
  setLocalData(prev => ({ ...prev, ...updates }))
}
```

---

## 🟢 LOW PRIORITY - Type Warnings

### 5. Settings Page - Already Fixed ✅

**File:** `src/app/(app)/settings/page.tsx`
**Status:** ✅ FIXED - Uses helper function `updateProfile` with null check
**Note:** Query still needs error check (see #2 above)

---

## Files Requiring Attention

### High Priority (Fix Immediately)

1. `src/app/(auth)/onboarding/welcome/page.tsx` - Add error check to Supabase query
2. `src/app/(app)/settings/page.tsx` - Add error check to Supabase query

### Medium Priority (Improve Pattern)

3. `src/app/(marketing)/waitlist/dashboard/page.tsx` - Consider helper function for editForm updates (7 locations)
4. `src/components/onboarding/screens/screen3-profile.tsx` - Consider helper function for localData updates (15 locations)

### Low Priority (Code Quality)

5. All files with nullable state - Ensure consistent patterns

---

## Patterns to Follow

### ✅ GOOD: Helper Function Pattern

```typescript
const updateState = (updates: Partial<StateType>) => {
  if (!state) return
  setState({ ...state, ...updates })
}
```

### ✅ GOOD: Supabase Query with Error Check

```typescript
const { data, error } = await supabase.from('table').select().single()
if (error || !data) {
  // Handle error
  return
}
setState(data)
```

### ✅ GOOD: Functional State Update

```typescript
setState(prev => ({ ...prev, ...updates }))
```

---

## Recommendations

1. **Immediate Actions:**
   - Fix Supabase queries in `onboarding/welcome/page.tsx` and `settings/page.tsx`
   - Add error handling to all Supabase queries

2. **Code Quality Improvements:**
   - Create helper functions for state updates in dashboard and onboarding screens
   - Standardize on functional state updates: `setState(prev => ({ ...prev, ...updates }))`

3. **Prevention:**
   - The new `.cursorrules` section should prevent future errors
   - Consider adding ESLint rules to catch these patterns

---

## Files Analyzed

- ✅ `src/app/(app)/settings/page.tsx` - Fixed with helper function
- ⚠️ `src/app/(auth)/onboarding/welcome/page.tsx` - Needs error check
- ⚠️ `src/app/(marketing)/waitlist/dashboard/page.tsx` - Multiple editForm updates (safe but could improve)
- ⚠️ `src/components/onboarding/screens/screen3-profile.tsx` - Multiple localData updates (safe but could improve)
- ✅ `src/app/(app)/admin/page.tsx` - Already handles errors properly
- ✅ `src/app/(marketing)/waitlist/dashboard/page.tsx` - fetchUserData properly checks errors

---

**Total Issues Found:** 2 high priority, 2 medium priority (code quality)

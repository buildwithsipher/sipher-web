# Lint Cleanup Task

## Overview

This document outlines the systematic cleanup of 279 pre-existing lint issues (134 errors, 145 warnings) identified in the codebase.

## Priority Order

### 🔴 Critical (Fix First - Can Cause Bugs)

1. **React Hooks Purity Violations** (~30+ errors)
   - **Issue:** `react-hooks/purity` - Calling impure functions during render
   - **Impact:** Can cause unpredictable re-renders and bugs
   - **Files:**
     - `src/components/landing/hero.tsx:19` - `Date.now()` in useRef
     - `src/components/landing/pulse/ActivityStream.tsx:34-41` - Multiple `Math.random()`
     - `src/components/landing/pulse/ExecutionActivityLabels.tsx:36-43` - Multiple `Math.random()`
     - `src/components/landing/pulse/PulseDots.tsx:24` - `Math.random()`
     - `src/components/onboarding/Screen5.tsx:42-54` - Multiple `Math.random()`
     - `src/components/onboarding/enhancements/particle-burst.tsx:59` - `Math.random()`
   - **Solution:** Move random generation to `useMemo` or `useState` with `useEffect`

2. **React Hooks State Management** (2 errors)
   - **Issue:** `react-hooks/set-state-in-effect` - Calling setState synchronously in effects
   - **Files:**
     - `src/components/onboarding/enhancements/accessibility.tsx:92`
     - `src/contexts/SipherEnergyContext.tsx:65`
   - **Solution:** Use callback pattern or move state initialization outside effect

### 🟡 High Priority (Type Safety)

3. **TypeScript `any` Types** (~50+ errors)
   - **Issue:** `@typescript-eslint/no-explicit-any`
   - **Impact:** Reduces type safety, can hide bugs
   - **Files:** API routes, components, lib utilities
   - **Solution:** Replace with proper types or `unknown` with type guards

### 🟢 Medium Priority (Code Quality)

4. **Unused Variables/Imports** (~60+ warnings)
   - **Issue:** `@typescript-eslint/no-unused-vars`
   - **Impact:** Code cleanliness, bundle size
   - **Solution:** Remove unused code or prefix with `_` if intentionally unused

5. **React Unescaped Entities** (~40+ errors)
   - **Issue:** `react/no-unescaped-entities`
   - **Impact:** Potential rendering issues, accessibility
   - **Solution:** Use `&apos;`, `&quot;`, or template literals

6. **Next.js Image Optimization** (6 warnings)
   - **Issue:** `@next/next/no-img-element`
   - **Impact:** Performance, LCP scores
   - **Solution:** Replace `<img>` with Next.js `<Image />` component

### 🔵 Low Priority (Best Practices)

7. **React Hooks Exhaustive Dependencies** (~10+ warnings)
   - **Issue:** `react-hooks/exhaustive-deps`
   - **Impact:** Potential stale closures
   - **Solution:** Add missing dependencies or use `useCallback`/`useMemo`

8. **Other Issues**
   - `react-hooks/immutability` - `src/components/footer/SipherFooter.tsx:45`
   - `@typescript-eslint/no-require-imports` - `tailwind.config.ts:80`

## Implementation Strategy

### Phase 1: Critical Fixes (Week 1)

- Fix all React hooks purity violations
- Fix React hooks state management issues
- **Estimated Time:** 4-6 hours

### Phase 2: Type Safety (Week 2)

- Replace `any` types with proper types
- Add type guards where needed
- **Estimated Time:** 8-12 hours

### Phase 3: Code Quality (Week 3)

- Remove unused variables/imports
- Fix unescaped entities
- Replace `<img>` with `<Image />`
- **Estimated Time:** 6-8 hours

### Phase 4: Best Practices (Week 4)

- Fix exhaustive dependencies
- Fix remaining issues
- **Estimated Time:** 4-6 hours

## Testing Strategy

After each phase:

1. Run `npm run lint` to verify fixes
2. Run `npm run build` to ensure no breaking changes
3. Manual testing of affected components
4. Review changes in PR

## Success Criteria

- ✅ `npm run lint` passes with 0 errors
- ✅ `npm run build` passes successfully
- ✅ No functional regressions
- ✅ All tests pass (if test suite exists)

## Notes

- Some `any` types may be intentional (e.g., error handlers). Use `unknown` with type guards instead.
- `Math.random()` in animations may need to be preserved for visual variety. Consider using seeded random or moving to `useMemo`.
- Unused imports from component libraries may be kept for future use if they're commonly needed.

## Related Files

- `LINT_STATUS.md` - Current lint status documentation
- `.github/workflows/lint.yml` - CI lint workflow
- `eslint.config.mjs` - ESLint configuration

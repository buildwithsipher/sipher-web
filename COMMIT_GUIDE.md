# Commit Guide

## Recommended Commit Strategy

An advanced developer would create **focused, logical commits** that tell a story:

### Option 1: Single Comprehensive Commit (Simpler)

```bash
git add .
git commit -m "feat: improve codebase quality and fix onboarding issues

- Setup pre-commit hooks with Husky and lint-staged
- Configure Prettier and format entire codebase
- Fix mobile onboarding duplicate buttons
- Resolve React hooks purity violations
- Improve TypeScript type safety
- Remove 47 unnecessary files
- Add comprehensive documentation
- Enhance developer experience with new npm scripts

Fixes:
- Mobile button duplication in onboarding flow
- API JSON parsing errors (406/405)
- React hooks purity violations (Math.random, Date.now)
- TypeScript any types in onboarding components

Improvements:
- Pre-commit hooks for code quality
- Consistent code formatting
- Better error handling
- Enhanced type safety"
```

### Option 2: Multiple Focused Commits (Better for Review)

```bash
# 1. Repository cleanup
git add -A
git commit -m "chore: remove unnecessary documentation and unused files

- Remove 44 temporary documentation files
- Delete unused scripts and source files
- Remove duplicate Screen5 component
- Clean up repository structure"

# 2. Developer experience setup
git add .husky .prettierrc .prettierignore .nvmrc .github package.json
git commit -m "feat: setup pre-commit hooks and code formatting

- Install and configure Husky for git hooks
- Setup lint-staged for staged file linting
- Configure Prettier with project standards
- Add .nvmrc for Node version consistency
- Create GitHub Actions lint workflow
- Enhance npm scripts (lint:fix, type-check, format, audit)"

# 3. Documentation organization
git add docs/ QUICK_REFERENCE.md SETUP_COMPLETE.md
git commit -m "docs: organize documentation and create setup guides

- Move technical docs to docs/ folder
- Create documentation index
- Add setup and reference guides
- Document lint status and cleanup plan"

# 4. Bug fixes
git add src/components/onboarding src/app/api/waitlist src/app/(marketing)/waitlist
git commit -m "fix: resolve mobile onboarding and API error handling

- Fix duplicate buttons on mobile onboarding
- Hide screen navigation buttons on mobile (< 768px)
- Fix API JSON parsing errors with safe parsing
- Add GET handler for unsupported methods
- Improve error messages and handling"

# 5. Code quality improvements
git add src/components/onboarding/enhancements src/components/onboarding/onboarding-flow.tsx
git commit -m "fix: resolve React hooks violations and improve type safety

- Fix Math.random() purity violations (useMemo pattern)
- Fix Date.now() in useRef (use new Date().getTime())
- Fix setState in effect (move to useState initializer)
- Replace any types with proper interfaces
- Remove unused imports and variables
- Add null safety checks"

# 6. Code formatting (if not already committed)
git add .
git commit -m "style: format codebase with Prettier

- Apply Prettier formatting to all files
- Ensure consistent code style
- No functional changes"
```

## Pre-Commit Hook Test

Before committing, test that hooks work:

```bash
# Make a small test change
echo "// test" >> src/test.ts

# Stage it
git add src/test.ts

# Try to commit (hook should run)
git commit -m "test: verify pre-commit hook"

# If hook works, you'll see lint-staged run
# Then remove test file
git reset HEAD~1
rm src/test.ts
```

## Commit Message Best Practices

### Format

```
<type>: <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `chore`: Maintenance tasks
- `docs`: Documentation
- `style`: Code formatting
- `refactor`: Code restructuring
- `perf`: Performance improvements
- `test`: Adding tests

### Example

```
fix: resolve mobile onboarding duplicate buttons

On mobile devices, navigation buttons were appearing twice:
- Once in each screen component
- Once in MobileBottomNav

Solution: Hide screen navigation buttons on mobile (< 768px)
using `hidden md:flex` classes. MobileBottomNav handles
all navigation on mobile devices.

Fixes: Mobile UX issue where users saw duplicate buttons
```

## Verification Before Push

```bash
# 1. Check what will be committed
git status

# 2. Review changes
git diff --cached

# 3. Verify build
npm run build

# 4. Verify types
npm run type-check

# 5. Check for any uncommitted changes
git status
```

## Push Strategy

```bash
# Push to feature branch (if using)
git push origin feature/onboarding-improvements

# Or push to main (if direct)
git push origin main
```

## After Push

1. **Create PR** (if using feature branch)
   - Add detailed description
   - Link to related issues
   - Request review

2. **Monitor CI**
   - Check GitHub Actions status
   - Fix any CI failures

3. **Test in Staging**
   - Deploy to staging environment
   - Test onboarding flow
   - Verify all fixes work

4. **Deploy to Production**
   - After PR approval
   - Monitor for errors
   - Check analytics

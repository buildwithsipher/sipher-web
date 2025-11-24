# Pre-Commit Hooks Setup Guide

## Quick Setup (Recommended)

### 1. Install Dependencies

```bash
npm install --save-dev husky lint-staged
```

### 2. Initialize Husky

```bash
npx husky init
```

### 3. Configure lint-staged

Add to `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md}": ["prettier --write"]
  }
}
```

### 4. Create Pre-Commit Hook

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
npm run type-check
```

### 5. Make Executable

```bash
chmod +x .husky/pre-commit
```

## Alternative: Manual Setup

### Create `.husky/pre-commit` manually:

```bash
mkdir -p .husky
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# Run type check
npm run type-check
EOF

chmod +x .husky/pre-commit
```

## Optional: Prettier Setup

### 1. Install Prettier

```bash
npm install --save-dev prettier
```

### 2. Create `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "avoid"
}
```

### 3. Create `.prettierignore`

```
node_modules
.next
out
build
*.min.js
```

## Benefits

✅ **Catch issues early** - Before code reaches the repo  
✅ **Consistent formatting** - Automatic code formatting  
✅ **Type safety** - TypeScript errors caught before commit  
✅ **Faster reviews** - Less back-and-forth on formatting

## Bypassing Hooks (When Needed)

If you need to bypass hooks in an emergency:

```bash
git commit --no-verify -m "Emergency fix"
```

⚠️ **Use sparingly** - Only for true emergencies

## Troubleshooting

### Hook not running?

1. Check if `.husky/pre-commit` exists and is executable
2. Verify `husky` is installed
3. Run `npx husky install` to reinstall hooks

### Type check too slow?

- Consider running type-check only on CI
- Or use `tsc --noEmit --incremental` for faster checks

## Next Steps

After setup:

1. Test with a small commit
2. Verify hooks run correctly
3. Update team documentation
4. Consider adding commit message linting (commitlint)

# Audit: Middleware — Missing Protected Routes & Broken Path Matching

**Severity:** HIGH (`/admin` missing) / MEDIUM (`/activity`, path matching)
**Status:** Open
**File:** `src/middleware.ts`

---

## Problem 1 — `/admin` Missing from `protectedRoutes`

The `protectedRoutes` array does not include `/admin`. Unauthenticated users who navigate directly to `/en/admin` will reach the admin layout server component before being redirected. This causes unnecessary database calls and could expose error information.

```typescript
// src/middleware.ts — current
const protectedRoutes = [
  '/dashboard',
  '/community',
  '/events',
  '/academy',
  '/documents',
  '/cases',
  '/blog',
  '/profile',
  '/settings',
  '/notifications',
  // ❌ missing: '/admin'
  // ❌ missing: '/activity'
]
```

---

## Problem 2 — `/activity` Missing from `protectedRoutes`

The activity page exists at `src/app/[locale]/(dashboard)/activity/` but is not in the protected routes list. The dashboard layout will catch this eventually but middleware should be first line of defense.

---

## Problem 3 — `pathname.includes(route)` Is Overly Broad

```typescript
// src/middleware.ts:67 — current
const isProtectedRoute = protectedRoutes.some((route) => pathname.includes(route))
```

`String.includes()` matches anywhere in the path string. Examples of false positives:
- `/en/blog-about-our-events` → matches `/events` and `/blog`
- `/en/my-documents-overview` → matches `/documents`
- A public page with "cases" in its name would be incorrectly treated as protected

The correct check should use a locale-aware prefix match.

---

## Fix

```typescript
// src/middleware.ts

const protectedRoutes = [
  '/dashboard',
  '/community',
  '/events',
  '/academy',
  '/documents',
  '/cases',
  '/blog',
  '/profile',
  '/settings',
  '/notifications',
  '/activity',   // ✅ add
  '/admin',      // ✅ add
]

// Replace the isProtectedRoute check:
const isProtectedRoute = protectedRoutes.some((route) =>
  pathname === `/${locale}${route}` || pathname.startsWith(`/${locale}${route}/`)
)
```

---

## Current Code (line 53–68)

```typescript
// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/community',
  '/events',
  '/academy',
  '/documents',
  '/cases',
  '/blog',
  '/profile',
  '/settings',
  '/notifications',
]

// Check if current path is protected
const isProtectedRoute = protectedRoutes.some((route) => pathname.includes(route))
```

---

## After Fix

```typescript
const protectedRoutes = [
  '/dashboard',
  '/community',
  '/events',
  '/academy',
  '/documents',
  '/cases',
  '/blog',
  '/profile',
  '/settings',
  '/notifications',
  '/activity',
  '/admin',
]

const isProtectedRoute = protectedRoutes.some((route) =>
  pathname === `/${locale}${route}` || pathname.startsWith(`/${locale}${route}/`)
)
```

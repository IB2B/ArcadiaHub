# Audit: Dead Code & Unused Imports

**Severity:** LOW–MEDIUM
**Status:** Open
**Files:** `src/lib/data/cases.ts`, `src/lib/auth/actions.ts`, `src/lib/database/server.ts`, `src/lib/data/index.ts`, `src/lib/data/admin.ts`, `src/lib/data/dashboard.ts`

---

## Issue 1 — Unused Types in `cases.ts`

### `src/lib/data/cases.ts` — lines 7–8

```typescript
type CaseInsert = TablesInsert<'cases'>  // never used
type CaseUpdate = TablesUpdate<'cases'>  // never used
```

Both types are declared but never referenced anywhere in the file or project. Case creation uses an inline object, and case updates also use inline objects.

**Fix:** Remove both type declarations.

---

## Issue 2 — Dead `getSession()` Function

### `src/lib/auth/actions.ts` — ~line 87

```typescript
export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
```

- Not imported by any file in the project
- Uses the insecure `getSession()` Supabase method (see [04-insecure-getsession.md](./04-insecure-getsession.md))

**Fix:** Remove this function entirely.

---

## Issue 3 — Duplicate `getCurrentProfile()` Implementations

Three separate files each define `getCurrentProfile()`:

| File | Status |
|------|--------|
| `src/lib/database/server.ts` | Dead — not imported anywhere |
| `src/lib/auth/actions.ts` | Re-exported via `src/lib/auth/index.ts` |
| `src/lib/data/profiles.ts` | Used by layouts — this is the canonical one |

Having three implementations risks divergence. If one is updated, the others won't be.

**Fix:**
1. Remove `getCurrentProfile()` from `database/server.ts`
2. Remove `getCurrentProfile()` from `auth/actions.ts`
3. Update `src/lib/auth/index.ts` to re-export from `profiles.ts` if needed

---

## Issue 4 — Dead Barrel Export File

### `src/lib/data/index.ts`

```typescript
export * from './cases'
export * from './events'
// ...etc
```

This barrel file is never imported anywhere in the project. All files import from specific sub-modules (e.g., `@/lib/data/cases`).

**Fix:** Either remove the file entirely or start using it consistently as the single import point for data functions.

---

## Issue 5 — Unused Import in `admin.ts`

### `src/lib/data/admin.ts:4`

```typescript
import type { Database } from '@/types/database.types'  // never used
```

**Fix:** Remove the import.

---

## Issue 6 — Unused Imports in `dashboard.ts`

### `src/lib/data/dashboard.ts` — lines 17–19

```typescript
import type { AcademyContent } from '...'  // never used
import type { Document } from '...'        // never used
import type { BlogPost } from '...'        // never used
```

**Fix:** Remove the three unused type imports.

---

## Issue 7 — Unused `tNav` in Admin Cases New Page

### `src/app/[locale]/(admin)/admin/cases/new/page.tsx:8`

```typescript
const tNav = await getTranslations('navigation')  // never used
```

**Fix:** Remove the line.

---

## Issue 8 — Unused Imports in `PartnerForm.tsx`

### `src/app/[locale]/(admin)/admin/partners/PartnerForm.tsx` — lines 6–7

```typescript
import type { TablesInsert } from '@/types/database.types'  // unused
import { createPartner } from '@/lib/data/admin'            // unused
```

**Fix:** Remove both unused imports.

---

## Issue 9 — Unused `onMarkAllAsRead` Prop in `Header.tsx`

### `src/components/layout/Header.tsx:51`

```typescript
// Prop is declared in the interface but never called
onMarkAllAsRead?: () => void
```

**Fix:** Either implement the prop's usage or remove it from the interface.

---

## Summary

| File | Issue | Severity |
|------|-------|----------|
| `cases.ts:7-8` | Unused `CaseInsert`, `CaseUpdate` types | LOW |
| `auth/actions.ts:87` | Dead + insecure `getSession()` | HIGH |
| `database/server.ts` | Duplicate `getCurrentProfile()` | MEDIUM |
| `lib/data/index.ts` | Unused barrel export | LOW |
| `admin.ts:4` | Unused `Database` import | LOW |
| `dashboard.ts:17-19` | 3 unused type imports | LOW |
| `admin/cases/new/page.tsx:8` | Unused `tNav` | LOW |
| `PartnerForm.tsx:6-7` | 2 unused imports | LOW |
| `Header.tsx:51` | Unused prop | LOW |

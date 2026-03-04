# Audit: Import Issues — Non-Locale-Aware Navigation

**Severity:** HIGH (redirect) / MEDIUM (useRouter, usePathname, Link)
**Status:** Open
**Files:** 30+ files

---

## Problem

The project uses `next-intl` with `localePrefix: 'always'`, meaning all routes must include a locale prefix (e.g., `/en/dashboard`). The project exports locale-aware versions of navigation utilities from `src/navigation.ts`.

When `redirect`, `useRouter`, `usePathname`, or `Link` are imported directly from `next/navigation` or `next/link`, locale prefixes are **stripped from generated URLs**, causing:
- Redirects to `/login` instead of `/en/login` → 404 or redirect loop
- `router.push('/cases')` navigates to `/cases` instead of `/en/cases`
- `pathname` comparisons fail because the locale segment is unexpected

---

## Rule

```
// WRONG
import { redirect, useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

// CORRECT
import { redirect, useRouter, usePathname, Link } from '@/navigation'
```

> Exception: `notFound`, `useSearchParams`, `useParams` are NOT exported by next-intl and must still come from `next/navigation`.

---

## Affected Files — `redirect` (HIGH)

These cause locale-stripped redirects on auth flows:

| File | Line | Current Import | Impact |
|------|------|---------------|--------|
| `src/lib/auth/actions.ts` | 4 | `import { redirect } from 'next/navigation'` | Login/logout redirects lose locale |
| `src/app/[locale]/(admin)/admin/layout.tsx` | 1 | `import { redirect } from 'next/navigation'` | Unauthorized admin access redirects lose locale |
| `src/app/[locale]/(dashboard)/layout.tsx` | 1 | `import { redirect } from 'next/navigation'` | Unauthenticated dashboard redirects lose locale |
| `src/app/[locale]/(dashboard)/profile/page.tsx` | 1 | `import { redirect } from 'next/navigation'` | Profile auth guard loses locale |

> `src/app/page.tsx` uses `redirect` from `next/navigation` to redirect to `/${defaultLocale}` — this is acceptable as there is no locale context yet at the root.

---

## Affected Files — `useRouter` (MEDIUM)

| File | Line |
|------|------|
| `src/components/SessionTimeout.tsx` | 4 |
| `src/app/[locale]/(auth)/reset-password/page.tsx` | 5 |
| `src/app/[locale]/(dashboard)/profile/ProfilePageClient.tsx` | 5 |
| `src/app/[locale]/(admin)/admin/academy/AcademyClient.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/academy/[id]/AcademyForm.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/access-requests/AccessRequestsClient.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/blog/BlogClient.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/blog/[id]/BlogForm.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/events/EventsClient.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/events/[id]/EventForm.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/partners/PartnerForm.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/partners/PartnersClient.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/documents/DocumentsClient.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/documents/[id]/DocumentForm.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/cases/CasesClient.tsx` | ~5 |
| `src/app/[locale]/(admin)/admin/cases/[id]/CaseForm.tsx` | ~5 |
| `src/app/[locale]/(dashboard)/activity/ActivityPageClient.tsx` | ~5 |
| `src/app/[locale]/(dashboard)/academy/AcademyPageClient.tsx` | ~5 |
| `src/app/[locale]/(dashboard)/cases/CasesPageClient.tsx` | ~5 |
| `src/app/[locale]/(dashboard)/events/EventsPageClient.tsx` | ~5 |
| `src/app/[locale]/(dashboard)/documents/DocumentsPageClient.tsx` | ~5 |
| `src/app/[locale]/(dashboard)/community/CommunityPageClient.tsx` | ~5 |
| `src/app/[locale]/(dashboard)/blog/BlogPageClient.tsx` | ~5 |
| `src/components/cases/CaseFilters.tsx` | 4 |

---

## Affected Files — `usePathname` (MEDIUM)

| File | Line | Note |
|------|------|------|
| `src/components/layout/BottomNav.tsx` | 4 | Pathname comparisons for active nav item |
| `src/components/layout/Sidebar.tsx` | 4 | Pathname comparisons for active nav item |
| `src/components/cases/CaseFilters.tsx` | 4 | Used alongside `useRouter` |

---

## Affected Files — `Link` (MEDIUM)

| File | Line | Note |
|------|------|------|
| `src/app/[locale]/not-found.tsx` | 3 | Inside locale layout — links lose locale |

> `src/app/not-found.tsx` (root level) is outside locale context — using `next/link` is acceptable there.

---

## Fix Pattern

For each file, replace the import:

```typescript
// Before
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// After
import { useRouter, usePathname, redirect, Link } from '@/navigation'
```

If a file imports both locale-aware and non-locale-aware items:

```typescript
import { useRouter, usePathname, Link } from '@/navigation'
import { useSearchParams, notFound } from 'next/navigation' // these stay
```

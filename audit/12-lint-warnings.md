# Audit: ESLint Warnings (46)

**Severity:** LOW (warnings don't block builds but affect performance/quality)
**Status:** Open

---

## Warning Category 1 — `<img>` Instead of `next/image` (30+ occurrences)

**Rule:** `@next/next/no-img-element`

Using `<img>` instead of Next.js `<Image />` results in:
- No automatic image optimization (WebP/AVIF conversion)
- No lazy loading
- No automatic `srcset` for responsive images
- Higher LCP (Largest Contentful Paint) scores — hurts Core Web Vitals

### Affected Files

| File | Lines |
|------|-------|
| `(admin)/admin/access-requests/AccessRequestDetailModal.tsx` | 133 |
| `(admin)/admin/access-requests/AccessRequestsClient.tsx` | 239, 342 |
| `(admin)/admin/blog/BlogClient.tsx` | 191, 309 |
| `(auth)/request-access/page.tsx` | 463, 628 |
| `(dashboard)/academy/AcademyPageClient.tsx` | 313 |
| `(dashboard)/blog/BlogPageClient.tsx` | ~various |
| `(dashboard)/community/CommunityPageClient.tsx` | ~various |
| `(dashboard)/dashboard/DashboardPageClient.tsx` | ~various |
| `src/components/admin/` | Multiple files |
| `src/components/landing/LandingFooter.tsx` | 22 |
| `src/components/landing/LandingHeader.tsx` | 39 |
| `src/components/landing/PublicPageHeader.tsx` | 17 |
| `src/components/ui/Avatar.tsx` | 82 |
| `src/components/ui/FileUpload.tsx` | 210 |

### Fix Pattern

```typescript
// Before
<img src={logoUrl} alt={name} className="w-10 h-10 rounded-full" />

// After
import Image from 'next/image'
// ...
<Image src={logoUrl} alt={name} width={40} height={40} className="rounded-full" />
```

> For images with unknown dimensions (e.g., user-uploaded), use `fill` with a sized container:
> ```typescript
> <div className="relative w-10 h-10">
>   <Image src={logoUrl} alt={name} fill className="rounded-full object-cover" />
> </div>
> ```

> Supabase Storage URLs are already whitelisted in `next.config.ts` (`**.supabase.co`), so remote images will work with `next/image`.

---

## Warning Category 2 — `useMemo` Dependency Array

**File:** `src/app/[locale]/(admin)/admin/academy/AcademyClient.tsx:56`
**Rule:** `react-hooks/exhaustive-deps`

```typescript
// The 'yearOptions' array makes dependencies of useMemo change on every render
const yearOptions = [...]  // defined outside useMemo

const memoizedValue = useMemo(() => {
  // uses yearOptions
}, [yearOptions])  // ⚠️ yearOptions is recreated on every render
```

**Fix:** Move `yearOptions` inside the `useMemo` callback, or wrap it in its own `useMemo`:

```typescript
const yearOptions = useMemo(() => [...], [])

// OR move it inside the dependent useMemo
const memoizedValue = useMemo(() => {
  const yearOptions = [...]
  // use yearOptions here
}, [])
```

---

## Warning Category 3 — Unused Variables in Data Files

| File | Line | Variable |
|------|------|----------|
| `src/lib/data/admin.ts` | 4 | `Database` import |
| `src/lib/data/cases.ts` | 7 | `CaseInsert` type |
| `src/lib/data/cases.ts` | 8 | `CaseUpdate` type |
| `src/lib/data/dashboard.ts` | 17 | `AcademyContent` import |
| `src/lib/data/dashboard.ts` | 18 | `Document` import |
| `src/lib/data/dashboard.ts` | 19 | `BlogPost` import |

**Fix:** Remove all unused imports/types. These are also covered in [09-dead-code.md](./09-dead-code.md).

---

## Summary by Category

| Category | Count | Impact |
|----------|-------|--------|
| `<img>` instead of `next/image` | ~35 | Performance / Core Web Vitals |
| `useMemo` dependency issue | 1 | Potential unnecessary re-renders |
| Unused variables/imports | ~8 | Code cleanliness |
| **Total** | **~46** | |

---

## Recommended Approach

Fix `<img>` → `next/image` in batches by area:
1. **Admin area** (`(admin)/` client components)
2. **Dashboard area** (`(dashboard)/` client components)
3. **Landing & public pages** (`components/landing/`)
4. **Shared UI components** (`components/ui/Avatar.tsx`, `FileUpload.tsx`)

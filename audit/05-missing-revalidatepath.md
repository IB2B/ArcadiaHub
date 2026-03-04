# Audit: Missing `revalidatePath()` After Mutations

**Severity:** MEDIUM (data staleness) / LOW (notification counts)
**Status:** Open
**Files:** `src/lib/data/cases.ts`, `src/lib/data/profiles.ts`, `src/lib/data/notifications.ts`, `src/lib/data/accessRequests.ts`, `src/lib/data/blog.ts`

---

## Problem

Next.js App Router caches server-rendered pages. After a Server Action mutates data, `revalidatePath()` must be called to bust the cache and cause the page to re-fetch fresh data on the next visit.

Without `revalidatePath()`, users will see stale data after performing actions — the page won't reflect their changes until they do a hard refresh.

---

## Missing Calls by File

### `src/lib/data/cases.ts`

| Function | Line | Missing Path |
|----------|------|-------------|
| `createCase()` | ~123 | `revalidatePath('/[locale]/cases')` |
| `updateCaseStatus()` | ~155 | `revalidatePath('/[locale]/cases')` and `revalidatePath('/[locale]/cases/[id]')` |

### `src/lib/data/profiles.ts`

| Function | Line | Missing Path |
|----------|------|-------------|
| `updateProfile()` | ~35 | `revalidatePath('/[locale]/profile')` |
| `updateCurrentUserProfile()` | ~117 | `revalidatePath('/[locale]/profile')` |
| `uploadProfileLogo()` | ~142 | `revalidatePath('/[locale]/profile')` |

### `src/lib/data/notifications.ts`

| Function | Line | Missing Path |
|----------|------|-------------|
| `markAsRead()` | ~61 | `revalidatePath('/[locale]/notifications')` |
| `markAllAsRead()` | ~78 | `revalidatePath('/[locale]/notifications')` |
| `createNotification()` | ~99 | `revalidatePath('/[locale]/notifications')` |

### `src/lib/data/accessRequests.ts`

| Function | Line | Missing Path |
|----------|------|-------------|
| `approveAccessRequest()` | ~313 | `revalidatePath('/[locale]/admin/access-requests')` |
| `rejectAccessRequest()` | ~447 | `revalidatePath('/[locale]/admin/access-requests')` |
| `deleteAccessRequest()` | ~497 | `revalidatePath('/[locale]/admin/access-requests')` |

### `src/lib/data/blog.ts`

| Function | Line | Missing Path |
|----------|------|-------------|
| `incrementBlogViewCount()` | ~147 | `revalidatePath('/[locale]/blog/[slug]')` |

---

## Fix Pattern

```typescript
import { revalidatePath } from 'next/cache'

export async function createCase(data: ...) {
  const supabase = await createServerSupabaseClient()
  const { data: result, error } = await supabase.from('cases').insert(data).select().single()
  if (error) throw new Error(error.message)

  revalidatePath('/[locale]/cases')   // ✅ add this
  return result
}
```

> For paths with dynamic segments, Next.js accepts the segment pattern: `revalidatePath('/[locale]/cases/[id]')` or use `revalidatePath('/', 'layout')` to revalidate everything under the root layout.

---

## Note on Notifications

The `useNotifications` hook polls every 30 seconds, so missing `revalidatePath` on notification mutations is less critical — the count will auto-correct on the next poll. Still good practice to add it for immediate consistency.

# Audit: Supabase Service Client Misuse

**Severity:** MEDIUM
**Status:** Open
**File:** `src/lib/data/accessRequests.ts`

---

## Problem

Per project rules in CLAUDE.md: `createServiceSupabaseClient()` (which bypasses RLS) should only be used inside `src/lib/services/notificationService.ts`.

`accessRequests.ts` uses `createServiceSupabaseClient()` in **8 places**, many of which don't require RLS bypass because the caller is already verified as an admin.

---

## Occurrences in `src/lib/data/accessRequests.ts`

| Function | Line | Justification for Service Client? |
|----------|------|------------------------------------|
| `submitAccessRequest()` | ~70 | ✅ **Justified** — public form, no user session |
| `uploadAccessRequestFile()` | ~139 | ✅ **Justified** — public upload, no user session |
| `getAccessRequests()` | ~205 | ❌ **Not needed** — called by admin only, RLS allows admins to read |
| `getAccessRequest()` | ~250 | ❌ **Not needed** — same |
| `getPendingAccessRequestsCount()` | ~290 | ❌ **Not needed** — same |
| `approveAccessRequest()` | ~313 | ❌ **Not needed** — admin operation, RLS allows admins to update |
| `rejectAccessRequest()` | ~447 | ❌ **Not needed** — same |
| `deleteAccessRequest()` | ~497 | ❌ **Not needed** — same |

---

## Risk

Using the service client unnecessarily bypasses Row-Level Security, which is the last line of defense if the server action's manual auth check is ever bypassed. The principle of least privilege says: use the regular server client unless a specific RLS bypass is required.

---

## Fix

For admin functions, replace `createServiceSupabaseClient()` with `createServerSupabaseClient()`:

```typescript
// Before
export async function getAccessRequests() {
  const supabase = await createServiceSupabaseClient()
  // ...
}

// After
export async function getAccessRequests() {
  const supabase = await createServerSupabaseClient()
  // RLS will enforce that only admins can see all requests
  // ...
}
```

Keep `createServiceSupabaseClient()` only in:
- `submitAccessRequest()` (unauthenticated public submission)
- `uploadAccessRequestFile()` (unauthenticated public upload)
- `src/lib/services/notificationService.ts` (existing, correct usage)

---

## PostgREST Search Filter Injection

Also in `accessRequests.ts` (and many other data files), search input is interpolated directly into PostgREST `.or()` filter strings:

```typescript
// Vulnerable pattern (found in admin.ts, cases.ts, events.ts, documents.ts, blog.ts, academy.ts, profiles.ts, accessRequests.ts)
.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
```

Special characters like `.`, `,`, `(`, `)` in the search string can break the filter syntax. Sanitize before interpolating:

```typescript
const safeSearch = search.replace(/[.,()\[\]]/g, '')
.or(`title.ilike.%${safeSearch}%,description.ilike.%${safeSearch}%`)
```

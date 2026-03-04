# Audit: Insecure `getSession()` in Auth Actions

**Severity:** HIGH
**Status:** Open
**File:** `src/lib/auth/actions.ts` (~line 87)

---

## Problem

The file exports a `getSession()` function that internally calls `supabase.auth.getSession()`.

**Supabase's own documentation explicitly warns:**

> "Never trust `supabase.auth.getSession()` on the server. It reads the session from cookies/local storage without verifying it against the Supabase auth server. A malicious user could craft a fake session cookie and get through."

> "On the server, always use `supabase.auth.getUser()` which verifies the JWT with the Supabase server on every call."

The current `getSession()` export is:
1. **Insecure** — does not validate the token server-side
2. **Unused** — no files currently import and call it (dead code)
3. **A trap** — future developers may use it thinking it is the safe pattern

---

## Current Code (approx. lines 87–91)

```typescript
export async function getSession() {
  const supabase = await createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  return session
}
```

---

## Fix

Remove the `getSession()` function entirely. Any caller that needs the current user should use `getCurrentUser()` or `getCurrentProfile()` from `src/lib/database/server.ts`, which call `supabase.auth.getUser()`.

```typescript
// REMOVE this function from src/lib/auth/actions.ts:
export async function getSession() { ... }
```

If a session object (access token, refresh token) is genuinely needed somewhere, use:

```typescript
// Safe alternative — validates against Supabase server
const { data: { user } } = await supabase.auth.getUser()
```

---

## Related: Duplicate `getCurrentProfile()` Implementations

Three files each define their own version of `getCurrentProfile()`:

| File | Used By |
|------|---------|
| `src/lib/database/server.ts` | Not imported anywhere (dead) |
| `src/lib/auth/actions.ts` | Re-exported via `src/lib/auth/index.ts` |
| `src/lib/data/profiles.ts` | Used by layouts |

**Fix:** Remove the duplicate in `database/server.ts`. Keep the canonical one in `profiles.ts`. Update `auth/index.ts` to import from `profiles.ts` if needed.

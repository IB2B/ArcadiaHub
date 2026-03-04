# Audit: Critical — Admin Server Actions Have No Auth/Role Checks

**Severity:** CRITICAL
**Status:** Open
**Files:** `src/lib/data/admin.ts`, `src/lib/data/cases.ts`

---

## Problem

All admin server actions in `admin.ts` perform database mutations (create, update, delete) **without verifying the caller's role**. While the admin layout (`src/app/[locale]/(admin)/admin/layout.tsx`) checks the role at render time, **server actions are independently callable** from any client code — bypassing the layout entirely.

An authenticated `PARTNER` user who discovers these function names can call:
- `deletePartner()` — delete any partner account
- `deleteCase()` — delete any case
- `deleteBlogPost()`, `deleteDocument()`, `deleteAcademyContent()`, `deleteEvent()` — delete any content
- `createPartner()`, `updatePartner()` — create/modify any partner
- `approveAccessRequest()` — approve their own access request

This is a **privilege escalation vulnerability**.

---

## Affected Functions in `src/lib/data/admin.ts`

| Function | Line (approx) | Action |
|----------|--------------|--------|
| `getAdminStats()` | ~60 | Read all stats |
| `getAdminPartners()` | ~100 | Read all partners |
| `getAdminCases()` | ~200 | Read all cases |
| `createPartner()` | ~270 | Create partner account |
| `updatePartner()` | ~310 | Update any partner |
| `deletePartner()` | ~390 | Delete any partner |
| `createCase()` | ~420 | Create case for any partner |
| `updateCase()` | ~440 | Update any case |
| `deleteCase()` | ~462 | Delete any case + history |
| `createEvent()` | ~510 | Create events |
| `updateEvent()` | ~540 | Update any event |
| `deleteEvent()` | ~580 | Delete any event |
| `createAcademyContent()` | ~620 | Create content |
| `updateAcademyContent()` | ~660 | Update any content |
| `deleteAcademyContent()` | ~714 | Delete any content |
| `createDocument()` | ~750 | Create documents |
| `updateDocument()` | ~790 | Update any document |
| `deleteDocument()` | ~830 | Delete any document |
| `createBlogPost()` | ~860 | Create blog posts |
| `updateBlogPost()` | ~900 | Update any post |
| `deleteBlogPost()` | ~940 | Delete any post |

## Additional Issue in `src/lib/data/cases.ts`

| Function | Line | Issue |
|----------|------|-------|
| `updateCaseStatus()` | ~155 | No auth check — any authenticated user can change any case status by ID |

---

## Fix

Add a role check at the top of every admin server action. Create a shared guard helper:

```typescript
// src/lib/data/admin.ts (top of file)
import { getCurrentProfile } from '@/lib/database/server'

async function requireAdminOrCommercial() {
  const profile = await getCurrentProfile()
  if (!profile || (profile.role !== 'ADMIN' && profile.role !== 'COMMERCIAL')) {
    throw new Error('Unauthorized')
  }
  return profile
}
```

Then call it at the start of every function:

```typescript
export async function deletePartner(partnerId: string) {
  await requireAdminOrCommercial()
  // ... rest of function
}
```

For `updateCaseStatus()` in `cases.ts`, add an ownership or role check:

```typescript
export async function updateCaseStatus(caseId: string, status: string) {
  const profile = await getCurrentProfile()
  if (!profile) throw new Error('Unauthorized')

  // Either admin/commercial OR the case's own partner
  if (profile.role !== 'ADMIN' && profile.role !== 'COMMERCIAL') {
    // verify ownership
    const supabase = await createServerSupabaseClient()
    const { data: caseData } = await supabase
      .from('cases')
      .select('partner_id')
      .eq('id', caseId)
      .single()
    if (caseData?.partner_id !== profile.id) throw new Error('Unauthorized')
  }
  // ... rest of function
}
```

---

## Testing After Fix
1. Log in as a PARTNER user
2. Open browser DevTools → Network tab
3. Attempt to call admin server actions directly
4. Verify all return `Unauthorized` error

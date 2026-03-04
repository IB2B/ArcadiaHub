# Audit: Type Safety Issues

**Severity:** MEDIUM (double-cast) / LOW (FormData casts, minor casts)
**Status:** Open
**Files:** `src/lib/data/cases.ts`, `src/lib/auth/actions.ts`, `src/lib/data/admin.ts`, `src/lib/data/accessRequests.ts`

---

## Issue 1 — Double Cast to Force Type (`as unknown as`)

### `src/lib/data/cases.ts:79`

```typescript
return data as unknown as CaseWithDetails
```

The double cast `as unknown as T` is a TypeScript anti-pattern that completely bypasses the type checker. It indicates that the actual return type of the Supabase query doesn't match `CaseWithDetails`.

**Root cause:** Supabase's `.select()` with joins returns a type inferred from the query string, which TypeScript cannot always match to a manually defined interface.

**Fix options:**
1. Define `CaseWithDetails` to match the exact shape Supabase returns (use `Database` join types)
2. Use a type assertion with a runtime validation (Zod parse)
3. Let TypeScript infer the type from the query result instead of forcing `CaseWithDetails`

---

## Issue 2 — `FormData.get()` Cast to `string`

### `src/lib/auth/actions.ts` (lines 15-16, 38-42, 116, 135-136)

```typescript
const email = formData.get('email') as string
const password = formData.get('password') as string
```

`FormData.get()` returns `FormDataEntryValue | null`, which could be `null` or a `File` object. Casting to `string` hides potential runtime errors.

**Fix:** Use proper null checks before casting:

```typescript
const email = formData.get('email')
const password = formData.get('password')

if (typeof email !== 'string' || typeof password !== 'string') {
  return { error: 'Invalid form data' }
}
```

---

## Issue 3 — Cast on Map Lookup

### `src/lib/data/admin.ts:340`

```typescript
partnerMap.get(c.partner_id) as Profile | undefined
```

`Map.get()` already returns `V | undefined` — the cast is redundant. Minor issue, but indicates inconsistent typing patterns.

**Fix:** Remove the cast. TypeScript already infers `Profile | undefined` from the Map type.

---

## Issue 4 — Forced Cast on DB Results with Extra Fields

### `src/lib/data/accessRequests.ts:234` and `:276-278`

```typescript
(data || []) as AccessRequest[]
{ ...data, status: data.status as AccessRequestStatus, reviewer } as AccessRequest
```

The `AccessRequest` interface includes a `reviewer` field that the raw DB row `access_requests` table doesn't have. These casts hide the shape mismatch.

**Fix:** Either:
1. Build the `AccessRequest` object explicitly rather than casting
2. Use a separate `AccessRequestRow` type for the raw DB result and transform to `AccessRequest` explicitly

---

## Summary

| File | Line | Issue | Severity |
|------|------|-------|----------|
| `cases.ts` | 79 | `as unknown as CaseWithDetails` double cast | MEDIUM |
| `auth/actions.ts` | 15-16, 38-42, 116, 135 | `FormData.get() as string` | LOW |
| `admin.ts` | 340 | Redundant cast on `Map.get()` | LOW |
| `accessRequests.ts` | 234, 276-278 | Cast to interface with extra fields | LOW |

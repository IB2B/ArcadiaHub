# Audit: Missing Error Handling in Server Actions

**Severity:** MEDIUM
**Status:** Open
**Files:** `src/lib/data/admin.ts`, `src/lib/data/dashboard.ts`

---

## Problem

Several server actions use `Promise.all()` for parallel queries without wrapping in try/catch. If any single query fails, the entire `Promise.all()` rejects and the whole page/action fails with an unhandled error.

Additionally, cascade delete operations don't check for errors on the pre-deletion steps, potentially leaving orphaned records.

---

## Issue 1 — `Promise.all()` Without Error Isolation

### `src/lib/data/admin.ts` — `getAdminStats()`

```typescript
// Current — if any single query fails, everything fails
const [partnersResult, casesResult, eventsResult, ...] = await Promise.all([
  supabase.from('profiles').select('...'),
  supabase.from('cases').select('...'),
  supabase.from('events').select('...'),
  // ...
])
```

**Fix:** Use `Promise.allSettled()` so individual failures return partial data:

```typescript
const results = await Promise.allSettled([
  supabase.from('profiles').select('*', { count: 'exact', head: true }),
  supabase.from('cases').select('*', { count: 'exact', head: true }),
  // ...
])

const [partnersResult, casesResult, ...] = results.map(r =>
  r.status === 'fulfilled' ? r.value : { data: null, count: 0, error: r.reason }
)
```

### `src/lib/data/dashboard.ts` — `getDashboardData()`

Same pattern — multiple `Promise.all()` calls with no individual error isolation. If the `cases` query fails, the entire dashboard fails to load.

---

## Issue 2 — Cascade Deletes Without Error Checks

### `src/lib/data/admin.ts` — `deleteCase()` (~line 462)

```typescript
// Current — errors on pre-deletion are silently ignored
await supabase.from('case_history').delete().eq('case_id', caseId)
await supabase.from('case_documents').delete().eq('case_id', caseId)
// Then deletes the case — even if the above silently failed
const { error } = await supabase.from('cases').delete().eq('id', caseId)
```

**Fix:** Check errors on each step:

```typescript
const { error: historyError } = await supabase.from('case_history').delete().eq('case_id', caseId)
if (historyError) throw new Error(`Failed to delete case history: ${historyError.message}`)

const { error: docsError } = await supabase.from('case_documents').delete().eq('case_id', caseId)
if (docsError) throw new Error(`Failed to delete case documents: ${docsError.message}`)

const { error } = await supabase.from('cases').delete().eq('id', caseId)
if (error) throw new Error(error.message)
```

### `src/lib/data/admin.ts` — `deleteEvent()` (~line 580)

Same pattern — `event_registrations` deletion not checked before deleting the event.

### `src/lib/data/admin.ts` — `deleteAcademyContent()` (~line 714)

Same pattern — `content_completions` deletion not checked before deleting the content.

---

## Summary of Affected Functions

| File | Function | Issue |
|------|----------|-------|
| `admin.ts` | `getAdminStats()` | `Promise.all()` no error isolation |
| `admin.ts` | `deleteCase()` | Cascade deletes not error-checked |
| `admin.ts` | `deleteEvent()` | Cascade deletes not error-checked |
| `admin.ts` | `deleteAcademyContent()` | Cascade deletes not error-checked |
| `dashboard.ts` | `getDashboardData()` | `Promise.all()` no error isolation |

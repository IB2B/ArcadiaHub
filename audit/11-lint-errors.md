# Audit: ESLint Errors (10)

**Severity:** MEDIUM–HIGH (errors block CI)
**Status:** Open

---

## Error 1 — `setState` in Effect (reset-password)

**File:** `src/app/[locale]/(auth)/reset-password/page.tsx:26`
**Rule:** `react-hooks/set-state-in-effect`

```typescript
useEffect(() => {
  const hash = window.location.hash
  if (!hash || !hash.includes('access_token')) {
    setHasToken(false)  // ❌ setState called synchronously in effect
  }
}, [])
```

**Fix:** Initialize state directly from the hash instead of using an effect:

```typescript
const [hasToken, setHasToken] = useState(() => {
  if (typeof window === 'undefined') return true
  const hash = window.location.hash
  return !!(hash && hash.includes('access_token'))
})
```

---

## Error 2 — `setState` in Effect (BottomNav)

**File:** `src/components/layout/BottomNav.tsx:175`
**Rule:** `react-hooks/set-state-in-effect`

```typescript
useEffect(() => {
  setShowMoreMenu(false)  // ❌ setState called synchronously in effect
}, [pathname])
```

This pattern is used to close the menu on route change. The lint rule flags it because it causes a cascading render.

**Fix:** Use a ref to track pathname and compare, or restructure so the menu closes via event rather than effect:

```typescript
const prevPathname = useRef(pathname)
useEffect(() => {
  if (prevPathname.current !== pathname) {
    prevPathname.current = pathname
    setShowMoreMenu(false)
  }
}, [pathname])
```

Or simply — since this is just closing a menu — this is a common acceptable pattern. Disable the rule for this specific line if the team decides it's acceptable:

```typescript
// eslint-disable-next-line react-hooks/set-state-in-effect
setShowMoreMenu(false)
```

---

## Error 3 — Missing Display Name

**File:** `src/components/layout/Sidebar.tsx:125`
**Rule:** `react/display-name`

An anonymous component (likely created with `React.forwardRef` or as an inline component) is missing a display name.

**Fix:** Add `displayName`:

```typescript
const MyComponent = React.forwardRef<...>((props, ref) => {
  // ...
})
MyComponent.displayName = 'MyComponent'
```

---

## Errors 4–5 — Empty Interfaces

**File:** `src/components/ui/Card.tsx:17,19`
**Rule:** `@typescript-eslint/no-empty-object-type`

```typescript
interface CardProps {}      // ❌ empty interface
interface CardBodyProps {}  // ❌ empty interface
```

**Fix:** Replace with type aliases or extend from React props:

```typescript
type CardProps = React.HTMLAttributes<HTMLDivElement>
type CardBodyProps = React.HTMLAttributes<HTMLDivElement>
```

---

## Error 6 — Unused `tNav`

**File:** `src/app/[locale]/(admin)/admin/cases/new/page.tsx:8`
**Rule:** `@typescript-eslint/no-unused-vars`

```typescript
const tNav = await getTranslations('navigation')  // never used
```

**Fix:** Remove the line.

---

## Errors 7–8 — Unused Imports in `PartnerForm.tsx`

**File:** `src/app/[locale]/(admin)/admin/partners/PartnerForm.tsx:6,7`
**Rule:** `@typescript-eslint/no-unused-vars`

```typescript
import type { TablesInsert } from '@/types/database.types'  // unused
import { createPartner } from '@/lib/data/admin'            // unused
```

**Fix:** Remove both imports.

---

## Error 9 — Unused `onMarkAllAsRead` in `Header.tsx`

**File:** `src/components/layout/Header.tsx:51`
**Rule:** `@typescript-eslint/no-unused-vars`

```typescript
onMarkAllAsRead?: () => void  // declared but never called
```

**Fix:** Remove from interface or implement usage.

---

## Error 10 — Unused `t` in `FileUpload.tsx`

**File:** `src/components/ui/FileUpload.tsx:73`
**Rule:** `@typescript-eslint/no-unused-vars`

```typescript
const t = useTranslations('fileUpload')  // assigned but never used
```

**Fix:** Remove the line if translations aren't being used, or add translation usage.

---

## Full Error List

| # | File | Line | Rule |
|---|------|------|------|
| 1 | `reset-password/page.tsx` | 26 | `react-hooks/set-state-in-effect` |
| 2 | `BottomNav.tsx` | 175 | `react-hooks/set-state-in-effect` |
| 3 | `Sidebar.tsx` | 125 | `react/display-name` |
| 4 | `Card.tsx` | 17 | `@typescript-eslint/no-empty-object-type` |
| 5 | `Card.tsx` | 19 | `@typescript-eslint/no-empty-object-type` |
| 6 | `admin/cases/new/page.tsx` | 8 | `@typescript-eslint/no-unused-vars` |
| 7 | `PartnerForm.tsx` | 6 | `@typescript-eslint/no-unused-vars` |
| 8 | `PartnerForm.tsx` | 7 | `@typescript-eslint/no-unused-vars` |
| 9 | `Header.tsx` | 51 | `@typescript-eslint/no-unused-vars` |
| 10 | `FileUpload.tsx` | 73 | `@typescript-eslint/no-unused-vars` |

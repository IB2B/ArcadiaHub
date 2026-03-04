# Audit: Hardcoded Colors

**Severity:** LOW
**Status:** Open
**Files:** `Avatar.tsx`, `HeroSection.tsx`, `SettingsPageClient.tsx`, `demo/ui-picker/page.tsx`

---

## Rule

All colors must use CSS variables defined in `src/app/globals.css` via `var(--token-name)` or Tailwind utilities that reference those variables. Never hardcode hex values, `rgb()`, or `rgba()` in component files.

---

## Issues

### `src/components/ui/Avatar.tsx`

```typescript
// Line 42 — hardcoded primary brand color
'bg-[#244675]'
```

**Fix:**
```typescript
'bg-[var(--primary)]'
// or use the Tailwind utility: bg-primary (if configured)
```

---

### `src/components/landing/HeroSection.tsx`

```typescript
// Lines 150–152 — demo stat colors in landing page data
{ color: '#f59e0b' }
{ color: '#10b981' }
{ color: '#8b5cf6' }
```

These are demo data values rendered inline. Either define CSS variable tokens for these accent colors or use Tailwind color names.

**Fix:**
```typescript
{ color: 'var(--color-amber)' }   // or 'text-amber-500' etc.
{ color: 'var(--color-emerald)' }
{ color: 'var(--color-violet)' }
```

---

### `src/app/[locale]/(dashboard)/settings/SettingsPageClient.tsx`

```typescript
// Lines 40–61 — theme preview objects
'#F8FAFC', '#244675', '#FFFFFF', '#F1F5F9', '#0F172A'
'rgba(255, 255, 255, 0.9)', 'rgba(255, 255, 255, 0.8)'
```

These are used to visually preview the theme options in the settings page. Since they represent the actual theme color values (not UI elements), this is partially intentional.

**Acceptable as-is** if these are display-only representations of the theme palette. However, the `#244675` references could at minimum be defined as a named constant.

---

### `src/app/[locale]/demo/ui-picker/page.tsx`

```typescript
// Lines 52–54 — theme preview colors
'#244675', '#0F172A', gradient strings
```

This is a demo/dev page. Low priority.

---

### Acceptable Exceptions

| File | Colors | Reason |
|------|--------|--------|
| `src/components/events/AddToCalendarButton.tsx` | `#4285F4`, `#34A853`, `#FBBC05`, `#EA4335` | Google brand colors in SVG — cannot use CSS variables for brand-mandated colors |

---

## Summary

| File | Line | Value | Severity |
|------|------|-------|----------|
| `Avatar.tsx` | 42 | `#244675` | LOW |
| `HeroSection.tsx` | 150-152 | 3 hex colors | LOW |
| `SettingsPageClient.tsx` | 40-61 | Multiple hex + rgba | LOW (partly intentional) |
| `demo/ui-picker/page.tsx` | 52-54 | 2 hex values | LOW (dev page) |

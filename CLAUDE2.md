# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Arcadia Hub** - a B2B Partner Management & Engagement Platform built with Next.js 16, Supabase, and next-intl. Features partner management, case tracking, events, academy content, documents, blog, and community.

**Stack:** Next.js 16 (App Router), React 19, TypeScript 5 (strict), Supabase (auth + DB + storage), Tailwind CSS v4, next-intl, Resend (email), Zod (validation)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # ESLint with next/core-web-vitals + typescript
npm run seed         # Seed database (tsx scripts/seed.ts)
```

No test framework is configured.

## Critical Rules

- **No API routes** - use Server Actions (`'use server'`) in `src/lib/data/` for all mutations
- **Locale-aware navigation only** - always import `Link`, `redirect`, `usePathname`, `useRouter` from `src/navigation.ts`, never from Next.js directly
- **Two Supabase clients**: `createServerSupabaseClient()` (respects RLS) for normal use, `createServiceSupabaseClient()` (bypasses RLS) only in `notificationService.ts`
- **Three roles**: `PARTNER`, `COMMERCIAL`, `ADMIN` - admin layout performs server-side role gating
- **Two themes**: `light`, `dark` - all colors must use CSS variables (`var(--primary)`, etc.), never hardcode colors
- **Custom UI components** in `src/components/ui/` - no shadcn/ui, no Radix UI
- **Server Components by default** - only add `'use client'` for interactive components
- After mutations, always call `revalidatePath()` to refresh server-rendered data
- Validate all inputs with Zod
- Don't mention Claude in commits

## Architecture

### Routing

All routes under `src/app/[locale]/` with mandatory locale prefix (`en`, `it`, `fr`):

- `(auth)/` - public pages (login, forgot-password, request-access)
- `(dashboard)/` - authenticated partner area (requires Supabase session)
- `(admin)/admin/` - admin panel (requires `ADMIN` or `COMMERCIAL` role)

### Data Flow

- Server Actions in `src/lib/data/` (one file per domain: cases, events, blog, academy, documents, etc.)
- Pages are async Server Components that `await` these functions directly
- Browser client in `src/lib/database/client.ts` for Client Components only
- After mutations, `revalidatePath()` refreshes server-rendered data

### Key Files

| File | Purpose |
|------|---------|
| `src/middleware.ts` | i18n routing + auth session checks |
| `src/navigation.ts` | Locale-aware nav exports (use these, not Next.js) |
| `src/i18n.ts` | i18n config (locales: en, it, fr) |
| `src/lib/database/server.ts` | Supabase server clients |
| `src/lib/auth/actions.ts` | Auth logic (login, signup, logout, reset) |
| `src/lib/services/notificationService.ts` | Server-side notifications (service role) |
| `src/types/database.types.ts` | Auto-generated Supabase types |
| `src/app/globals.css` | Theme definitions + CSS variables |

### Component Organization

```
src/components/
  ui/           # Custom primitives (Button, Card, Modal, Table, Input, etc.)
  admin/        # Admin panel components
  cases/        # Case tracking components
  community/    # Community section
  dashboard/    # Dashboard widgets
  documents/    # Document management
  events/       # Event scheduling
  landing/      # Landing page
  layout/       # AppShell, Sidebar, SessionTimeout, LanguageSwitcher
```

### Key Patterns

**Server Action pattern:**
```typescript
'use server'

import { createServerSupabaseClient } from '@/lib/database/server'
import { revalidatePath } from 'next/cache'

export async function createCase(data: CaseInput) {
  const supabase = await createServerSupabaseClient()
  const { data: result, error } = await supabase
    .from('cases')
    .insert(data)
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/[locale]/cases')
  return result
}
```

### Styling

Tailwind CSS v4 with CSS-first config (no `tailwind.config.js`). Three themes defined in `globals.css` via `[data-theme]` attribute. Font: Outfit.

### i18n

next-intl with `localePrefix: 'always'`. Translation files in `messages/{en,it,fr}.json`. Server Components use `getTranslations()`, Client Components use `useTranslations()`.

### Notifications

`useNotifications` hook polls every 30 seconds. `notificationService.ts` creates notifications server-side using the service role client.

## Environment Variables

```bash
# Public (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=

# Server-only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_ID=
RESEND_API_KEY=
FROM_EMAIL=
```

## ECC Workflow

```bash
# Planning a feature
/plan "Add feature description here"

# Before committing
/code-review

# Fix build issues
/build-fix
```

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Don't mention Claude in commit messages

## Path Alias

`@/*` maps to `./src/*` (tsconfig paths).

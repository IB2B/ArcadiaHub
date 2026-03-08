# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Arcadia Hub** — a B2B Partner Management & Engagement Platform built with Next.js 16, Supabase, and next-intl. Features partner management, case tracking, events, academy content, documents, blog, and community.

**Stack:** Next.js 16.0.7 (App Router), React 19.2.0, TypeScript 5 (strict), Supabase (auth + DB + storage), Tailwind CSS v4, next-intl 4.5.6, Resend v6.5.2 (email), Zod 4.1.13 (validation)

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # ESLint with next/core-web-vitals + typescript
npm run seed         # Seed database (tsx scripts/seed.ts)
```

No test framework is configured.

## Critical Rules

- **No API routes** — use Server Actions (`'use server'`) in `src/lib/data/` for all mutations
- **Locale-aware navigation only** — always import `Link`, `redirect`, `usePathname`, `useRouter` from `src/navigation.ts`, never from Next.js directly
- **Two Supabase clients**: `createServerSupabaseClient()` (respects RLS) for normal use, `createServiceSupabaseClient()` (bypasses RLS) only in `notificationService.ts`
- **Three roles**: `PARTNER`, `COMMERCIAL`, `ADMIN` — admin layout performs server-side role gating (`ADMIN` or `COMMERCIAL`)
- **Two themes**: `light`, `dark` — all colors must use CSS variables (`var(--primary)`, etc.), never hardcode colors
- **Custom UI components** in `src/components/ui/` — no shadcn/ui, no Radix UI
- **Server Components by default** — only add `'use client'` for interactive components
- After mutations, always call `revalidatePath()` to refresh server-rendered data
- Validate all inputs with Zod
- Always edit source code directly — do not output code blocks for the user to copy
- Keep translations in sync across all 3 locale files (en, it, fr) when adding/modifying UI text
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client
- Migrations go in `supabase/migrations/` with sequential numbering

## Architecture

### Routing

All routes under `src/app/[locale]/` with mandatory locale prefix (`en`, `it`, `fr`):

- `(auth)/` — public pages (login, forgot-password, reset-password, request-access)
- `(dashboard)/` — authenticated partner area (requires Supabase session)
- `(admin)/admin/` — admin panel (requires `ADMIN` or `COMMERCIAL` role)

### Project Structure

```
src/
├── app/[locale]/
│   ├── (admin)/admin/      # Admin panel (partners, cases, events, academy, documents, blog, access-requests)
│   ├── (auth)/              # Auth pages (login, forgot-password, reset-password, request-access)
│   ├── (dashboard)/         # Protected user area (dashboard, cases, events, academy, documents, blog, community, activity, profile, settings)
│   ├── layout.tsx
│   └── page.tsx             # Landing page
├── components/
│   ├── admin/               # Admin panel components
│   ├── layout/              # AppShell, Sidebar, Header, BottomNav, SessionTimeout, LanguageSwitcher
│   ├── ui/                  # Custom primitives (Button, Card, Badge, Modal, Input, Select, Table, Tabs, FileUpload, Pagination, Avatar, Toggle, Textarea)
│   ├── cases/               # CaseCard, CaseFilters, CaseTimeline
│   ├── events/              # EventCard, CalendarView
│   ├── documents/           # DocumentPreview
│   ├── community/           # PartnerCard
│   ├── dashboard/           # StatsCard, TimelineFeed
│   └── landing/             # Landing page sections
├── lib/
│   ├── database/
│   │   ├── client.ts        # Browser Supabase client (createBrowserClient)
│   │   └── server.ts        # Server Supabase client + service client (bypasses RLS) + helpers (getCurrentUser, getCurrentProfile)
│   ├── auth/actions.ts      # Server actions: login, signup, logout, password reset
│   ├── data/                # Server actions per domain: admin.ts, cases.ts, events.ts, academy.ts, blog.ts, documents.ts, profiles.ts, notifications.ts, accessRequests.ts, dashboard.ts
│   ├── email/               # send.ts, config.ts, templates/
│   └── services/            # notificationService.ts (service role), storage.ts
├── types/database.types.ts  # Supabase-generated TypeScript types
├── hooks/                   # Custom React hooks
├── i18n.ts                  # i18n config (locales, defaultLocale)
├── navigation.ts            # Locale-aware nav exports (use these, not Next.js)
└── middleware.ts             # Auth guard + i18n routing
```

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

### Data Flow

- Server Actions in `src/lib/data/` (one file per domain: cases, events, blog, academy, documents, etc.)
- Pages are async Server Components that `await` these functions directly
- Browser client in `src/lib/database/client.ts` for Client Components only
- After mutations, `revalidatePath()` refreshes server-rendered data

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

Tailwind CSS v4 with CSS-first config (no `tailwind.config.js`). Themes defined in `globals.css` via `[data-theme]` attribute. Font: Outfit. All colors via CSS variables — never hardcode.

### i18n

next-intl with `localePrefix: 'always'`. Translation files in `messages/{en,it,fr}.json`. Server Components use `getTranslations()`, Client Components use `useTranslations()`.

### Notifications

`useNotifications` hook polls every 30 seconds. `notificationService.ts` creates notifications server-side using the service role client.

## Database Tables

`profiles`, `cases`, `case_documents`, `case_history`, `events`, `event_registrations`, `academy_content`, `content_completions`, `documents`, `blog_posts`, `notifications`, `access_requests`, `categories`, `services`, `certifications`, `partner_services`, `partner_certifications`

## Environment Variables

```bash
# Public (safe for browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_APP_NAME=

# Server-only (NEVER expose to client)
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_PROJECT_ID=
RESEND_API_KEY=
FROM_EMAIL=
ADMIN_NOTIFICATION_EMAIL=        # receives admin alert emails (new suggestions, access requests)
PARTNER_BULK_EMAIL_ENABLED=true  # set to "true" to enable batch event published emails to all partners
```

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`
- Don't mention Claude in commit messages

## Path Alias

`@/*` maps to `./src/*` (tsconfig paths).

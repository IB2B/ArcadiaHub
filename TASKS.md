# ArcadiaHub — Feature Tasks

Generated from product notes. Tasks are organized by feature area.
Each task notes what already exists vs. what needs to be built.

---

## Legend
- `[ ]` Not started
- `[~]` Partially exists / needs extension
- `[x]` Already implemented

---

## Feature 1 — Email Notification System

> Send transactional emails for all key events. Jiani should receive admin alerts.
> Infrastructure already exists: Resend client, `sendEmail()`, base HTML template, 3 templates.

### 1.1 — Environment & Config
- [ ] **ENV-1** Add `ADMIN_NOTIFICATION_EMAIL` to `.env.local` and `.env.example` — the address (Jiani's) that receives all admin alert emails
- [ ] **ENV-2** Add `PARTNER_BULK_EMAIL_ENABLED=true/false` flag to control whether publish actions trigger batch partner emails

### 1.2 — Missing Email Templates
- [ ] **TPL-1** Create `src/lib/email/templates/access-request-rejection.ts` — rejection notice to applicant (includes review notes)
- [ ] **TPL-2** Create `src/lib/email/templates/access-request-received.ts` — acknowledgement to the applicant when they submit the form ("We received your request…")
- [ ] **TPL-3** Create `src/lib/email/templates/case-status-update.ts` — tells the partner their case changed status
- [ ] **TPL-4** Create `src/lib/email/templates/case-document-added.ts` — tells the partner a new document was added to their case
- [ ] **TPL-5** Create `src/lib/email/templates/event-published.ts` — announces new event to all partners (with date, type, registration link)
- [ ] **TPL-6** Create `src/lib/email/templates/user-invite.ts` — sent when a leader creates a sub-user account directly (see Feature 2)
- [ ] **TPL-7** Create `src/lib/email/templates/suggestion-received.ts` — confirmation to the partner that their suggestion was received
- [ ] **TPL-8** Create `src/lib/email/templates/comment-mention.ts` — notifies a user they were @mentioned in a comment

### 1.3 — New Email Send Functions (`src/lib/email/index.ts`)
- [ ] **EMAIL-1** `sendAccessRequestReceivedEmail(to, firstName, companyName)` — call in `submitAccessRequest()` immediately after insert
- [ ] **EMAIL-2** `sendAccessRequestRejectionEmail(to, firstName, companyName, notes?)` — call in `rejectAccessRequest()` after status update
- [ ] **EMAIL-3** `sendAdminAlertEmail(subject, body, actionUrl?)` — sends to `ADMIN_NOTIFICATION_EMAIL`; generic enough to reuse for all admin alerts
- [ ] **EMAIL-4** `sendCaseStatusUpdateEmail(to, firstName, caseCode, oldStatus, newStatus, caseUrl)` — call in `updateCaseStatus()`
- [ ] **EMAIL-5** `sendCaseDocumentAddedEmail(to, firstName, caseCode, documentTitle, caseUrl)` — call in admin `createCaseDocument()`
- [ ] **EMAIL-6** `sendEventPublishedEmail(recipients[], event)` — batch email; call when admin publishes an event
- [ ] **EMAIL-7** `sendUserInviteEmail(to, firstName, setupUrl)` — call when leader creates a sub-user (Feature 2)
- [ ] **EMAIL-8** `sendCommentMentionEmail(to, firstName, mentionedBy, excerpt, entityUrl)` — call in comment mention logic (Feature 4)

### 1.4 — Wire Emails into Existing Server Actions
- [~] **WIRE-1** `submitAccessRequest()` → add `sendAccessRequestReceivedEmail` to applicant + `sendAdminAlertEmail` to Jiani (currently only in-app notification to admins)
- [ ] **WIRE-2** `rejectAccessRequest()` → add `sendAccessRequestRejectionEmail` to the applicant
- [x] **WIRE-3** `approveAccessRequest()` → welcome email already sent ✅
- [ ] **WIRE-4** `updateCaseStatus()` in `cases.ts` → add `sendCaseStatusUpdateEmail` to the partner
- [ ] **WIRE-5** Admin `createCaseDocument()` → add `sendCaseDocumentAddedEmail` to the partner
- [ ] **WIRE-6** Admin `createEvent()` when `is_published=true` → add `sendEventPublishedEmail` to all active partners
- [ ] **WIRE-7** Admin `updateEvent()` when flipping to `is_published=true` → same batch email

### 1.5 — Email Preferences (opt-out)
- [ ] **PREF-1** Use `profiles.notification_preferences` (JSON column, already exists) to store per-user email opt-outs: `{ email_case_updates: true, email_events: true, email_content: true, email_mentions: true }`
- [ ] **PREF-2** Add email preference toggles to the partner profile/settings page
- [ ] **PREF-3** Check preferences before sending each email type in the send functions above

---

## Feature 2 — Leader Account Creates Sub-Users

> A COMMERCIAL (leader) account can directly create new PARTNER accounts without going through the public access-request flow. Admin can create any role.

### 2.1 — Database
- [ ] **DB-1** Supabase migration: add `created_by UUID REFERENCES profiles(id)` column to `profiles` table — tracks which leader created a sub-user (`assigned_commercial_id` already exists for assignment, but `created_by` captures authorship)
- [ ] **DB-2** Update `database.types.ts` to include `created_by` in `profiles` Row/Insert/Update

### 2.2 — Server Actions (`src/lib/data/admin.ts` or new `src/lib/data/users.ts`)
- [ ] **ACT-1** `createSubUser({ email, firstName, lastName, role?, notes? })` — usable by COMMERCIAL (creates PARTNER only) and ADMIN (creates any role):
  1. Auth guard: COMMERCIAL or ADMIN only
  2. Check duplicate email via `auth.admin.listUsers()` (uses service client)
  3. `supabase.auth.admin.createUser(email, email_confirm: true)`
  4. Upsert profile with `role`, `assigned_commercial_id = caller.id`, `created_by = caller.id`
  5. Generate recovery/invite link via `auth.admin.generateLink({ type: 'recovery' })`
  6. Send `sendUserInviteEmail` with setup link
  7. `revalidatePath` for the relevant admin pages
- [ ] **ACT-2** `getSubUsers(leaderId?)` — returns partner accounts created by / assigned to a given commercial, or all if ADMIN
- [ ] **ACT-3** `deactivateSubUser(userId)` — sets `profiles.is_active = false` and `supabase.auth.admin.updateUserById(userId, { ban_duration: 'none' })` (COMMERCIAL can only deactivate their own sub-users; ADMIN can deactivate any)
- [ ] **ACT-4** `reactivateSubUser(userId)` — reverses deactivation
- [ ] **ACT-5** `resendInviteEmail(userId)` — generates a new recovery link and re-sends invite email

### 2.3 — Admin UI
- [ ] **UI-1** Add **"Create User"** button to `/admin/partners` page header — opens `CreateUserModal`
- [ ] **UI-2** Create `src/app/[locale]/(admin)/admin/partners/CreateUserModal.tsx` — form fields: Email, First Name, Last Name, Role (PARTNER / COMMERCIAL if ADMIN), Notes (optional)
- [ ] **UI-3** Show a **"Resend Invite"** action in the partner detail page / partners table row menu for users who haven't logged in yet
- [ ] **UI-4** Show **"Deactivate / Reactivate"** toggle in partner detail — only enabled if caller is ADMIN or the creator of that account

### 2.4 — Commercial (Leader) Dashboard UI
- [ ] **UI-5** Add **"My Team"** section to the COMMERCIAL dashboard (or a `/dashboard/team` page) listing all partners with `assigned_commercial_id = currentUser.id`
- [ ] **UI-6** On the Team page: **"Invite Partner"** button → same `CreateUserModal` (pre-fills `assigned_commercial_id`, restricts role to PARTNER)

---

## Feature 3 — Suggestion Email

> Partners can submit suggestions or feedback. The suggestion is saved and forwarded to the admin (Jiani).

### 3.1 — Database
- [ ] **DB-3** Supabase migration: create `suggestions` table:
  ```sql
  CREATE TABLE suggestions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject     TEXT NOT NULL,
    content     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending', -- pending | reviewed | resolved
    admin_reply TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  ```
- [ ] **DB-4** RLS policies: partner can INSERT own suggestions and SELECT own; ADMIN/COMMERCIAL can SELECT all, UPDATE status + admin_reply
- [ ] **DB-5** Update `database.types.ts` with the `suggestions` table

### 3.2 — Server Actions (`src/lib/data/suggestions.ts`)
- [ ] **ACT-6** `submitSuggestion({ subject, content })` — INSERT row, send `sendAdminAlertEmail` to Jiani, send `sendSuggestionReceivedEmail` (TPL-7) to partner
- [ ] **ACT-7** `getMySuggestions()` — returns the current partner's own suggestions
- [ ] **ACT-8** `getAllSuggestions({ status?, search?, page? })` — ADMIN/COMMERCIAL only, paginated
- [ ] **ACT-9** `updateSuggestionStatus(id, status, adminReply?)` — ADMIN/COMMERCIAL only; if `adminReply` is set, optionally send a reply email to the partner

### 3.3 — Partner UI
- [ ] **UI-7** Add a floating **"Send Feedback"** button (bottom-right) visible on all dashboard pages — opens `SuggestionModal`
- [ ] **UI-8** Create `src/components/dashboard/SuggestionModal.tsx` — Subject field + Message textarea + submit button with loading/success state
- [ ] **UI-9** Create `/dashboard/suggestions` page — partner can view their past submissions and their statuses

### 3.4 — Admin UI
- [ ] **UI-10** Create `/admin/suggestions` page — table of all suggestions with filters (status, date range, search by partner/subject)
- [ ] **UI-11** Suggestion detail modal — shows full content, status dropdown (pending → reviewed → resolved), admin reply textarea, save button

---

## Feature 4 — Comment Sections with User Tagging (@mentions)

> Comments can be added to cases, blog posts, events, and academy content. Users can @mention other users to notify them.

### 4.1 — Database
- [ ] **DB-6** Supabase migration: create `comments` table:
  ```sql
  CREATE TABLE comments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content     TEXT NOT NULL,
    author_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL,  -- 'case' | 'blog_post' | 'event' | 'academy_content'
    entity_id   UUID NOT NULL,
    parent_id   UUID REFERENCES comments(id) ON DELETE CASCADE,  -- threaded replies
    mentions    UUID[] NOT NULL DEFAULT '{}',  -- tagged user IDs
    is_edited   BOOLEAN NOT NULL DEFAULT FALSE,
    edited_at   TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
  CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
  CREATE INDEX idx_comments_author ON comments(author_id);
  ```
- [ ] **DB-7** RLS policies:
  - Any authenticated user can SELECT comments on entities they have access to
  - Authenticated users can INSERT their own comments
  - Author can UPDATE/DELETE their own comments; ADMIN can DELETE any
- [ ] **DB-8** Update `database.types.ts` with the `comments` table

### 4.2 — Server Actions (`src/lib/data/comments.ts`)
- [ ] **ACT-10** `getComments(entityType, entityId, page?)` — paginated, ordered by `created_at ASC`, joins author profile (name, logo)
- [ ] **ACT-11** `getCommentCount(entityType, entityId)` — lightweight count for badges
- [ ] **ACT-12** `createComment({ entityType, entityId, content, parentId?, mentions[] })`:
  1. Auth guard (must be authenticated)
  2. INSERT comment
  3. For each `userId` in `mentions`: create in-app notification (`notifyUserMentioned`) + send `sendCommentMentionEmail` (EMAIL-8)
  4. `revalidatePath` for entity page
- [ ] **ACT-13** `updateComment(id, content, newMentions[])` — author only; updates `content`, `is_edited=true`, `edited_at`, processes new mentions
- [ ] **ACT-14** `deleteComment(id)` — author or ADMIN; soft-delete (`content = '[deleted]'`) if it has replies, hard-delete if leaf node

### 4.3 — Notification Service (`notificationService.ts`)
- [ ] **ACT-15** Add `notifyUserMentioned({ commentId, entityType, entityId, mentionedUserId, mentionedByName, excerpt })` — creates in-app notification for each tagged user

### 4.4 — UI Components
- [ ] **UI-12** Create `src/components/comments/MentionInput.tsx` — textarea that detects `@` and shows an autocomplete dropdown of users (fetches from `/api/users/search?q=`); parses mention tokens; stores raw content with `@[userId:displayName]` markers
- [ ] **UI-13** Create `src/components/comments/CommentItem.tsx` — renders author avatar, name, timestamp, parsed content (mentions highlighted as chips), edited badge; shows Edit/Delete for own comments and Delete for admins
- [ ] **UI-14** Create `src/components/comments/CommentSection.tsx` — composes `CommentItem` list + `MentionInput` + pagination; accepts `entityType` + `entityId` props
- [ ] **UI-15** Create `src/app/api/users/search/route.ts` — GET handler, accepts `?q=` query, returns matching `profiles` (id, display name, logo) for the mention autocomplete; auth-protected

### 4.5 — Integration (add `<CommentSection>` to entity pages)
- [ ] **INT-1** Add `<CommentSection entityType="case" entityId={caseId} />` to the case detail page (`CaseDetailClient.tsx`)
- [ ] **INT-2** Add `<CommentSection entityType="blog_post" entityId={postId} />` to the blog post detail page (`BlogPostClient.tsx`)
- [ ] **INT-3** Add `<CommentSection entityType="event" entityId={eventId} />` to the event detail page (`EventDetailClient.tsx`)
- [ ] **INT-4** Add `<CommentSection entityType="academy_content" entityId={contentId} />` to the academy content detail page (`AcademyDetailClient.tsx`)

### 4.6 — Admin Moderation
- [ ] **UI-16** Add "Comments" tab to the admin content detail views (cases, blog, events, academy) showing all comments for that entity with a Delete button per comment

---

## Cross-Cutting Tasks

- [ ] **CROSS-1** Supabase migration file for all new tables: `supabase/migrations/003_comments_suggestions_created_by.sql` — DB-1 through DB-8 in one migration
- [ ] **CROSS-2** Add all new `NotificationType` values (`mention`, `suggestion_reply`) to the type union in `notificationService.ts`
- [ ] **CROSS-3** Add i18n keys for all new UI text to `messages/en.json`, `messages/fr.json`, `messages/it.json`
- [ ] **CROSS-4** Update `README.md` / `TECHNICAL_DOCUMENTATION.md` with new feature descriptions
- [ ] **CROSS-5** Add `ADMIN_NOTIFICATION_EMAIL` and `PARTNER_BULK_EMAIL_ENABLED` to the documented env vars list

---

## Task Count Summary

| Feature | Tasks |
|---|---|
| 1 — Email Notification System | ENV-1,2 · TPL-1–8 · EMAIL-1–8 · WIRE-1–7 · PREF-1–3 = **28 tasks** |
| 2 — Leader Creates Sub-Users | DB-1,2 · ACT-1–5 · UI-1–6 = **13 tasks** |
| 3 — Suggestion Email | DB-3–5 · ACT-6–9 · UI-7–11 = **12 tasks** |
| 4 — Comment Sections + Mentions | DB-6–8 · ACT-10–15 · UI-12–16 · INT-1–4 = **19 tasks** |
| Cross-cutting | CROSS-1–5 = **5 tasks** |
| **Total** | **77 tasks** |

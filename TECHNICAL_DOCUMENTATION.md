# Arcadia Hub - Technical Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Features](#features)
5. [Database Schema](#database-schema)
6. [API Operations](#api-operations)
7. [Authentication & Authorization](#authentication--authorization)
8. [Configuration](#configuration)
9. [Setup & Installation](#setup--installation)
10. [Deployment](#deployment)

---

## Project Overview

**Arcadia Hub** is a comprehensive B2B partner management and engagement platform designed to centralize partner relationships, case tracking, content delivery, and community engagement.

### Core Purpose
- Partner onboarding and access request management
- Case/Matter (Pratiche) tracking and management
- Event scheduling (webinars, workshops, training)
- Educational content delivery (academy with videos, galleries, slides, podcasts)
- Document repository and knowledge base
- Blog/news system for company announcements
- Community features for partner interaction
- Admin dashboard for oversight and management

### Target Users
- **Partners**: External organizations/companies
- **Commercial Managers**: Relationship managers
- **Administrators**: System management and oversight

### Project Status
**Current Phase**: Version 1.0 Delivered

**Status**: First version has been successfully delivered to the client. The application is currently in the review phase where the client will evaluate the implementation and provide feedback on necessary changes, adaptations, or additional features.

**Next Steps**:
- Await client feedback on the delivered v1.0
- Document any requested changes or adaptations
- Prioritize feedback items with client
- Plan and implement Phase 2 enhancements
- Schedule follow-up meetings for requirements refinement

**Deployment**: Application is deployed and accessible to client for testing and evaluation.

**Feedback Tracking**: See `CLIENT_FEEDBACK_TRACKER.md` in the project root for a template to track client feedback, feature requests, and Phase 2 requirements.

---

## Tech Stack

### Frontend
- **Framework**: Next.js 16.0.7 (App Router)
- **Language**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4 with PostCSS
- **Internationalization**: next-intl 4.5.6 (English, Italian, French)
- **Date Handling**: date-fns 4.1.0

### Backend
- **Runtime**: Node.js via Next.js Server Actions
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL via Supabase
- **Email**: Resend v6.5.2
- **Validation**: Zod 4.1.13

### Infrastructure
- **Database & Auth**: Supabase
- **Storage**: Supabase Storage
- **Email Service**: Resend
- **Deployment**: Vercel-ready

---

## Architecture

### Overall Pattern
Full-Stack Monolithic Architecture with clear layer separation:

```
┌─────────────────────────────────────┐
│   Presentation Layer (React/Next)   │
├─────────────────────────────────────┤
│   Application Layer (Server Actions)│
├─────────────────────────────────────┤
│   Database Layer (Supabase + RLS)   │
└─────────────────────────────────────┘
```

### Folder Structure

```
arcadia-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── [locale]/          # i18n routing
│   │   │   ├── (admin)/       # Admin panel (RLS protected)
│   │   │   ├── (auth)/        # Auth routes
│   │   │   └── (dashboard)/   # User dashboard
│   │   └── layout.tsx
│   │
│   ├── components/
│   │   ├── admin/             # Admin components
│   │   ├── layout/            # Layout components
│   │   ├── ui/                # Reusable UI components
│   │   ├── dashboard/
│   │   ├── cases/
│   │   ├── events/
│   │   └── documents/
│   │
│   ├── lib/
│   │   ├── database/          # Supabase clients
│   │   ├── auth/              # Auth actions
│   │   ├── data/              # Data operations
│   │   ├── email/             # Email service
│   │   └── services/          # Business logic
│   │
│   ├── types/
│   │   └── database.types.ts  # Auto-generated types
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── i18n.ts               # i18n config
│   ├── navigation.ts         # Navigation helpers
│   └── middleware.ts         # Next.js middleware
│
├── supabase/
│   └── migrations/           # Database migrations
│
├── messages/                 # Translation files
│   ├── en.json
│   ├── it.json
│   └── fr.json
│
└── public/                   # Static assets
```

### Key Architectural Patterns

1. **Server Actions Pattern**: Next.js server actions for type-safe data mutations
2. **RLS (Row Level Security)**: Database-level access control
3. **Middleware Protection**: Request-level authentication
4. **Component Composition**: Reusable UI components
5. **Internationalization**: Route-level locale handling
6. **Admin Separation**: Dedicated admin routes with role-based access

---

## Features

### 1. Authentication & Access Management
- Email/password authentication
- Self-service password recovery
- Public partner registration requests
- Role-based access (PARTNER, COMMERCIAL, ADMIN)
- Session management with auto-refresh

### 2. Partner Management
- Partner profiles with company information
- Logo upload and storage
- Company metadata (address, contact, description)
- Services and certifications tracking
- Status management (active/inactive)
- Search and filtering

### 3. Case Management (Pratiche)
- Full CRUD operations
- Unique case code generation (YYYY-XXXX format)
- Status tracking: PENDING → IN_PROGRESS → COMPLETED
- Document attachments
- Case history and audit trail
- Partner-specific viewing
- Commercial manager assignment

### 4. Events Management
- Event types: TRAINING, WORKSHOP, WEBINAR, PHYSICAL
- Scheduling with date/time
- Meeting links and recordings
- Location tracking
- Attachments
- Publishing workflow
- Registration tracking

### 5. Academy Content
- Content types: VIDEO, GALLERY, SLIDES, PODCAST, RECORDING
- Rich metadata (title, description, theme, year, duration)
- Downloadable content
- View count tracking
- Progress tracking
- Content filtering

### 6. Blog/News System
- Post creation and publishing
- Slug-based URLs
- Categories and tags
- Featured images
- Author attribution
- View count tracking
- Draft/publish workflow

### 7. Document Repository
- Categories: CONTRACTS, PRESENTATIONS, BRAND_KIT, MARKETING, GUIDELINES
- File upload and storage
- Folder organization
- File type and size tracking
- Publishing status

### 8. Community Features
- Partner discovery
- Public profile viewing
- Search by category/skills

### 9. Notifications
- System notifications
- Type-based (CASE_UPDATE, EVENT, CONTENT, etc.)
- Read/unread status
- Action links
- Email integration

### 10. Dashboard & Analytics
- Partner count and case statistics
- Activity feed (cases, events, content, blog)
- Notifications panel
- Case status distribution
- Quick actions

---

## Database Schema

### Core Tables

#### profiles
User profiles and partner information
```sql
- id (UUID, PK, FK to auth.users)
- email, role (PARTNER|COMMERCIAL|ADMIN)
- company_name, logo_url
- contact_first_name, contact_last_name
- phone, address, city, region, country, postal_code
- category, website, description
- social_links (JSONB), tags (TEXT[])
- is_active, notification_preferences (JSONB)
- assigned_commercial_id (UUID, FK to profiles)
- created_at, updated_at
```

#### cases
Partner cases/matters
```sql
- id (UUID, PK)
- case_code (TEXT, UNIQUE)
- partner_id (UUID, FK)
- client_name, status
- notes, opened_at, closed_at
- created_at, updated_at
```

#### case_documents
Case attachments
```sql
- id (UUID, PK)
- case_id (UUID, FK)
- title, file_url, file_type
- uploaded_by (UUID, FK)
- created_at
```

#### case_history
Case audit trail
```sql
- id (UUID, PK)
- case_id (UUID, FK)
- old_status, new_status
- changed_by (UUID, FK)
- notes, created_at
```

#### events
Events and webinars
```sql
- id (UUID, PK)
- title, description, event_type
- start_datetime, end_datetime
- location, meeting_link, recording_url
- attachments (JSONB)
- created_by (UUID, FK)
- is_published
- created_at, updated_at
```

#### academy_content
Educational content
```sql
- id (UUID, PK)
- title, description, content_type
- thumbnail_url, media_url
- attachments (JSONB)
- year, duration_minutes, theme
- is_downloadable, is_published
- view_count
- created_at, updated_at
```

#### documents
Knowledge base files
```sql
- id (UUID, PK)
- title, description, category
- file_url, file_type, file_size
- folder_path, is_published
- created_at, updated_at
```

#### blog_posts
Blog articles
```sql
- id (UUID, PK)
- title, slug (UNIQUE)
- excerpt, content
- featured_image
- author_id (UUID, FK)
- category, tags (TEXT[])
- is_published, published_at
- view_count
- created_at, updated_at
```

#### notifications
User notifications
```sql
- id (UUID, PK)
- user_id (UUID, FK)
- title, message, type
- link, is_read
- created_at
```

#### access_requests
Partner registration requests
```sql
- id (UUID, PK)
- status (PENDING|APPROVED|REJECTED)
- reviewed_by (UUID, FK)
- reviewed_at, review_notes
- contact_first_name, contact_last_name
- contact_phone, contact_email
- contact_description, contact_photo_url
- company_name, legal_address, operational_address
- business_phone, generic_email, pec
- company_description, company_logo_url
- created_at, updated_at
```

### Additional Tables
- `event_registrations` - Event attendance tracking
- `content_completions` - Learning progress
- `partner_services` - Partner service offerings
- `partner_certifications` - Partner certifications
- `categories`, `services`, `certifications` - Lookup tables

### Row Level Security (RLS) Policies

**Profiles:**
- Anyone can view active profiles
- Users can update their own profile
- Admins have full access

**Cases:**
- Partners see only their own cases
- Commercials see cases of assigned partners
- Admins see all cases

**Public Content:**
- Published content visible to all
- Unpublished content restricted to creators/admins

**Access Requests:**
- Anyone can create (public form)
- Only admins/commercials can view
- Only admins can approve/reject

---

## API Operations

The application uses **Next.js Server Actions** instead of traditional REST APIs.

### Authentication (`lib/auth/actions.ts`)
```typescript
login(formData) → { success, error? }
signup(formData) → { success, error? }
logout() → void
getSession() → Session | null
getUser() → User | null
forgotPassword(formData) → { success, error? }
resetPassword(formData) → { success, error? }
updatePassword(current, new) → { success, error? }
```

### Admin Operations (`lib/data/admin.ts`)

**Partner Management:**
```typescript
getAdminStats() → { partners, cases, events, ... }
getAdminPartners(options) → { data: Partner[], count }
getAdminPartner(id) → Partner | null
createPartner(data) → Partner
updatePartner(id, data) → Partner
togglePartnerStatus(id, active) → Partner
deletePartner(id) → void
uploadPartnerLogo(formData) → { url }
```

**Case Management:**
```typescript
getAdminCases(options) → { data: Case[], count }
getAdminCase(id) → Case
createCase(data) → Case
updateCase(id, data, historyNote) → Case
deleteCase(id) → void
```

**Event, Academy, Document, Blog Management:**
- Similar CRUD operations for each entity

### User Operations

**Profile (`lib/data/profiles.ts`):**
```typescript
getProfile(userId) → Profile
getCurrentUserProfile() → Profile
updateProfile(userId, updates) → Profile
getPartners(options) → { data: Partner[], count }
```

**Cases (`lib/data/cases.ts`):**
```typescript
getCases(options) → { data: Case[], count }
getMyCase(caseId) → Case
getMyCases() → Case[]
```

**Events (`lib/data/events.ts`):**
```typescript
getEvents(options) → { data: Event[], count }
getUpcomingEvents(limit) → Event[]
getEventDetail(eventId) → Event
```

**Academy (`lib/data/academy.ts`):**
```typescript
getAcademyContent(options) → { data: Content[], count }
getLatestAcademyContent(limit) → Content[]
getAcademyItem(itemId) → Content
getAcademyStats() → { totalContent, ... }
```

**Blog (`lib/data/blog.ts`):**
```typescript
getBlogPosts(options) → { data: Post[], count }
getBlogPost(slug) → Post
getLatestBlogPosts(limit) → Post[]
getBlogCategories() → string[]
getBlogTags() → string[]
getBlogStats() → { totalPosts, ... }
incrementBlogViewCount(slug) → void
```

**Documents (`lib/data/documents.ts`):**
```typescript
getDocuments(options) → { data: Document[], count }
getDocumentsByCategory(category) → Document[]
getDocument(id) → Document
```

**Notifications (`lib/data/notifications.ts`):**
```typescript
getMyNotifications() → Notification[]
getUnreadCount() → number
markAsRead(id) → void
deleteNotification(id) → void
```

**Access Requests (`lib/data/accessRequests.ts`):**
```typescript
submitAccessRequest(data) → AccessRequest
getAccessRequests(options) → { data: Request[], count }
getAccessRequest(id) → AccessRequest
approveAccessRequest(id, notes) → void
rejectAccessRequest(id, notes) → void
deleteAccessRequest(id) → void
```

**Dashboard (`lib/data/dashboard.ts`):**
```typescript
getActivityFeed(options) → { data: Activity[], count }
getDashboardData() → { stats, activities, notifications }
```

---

## Authentication & Authorization

### Authentication Strategy
- **Provider**: Supabase Auth
- **Method**: Email/Password (session-based)
- **Session Storage**: HTTP-only cookies
- **Session Refresh**: Automatic via middleware

### Authorization Strategy
- **Method**: Role-Based Access Control (RBAC)
- **Roles**:
  - `PARTNER`: View own content, cases, profile
  - `COMMERCIAL`: Manage assigned partners' cases
  - `ADMIN`: Full system access

### Implementation

**Middleware (`middleware.ts`):**
- Protects authenticated routes
- Redirects unauthenticated users
- Language-aware routing
- Protected routes: `/dashboard`, `/community`, `/events`, `/academy`, `/documents`, `/cases`, `/blog`, `/profile`, `/settings`

**Database RLS:**
- Enforced at Supabase level
- Cannot be bypassed by client
- Prevents unauthorized data access

**Session Management:**
- Session stored in cookies
- Auto-refresh by middleware
- Application-level timeout component
- Logout clears session and redirects

---

## Configuration

### Environment Variables

Create `.env.local` in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ewnxzhxeclxrrkqvtxej.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_PROJECT_ID=ewnxzhxeclxrrkqvtxej

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email
RESEND_API_KEY=your_resend_api_key
FROM_EMAIL=noreply@yourdomain.com
```

### Next.js Configuration (`next.config.ts`)

```typescript
{
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'ewnxzhxeclxrrkqvtxej.supabase.co'
    }]
  },
  serverActions: {
    bodySizeLimit: '10mb'
  }
}
```

### Internationalization (`i18n.ts`)

- **Locales**: en, it, fr
- **Default**: en
- **Translation files**: `messages/*.json`
- **Routing**: `/[locale]/...`

---

## Setup & Installation

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Resend account (for emails)

### Installation Steps

1. **Clone the repository**
```bash
cd C:\Users\tahaa\OneDrive\Documents\GitHub\arcadia-hub
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
- Copy `.env.example` to `.env.local`
- Fill in all required values

4. **Set up Supabase**
- Create a new Supabase project
- Run migrations from `supabase/migrations/`
- Update environment variables with project credentials

5. **Set up Resend**
- Create Resend account
- Generate API key
- Update `FROM_EMAIL` to verified domain

6. **Run development server**
```bash
npm run dev
```

7. **Access the application**
- Open http://localhost:3000
- Default language will be English

### Database Seeding

To seed the database with sample data:

```bash
npm run seed
```

---

## Deployment

### Vercel Deployment

1. **Connect repository to Vercel**
2. **Configure environment variables**
   - Add all variables from `.env.local`
3. **Deploy**

### Build Locally

```bash
npm run build
npm start
```

### Post-Deployment Steps

1. Update `NEXT_PUBLIC_APP_URL` to production URL
2. Configure Supabase redirect URLs for production
3. Verify email domain in Resend
4. Test authentication flow
5. Test file uploads to Supabase Storage
6. Verify RLS policies are working

---

## Development Commands

```bash
# Development
npm run dev                 # Start dev server

# Production
npm run build              # Build for production
npm start                  # Start production server

# Code Quality
npm run lint               # Run ESLint
npm run type-check         # TypeScript check (if configured)

# Database
npm run seed               # Seed database (requires tsx)
```

---

## Key Technologies Summary

| Technology | Purpose | Version |
|------------|---------|---------|
| Next.js | Framework | 16.0.7 |
| React | UI Library | 19.2.0 |
| TypeScript | Type Safety | 5 |
| Tailwind CSS | Styling | 4 |
| Supabase | Backend/Auth/DB | 2.86.0 |
| next-intl | i18n | 4.5.6 |
| Resend | Email | 6.5.2 |
| Zod | Validation | 4.1.13 |
| date-fns | Date Utils | 4.1.0 |

---

## Security Best Practices

1. **RLS Policies**: All tables have appropriate RLS policies
2. **Environment Variables**: Never commit `.env.local`
3. **Service Role Key**: Use only in server-side code
4. **Input Validation**: All inputs validated with Zod
5. **Session Security**: HTTP-only cookies
6. **File Uploads**: Validate file types and sizes
7. **Email Verification**: Required for password resets

---

## Support & Maintenance

### Common Issues

**Issue: Session expires too quickly**
- Adjust session timeout in `SessionTimeout.tsx`
- Check Supabase project settings

**Issue: RLS policies blocking operations**
- Verify user role in database
- Check RLS policies for specific table
- Use service role client for admin operations

**Issue: Emails not sending**
- Verify Resend API key
- Check `FROM_EMAIL` is from verified domain
- Check Resend dashboard for logs

**Issue: File uploads failing**
- Check Supabase Storage policies
- Verify file size limits (10MB default)
- Check Supabase Storage bucket exists

### Maintenance Tasks

- **Regular**: Review access requests
- **Weekly**: Check error logs
- **Monthly**: Review active partners
- **Quarterly**: Audit RLS policies
- **Annually**: Update dependencies

---

## Future Enhancement Ideas

1. **Advanced Analytics**: Partner engagement metrics
2. **Mobile App**: React Native companion
3. **Real-time Collaboration**: Live document editing
4. **AI Integration**: Content recommendations
5. **Advanced Notifications**: Push notifications
6. **CRM Integration**: Salesforce/HubSpot sync
7. **Multi-tenancy**: Support multiple organizations
8. **Advanced Search**: Full-text search with filters
9. **Reporting**: Automated report generation
10. **API**: Public API for integrations

---

## License & Credits

**Project**: Arcadia Hub
**Last Updated**: December 2024
**Developer**: Taha Amnay ALLAM
**Framework**: Next.js
**Database**: Supabase

---

*This documentation was generated for knowledge transfer purposes as part of company transition.*

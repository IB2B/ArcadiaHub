# Arcadia Hub

**B2B Partner Management & Engagement Platform**

[![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)](https://tailwindcss.com/)

---

## 🚀 Project Status

**Version**: 1.0 - ✅ Delivered to Client

**Current Phase**: Client Review & Feedback

**Last Updated**: January 5, 2026

> **Note**: Version 1.0 has been successfully delivered and deployed. The application is currently being evaluated by the client. Next steps involve collecting feedback and planning Phase 2 enhancements.

---

## 📋 Quick Links

- **[Technical Documentation](./TECHNICAL_DOCUMENTATION.md)** - Complete technical reference
- **[Client Feedback Tracker](./CLIENT_FEEDBACK_TRACKER.md)** - Template for tracking feedback and Phase 2 requirements

---

## 🎯 What is Arcadia Hub?

Arcadia Hub is a comprehensive B2B platform designed to centralize and streamline partner relationships. It provides tools for:

- **Partner Management**: Onboarding, profiles, and relationship management
- **Case Tracking**: Complete case lifecycle management with document attachments
- **Event Scheduling**: Webinars, workshops, and training sessions
- **Academy**: Educational content library (videos, slides, podcasts)
- **Document Repository**: Centralized knowledge base
- **Blog & News**: Internal communication and announcements
- **Community**: Partner discovery and collaboration
- **Admin Dashboard**: Comprehensive oversight and management

---

## 🌍 Multi-Language Support

The platform supports three languages out of the box:
- 🇬🇧 English
- 🇮🇹 Italian
- 🇫🇷 French

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16.0.7 (App Router)
- **Language**: TypeScript 5
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Email**: Resend
- **Styling**: Tailwind CSS 4
- **i18n**: next-intl 4.5.6

---

## 🚦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Resend account (for emails)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in required variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   RESEND_API_KEY=your_resend_key
   FROM_EMAIL=noreply@yourdomain.com
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Open the app**

   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
arcadia-hub/
├── src/
│   ├── app/                    # Next.js App Router
│   │   └── [locale]/          # Multi-language routing
│   │       ├── (admin)/       # Admin panel
│   │       ├── (auth)/        # Authentication
│   │       └── (dashboard)/   # User dashboard
│   ├── components/            # React components
│   ├── lib/
│   │   ├── auth/             # Authentication logic
│   │   ├── data/             # Data operations
│   │   ├── database/         # Supabase clients
│   │   └── email/            # Email service
│   ├── types/                # TypeScript types
│   └── middleware.ts         # Route protection
├── messages/                  # i18n translations
│   ├── en.json
│   ├── it.json
│   └── fr.json
└── supabase/
    └── migrations/           # Database migrations
```

---

## 👥 User Roles

- **PARTNER**: External organizations with limited access to their own data
- **COMMERCIAL**: Relationship managers who oversee partner accounts
- **ADMIN**: Full system access for management and oversight

---

## 🔐 Security Features

- Row-Level Security (RLS) policies at database level
- Role-based access control
- Middleware-based route protection
- Secure session management
- Email verification for password resets

---

## 🧪 Available Scripts

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run seed        # Seed database with sample data
```

---

## 📊 Database

The application uses **Supabase** (PostgreSQL) with the following key tables:

- `profiles` - User and partner profiles
- `cases` - Case/matter tracking
- `events` - Event scheduling
- `academy_content` - Educational content
- `documents` - Document repository
- `blog_posts` - Blog/news articles
- `notifications` - User notifications
- `access_requests` - Partner registration requests

See [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) for complete schema.

---

## 🌐 Deployment

The application is **Vercel-ready** and can be deployed with one click.

### Deployment Checklist

- [ ] Set up production Supabase project
- [ ] Run database migrations
- [ ] Configure RLS policies
- [ ] Set up Resend with verified domain
- [ ] Configure environment variables in Vercel
- [ ] Update `NEXT_PUBLIC_APP_URL`
- [ ] Test authentication flow
- [ ] Verify all three languages work

---

## 📝 Client Feedback Process

**For tracking client feedback and Phase 2 requirements**, use the provided template:

[CLIENT_FEEDBACK_TRACKER.md](./CLIENT_FEEDBACK_TRACKER.md)

This template includes:
- Feedback item tracking table
- Priority levels (High/Medium/Low)
- Effort estimation
- Meeting notes section
- Phase 2 timeline planning

---

## 🔄 Current Status & Next Steps

### ✅ Completed (v1.0)
- Complete partner management system
- Case tracking with document attachments
- Event scheduling and management
- Educational academy content system
- Document repository
- Blog/news system
- Admin dashboard
- Multi-language support (EN, IT, FR)
- Email notifications
- Role-based access control

### 🔄 Current Phase
- Client testing and evaluation
- Gathering feedback for improvements
- Awaiting requirements for Phase 2

### ⏳ Awaiting
- Client feedback on v1.0
- Priority assignment for requested changes
- Timeline agreement for Phase 2
- Budget approval for enhancements

---

## 📚 Documentation

- **[TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)** - Complete technical reference with:
  - Detailed architecture explanation
  - Complete database schema
  - API operations reference
  - Authentication & security details
  - Setup and deployment guides
  - Troubleshooting section

- **[CLIENT_FEEDBACK_TRACKER.md](./CLIENT_FEEDBACK_TRACKER.md)** - Feedback tracking template

---

## 🆘 Support

For questions or issues:
1. Check [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)
2. Review Supabase dashboard for database issues
3. Check Vercel deployment logs
4. Verify environment variables

---

## 🙏 Handover Notes

This project is being handed over as part of a company transition. All documentation has been prepared to ensure smooth knowledge transfer. Key files:

- `TECHNICAL_DOCUMENTATION.md` - Complete technical guide
- `CLIENT_FEEDBACK_TRACKER.md` - Feedback collection template
- `PROJECT_HANDOVER_SUMMARY.md` (in parent directory) - Overview of all projects

---

## 📄 License

[Your License]

---

**Built with ❤️ using Next.js, TypeScript, and Supabase**

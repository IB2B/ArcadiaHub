-- ============================================
-- Arcadia Hub - Initial Database Schema
-- ============================================

-- ============================================
-- DROP EXISTING OBJECTS (Clean Slate)
-- ============================================
-- Drop tables in reverse dependency order (CASCADE will handle triggers and policies)
DROP TABLE IF EXISTS certifications CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS case_history CASCADE;
DROP TABLE IF EXISTS case_documents CASCADE;
DROP TABLE IF EXISTS cases CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS academy_content CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS partner_certifications CASCADE;
DROP TABLE IF EXISTS partner_services CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop functions (CASCADE removes dependent triggers)
DROP FUNCTION IF EXISTS log_case_status_change() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- Enable UUID extension
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends auth.users)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'PARTNER' CHECK (role IN ('PARTNER', 'COMMERCIAL', 'ADMIN')),
  company_name TEXT,
  logo_url TEXT,
  contact_first_name TEXT,
  contact_last_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  postal_code TEXT,
  category TEXT,
  website TEXT,
  description TEXT,
  social_links JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  notification_preferences JSONB DEFAULT '{"email": true, "push": true}',
  assigned_commercial_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTNER SERVICES
-- ============================================
CREATE TABLE partner_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PARTNER CERTIFICATIONS
-- ============================================
CREATE TABLE partner_certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  certification_name TEXT NOT NULL,
  obtained_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EVENTS
-- ============================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL CHECK (event_type IN ('TRAINING', 'WORKSHOP', 'WEBINAR', 'PHYSICAL')),
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  location TEXT,
  meeting_link TEXT,
  recording_url TEXT,
  attachments JSONB DEFAULT '[]',
  created_by UUID REFERENCES profiles(id),
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ACADEMY CONTENT
-- ============================================
CREATE TABLE academy_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL CHECK (content_type IN ('VIDEO', 'GALLERY', 'SLIDES', 'PODCAST', 'RECORDING')),
  thumbnail_url TEXT,
  media_url TEXT,
  attachments JSONB DEFAULT '[]',
  year INTEGER,
  theme TEXT,
  duration_minutes INTEGER,
  is_downloadable BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DOCUMENTS
-- ============================================
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('CONTRACTS', 'PRESENTATIONS', 'BRAND_KIT', 'MARKETING', 'GUIDELINES')),
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  folder_path TEXT DEFAULT '/',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- BLOG POSTS
-- ============================================
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  author_id UUID REFERENCES profiles(id),
  category TEXT,
  tags TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CASES (PRATICHE)
-- ============================================
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_code TEXT UNIQUE NOT NULL,
  partner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'IN_PROGRESS', 'SUSPENDED', 'COMPLETED', 'CANCELLED')),
  notes TEXT,
  opened_at DATE DEFAULT CURRENT_DATE,
  closed_at DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CASE DOCUMENTS
-- ============================================
CREATE TABLE case_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CASE HISTORY
-- ============================================
CREATE TABLE case_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT CHECK (type IN ('INFO', 'CASE_UPDATE', 'EVENT', 'CONTENT')),
  link TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- LOOKUP TABLES
-- ============================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_category ON profiles(category);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_cases_partner_id ON cases(partner_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_events_start_datetime ON events(start_datetime);
CREATE INDEX idx_events_is_published ON events(is_published);
CREATE INDEX idx_academy_content_type ON academy_content(content_type);
CREATE INDEX idx_academy_year ON academy_content(year);
CREATE INDEX idx_documents_category ON documents(category);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_is_published ON blog_posts(is_published);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE academy_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES - PARTNER SERVICES & CERTIFICATIONS
-- ============================================
-- Partners can see their own services
CREATE POLICY "Partners see own services" ON partner_services
  FOR SELECT USING (partner_id = auth.uid());

-- Admins/Commercials can manage partner services
CREATE POLICY "Staff manage partner services" ON partner_services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'COMMERCIAL')
    )
  );

-- Partners can see their own certifications
CREATE POLICY "Partners see own certifications" ON partner_certifications
  FOR SELECT USING (partner_id = auth.uid());

-- Admins/Commercials can manage partner certifications
CREATE POLICY "Staff manage partner certifications" ON partner_certifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'COMMERCIAL')
    )
  );

-- ============================================
-- RLS POLICIES - PROFILES
-- ============================================
-- Users can view all active profiles (for community)
CREATE POLICY "Anyone can view active profiles" ON profiles
  FOR SELECT USING (is_active = true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================
-- RLS POLICIES - CASES
-- ============================================
-- Partners can only see their own cases
CREATE POLICY "Partners see own cases" ON cases
  FOR SELECT USING (partner_id = auth.uid());

-- Commercials can see cases of their assigned partners
CREATE POLICY "Commercials see assigned partner cases" ON cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = cases.partner_id
      AND profiles.assigned_commercial_id = auth.uid()
    )
  );

-- Admins can see all cases
CREATE POLICY "Admins see all cases" ON cases
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================
-- RLS POLICIES - PUBLIC CONTENT
-- ============================================
-- Everyone can view published events
CREATE POLICY "Anyone can view published events" ON events
  FOR SELECT USING (is_published = true);

-- Admins/Commercials can manage events
CREATE POLICY "Admins manage events" ON events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'COMMERCIAL')
    )
  );

-- Everyone can view published academy content
CREATE POLICY "Anyone can view published academy content" ON academy_content
  FOR SELECT USING (is_published = true);

-- Admins can manage academy content
CREATE POLICY "Admins manage academy content" ON academy_content
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Everyone can view published documents
CREATE POLICY "Anyone can view published documents" ON documents
  FOR SELECT USING (is_published = true);

-- Admins can manage documents
CREATE POLICY "Admins manage documents" ON documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Everyone can view published blog posts
CREATE POLICY "Anyone can view published blog posts" ON blog_posts
  FOR SELECT USING (is_published = true);

-- Admins can manage blog posts
CREATE POLICY "Admins manage blog posts" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================
-- RLS POLICIES - CASE DOCUMENTS & HISTORY
-- ============================================
-- Partners can see documents for their own cases
CREATE POLICY "Partners see own case documents" ON case_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases WHERE cases.id = case_documents.case_id AND cases.partner_id = auth.uid()
    )
  );

-- Partners can upload documents to their own cases
CREATE POLICY "Partners upload own case documents" ON case_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases WHERE cases.id = case_documents.case_id AND cases.partner_id = auth.uid()
    )
  );

-- Commercials can see/manage documents for assigned partner cases
CREATE POLICY "Commercials manage assigned case documents" ON case_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cases
      JOIN profiles ON profiles.id = cases.partner_id
      WHERE cases.id = case_documents.case_id
      AND profiles.assigned_commercial_id = auth.uid()
    )
  );

-- Admins can manage all case documents
CREATE POLICY "Admins manage all case documents" ON case_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- Partners can see history for their own cases
CREATE POLICY "Partners see own case history" ON case_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases WHERE cases.id = case_history.case_id AND cases.partner_id = auth.uid()
    )
  );

-- Commercials can see history for assigned partner cases
CREATE POLICY "Commercials see assigned case history" ON case_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cases
      JOIN profiles ON profiles.id = cases.partner_id
      WHERE cases.id = case_history.case_id
      AND profiles.assigned_commercial_id = auth.uid()
    )
  );

-- Admins can see all case history
CREATE POLICY "Admins see all case history" ON case_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'
    )
  );

-- ============================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================
-- Users can only see their own notifications
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users update own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- TRIGGERS - Auto-update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academy_content_updated_at
  BEFORE UPDATE ON academy_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- TRIGGER - Create profile on user signup
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'PARTNER');
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- TRIGGER - Add case history on status change
-- ============================================
CREATE OR REPLACE FUNCTION log_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO case_history (case_id, action, description)
    VALUES (NEW.id, 'STATUS_CHANGE', 'Status changed from ' || COALESCE(OLD.status, 'NULL') || ' to ' || NEW.status);
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_case_status_change
  AFTER UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION log_case_status_change();

-- ============================================
-- RLS POLICIES - LOOKUP TABLES
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Everyone can read lookup tables (they're public reference data)
CREATE POLICY "Anyone can view categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view services" ON services FOR SELECT USING (true);
CREATE POLICY "Anyone can view certifications" ON certifications FOR SELECT USING (true);

-- Only admins can manage lookup tables
CREATE POLICY "Admins manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins manage services" ON services
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

CREATE POLICY "Admins manage certifications" ON certifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
  );

-- ============================================
-- STORAGE BUCKETS
-- ============================================
-- Note: Run these in the Supabase Dashboard > Storage or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES
--   ('avatars', 'avatars', true),
--   ('logos', 'logos', true),
--   ('documents', 'documents', false),
--   ('case-files', 'case-files', false),
--   ('academy-media', 'academy-media', false),
--   ('blog-images', 'blog-images', true);

-- ============================================
-- STORAGE POLICIES (Example - apply via Dashboard)
-- ============================================
-- Avatars: Users can upload/update their own avatar
-- CREATE POLICY "Users manage own avatar" ON storage.objects
--   FOR ALL USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Documents: Authenticated users can view, admins can upload
-- Case files: Partners can upload to their cases, admins full access

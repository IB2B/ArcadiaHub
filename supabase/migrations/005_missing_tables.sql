-- ============================================
-- Missing Tables
-- event_registrations, content_completions, case_code_seq,
-- suggestions, comments, created_by on profiles
-- ============================================

-- ============================================
-- Add created_by to profiles (tracks which COMMERCIAL created a sub-user)
-- ============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES profiles(id);

-- ============================================
-- Event Registrations
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  attended BOOLEAN DEFAULT false,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);

-- Partners can see their own registrations
DROP POLICY IF EXISTS "Users see own event registrations" ON event_registrations;
CREATE POLICY "Users see own event registrations" ON event_registrations
  FOR SELECT USING (user_id = auth.uid());

-- Partners can register themselves
DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;
CREATE POLICY "Users can register for events" ON event_registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Partners can unregister themselves
DROP POLICY IF EXISTS "Users can unregister from events" ON event_registrations;
CREATE POLICY "Users can unregister from events" ON event_registrations
  FOR DELETE USING (user_id = auth.uid());

-- Admins/Commercials can manage all registrations
DROP POLICY IF EXISTS "Staff manage event registrations" ON event_registrations;
CREATE POLICY "Staff manage event registrations" ON event_registrations
  FOR ALL USING (public.is_admin() OR public.is_commercial());

-- ============================================
-- Content Completions
-- ============================================
CREATE TABLE IF NOT EXISTS content_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES academy_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  progress_percent INTEGER DEFAULT 100,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(content_id, user_id)
);

ALTER TABLE content_completions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_content_completions_user_id ON content_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_content_completions_content_id ON content_completions(content_id);

-- Partners can see their own completions
DROP POLICY IF EXISTS "Users see own completions" ON content_completions;
CREATE POLICY "Users see own completions" ON content_completions
  FOR SELECT USING (user_id = auth.uid());

-- Partners can mark content complete
DROP POLICY IF EXISTS "Users can mark content complete" ON content_completions;
CREATE POLICY "Users can mark content complete" ON content_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Allow upsert (update own completions)
DROP POLICY IF EXISTS "Users can update own completions" ON content_completions;
CREATE POLICY "Users can update own completions" ON content_completions
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can see all completions
DROP POLICY IF EXISTS "Staff see all completions" ON content_completions;
CREATE POLICY "Staff see all completions" ON content_completions
  FOR SELECT USING (public.is_admin() OR public.is_commercial());

-- ============================================
-- Case Code Sequence
-- ============================================
CREATE SEQUENCE IF NOT EXISTS case_code_seq START 1000 INCREMENT 1;

CREATE OR REPLACE FUNCTION next_case_code()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  seq_part TEXT;
BEGIN
  year_part := EXTRACT(YEAR FROM NOW())::TEXT;
  seq_part := LPAD(nextval('case_code_seq')::TEXT, 4, '0');
  RETURN year_part || '-' || seq_part;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Suggestions
-- ============================================
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);

-- Partners can insert their own suggestions
DROP POLICY IF EXISTS "Partners can submit suggestions" ON suggestions;
CREATE POLICY "Partners can submit suggestions" ON suggestions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Partners can view their own suggestions
DROP POLICY IF EXISTS "Partners see own suggestions" ON suggestions;
CREATE POLICY "Partners see own suggestions" ON suggestions
  FOR SELECT USING (user_id = auth.uid());

-- Admins/Commercials can view all suggestions
DROP POLICY IF EXISTS "Staff see all suggestions" ON suggestions;
CREATE POLICY "Staff see all suggestions" ON suggestions
  FOR SELECT USING (public.is_admin() OR public.is_commercial());

-- Admins/Commercials can update status and admin_reply
DROP POLICY IF EXISTS "Staff update suggestions" ON suggestions;
CREATE POLICY "Staff update suggestions" ON suggestions
  FOR UPDATE USING (public.is_admin() OR public.is_commercial());

CREATE OR REPLACE TRIGGER update_suggestions_updated_at
  BEFORE UPDATE ON suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Comments
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('case', 'blog_post', 'event', 'academy_content')),
  entity_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  mentions UUID[] NOT NULL DEFAULT '{}',
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  edited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_author ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- Any authenticated user can read comments
DROP POLICY IF EXISTS "Authenticated users can read comments" ON comments;
CREATE POLICY "Authenticated users can read comments" ON comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Authenticated users can insert their own comments
DROP POLICY IF EXISTS "Authenticated users can post comments" ON comments;
CREATE POLICY "Authenticated users can post comments" ON comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

-- Authors can edit their own comments
DROP POLICY IF EXISTS "Authors can update own comments" ON comments;
CREATE POLICY "Authors can update own comments" ON comments
  FOR UPDATE USING (author_id = auth.uid());

-- Authors and admins can delete comments
DROP POLICY IF EXISTS "Authors and admins can delete comments" ON comments;
CREATE POLICY "Authors and admins can delete comments" ON comments
  FOR DELETE USING (author_id = auth.uid() OR public.is_admin());

CREATE OR REPLACE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

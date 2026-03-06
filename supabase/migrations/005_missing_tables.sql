-- ============================================
-- Migration 005: Missing Tables
-- ============================================
-- Creates event_registrations, content_completions,
-- case_code sequence, suggestions, and comments tables.
-- Uses IF NOT EXISTS for idempotency.
-- ============================================

-- ============================================
-- EVENT REGISTRATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, user_id)
);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id
  ON event_registrations (event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id
  ON event_registrations (user_id);

-- Users can view their own registrations
DROP POLICY IF EXISTS "Users view own registrations" ON event_registrations;
CREATE POLICY "Users view own registrations" ON event_registrations
  FOR SELECT USING (user_id = auth.uid());

-- Users can register themselves for events
DROP POLICY IF EXISTS "Users register for events" ON event_registrations;
CREATE POLICY "Users register for events" ON event_registrations
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can cancel their own registrations
DROP POLICY IF EXISTS "Users cancel own registrations" ON event_registrations;
CREATE POLICY "Users cancel own registrations" ON event_registrations
  FOR DELETE USING (user_id = auth.uid());

-- Admins can manage all registrations
DROP POLICY IF EXISTS "Admins manage registrations" ON event_registrations;
CREATE POLICY "Admins manage registrations" ON event_registrations
  FOR ALL USING (public.is_admin());

-- ============================================
-- CONTENT COMPLETIONS
-- ============================================
CREATE TABLE IF NOT EXISTS content_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID NOT NULL REFERENCES academy_content(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (content_id, user_id)
);

ALTER TABLE content_completions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_content_completions_content_id
  ON content_completions (content_id);
CREATE INDEX IF NOT EXISTS idx_content_completions_user_id
  ON content_completions (user_id);

-- Users can view their own completions
DROP POLICY IF EXISTS "Users view own completions" ON content_completions;
CREATE POLICY "Users view own completions" ON content_completions
  FOR SELECT USING (user_id = auth.uid());

-- Users can mark content as complete
DROP POLICY IF EXISTS "Users mark content complete" ON content_completions;
CREATE POLICY "Users mark content complete" ON content_completions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can remove their own completions
DROP POLICY IF EXISTS "Users remove own completions" ON content_completions;
CREATE POLICY "Users remove own completions" ON content_completions
  FOR DELETE USING (user_id = auth.uid());

-- Admins can manage all completions
DROP POLICY IF EXISTS "Admins manage completions" ON content_completions;
CREATE POLICY "Admins manage completions" ON content_completions
  FOR ALL USING (public.is_admin());

-- ============================================
-- CASE CODE SEQUENCE + FUNCTION
-- ============================================
CREATE SEQUENCE IF NOT EXISTS case_code_seq START 1;

CREATE OR REPLACE FUNCTION next_case_code()
RETURNS TEXT AS $$
DECLARE
  seq_val BIGINT;
BEGIN
  seq_val := nextval('case_code_seq');
  RETURN EXTRACT(YEAR FROM NOW())::TEXT || '-' || LPAD(seq_val::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SUGGESTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'IMPLEMENTED')),
  votes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_suggestions_user_id ON suggestions (user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions (status, created_at DESC);

-- Authenticated users can view all suggestions
DROP POLICY IF EXISTS "Users view suggestions" ON suggestions;
CREATE POLICY "Users view suggestions" ON suggestions
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can create suggestions
DROP POLICY IF EXISTS "Users create suggestions" ON suggestions;
CREATE POLICY "Users create suggestions" ON suggestions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own suggestions
DROP POLICY IF EXISTS "Users update own suggestions" ON suggestions;
CREATE POLICY "Users update own suggestions" ON suggestions
  FOR UPDATE USING (user_id = auth.uid());

-- Admins can manage all suggestions
DROP POLICY IF EXISTS "Admins manage suggestions" ON suggestions;
CREATE POLICY "Admins manage suggestions" ON suggestions
  FOR ALL USING (public.is_admin());

-- ============================================
-- COMMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('suggestion', 'case', 'blog_post', 'event', 'academy_content')),
  entity_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_comments_entity
  ON comments (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id
  ON comments (parent_id)
  WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_comments_user_id
  ON comments (user_id);

-- Authenticated users can view comments
DROP POLICY IF EXISTS "Users view comments" ON comments;
CREATE POLICY "Users view comments" ON comments
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Users can create comments
DROP POLICY IF EXISTS "Users create comments" ON comments;
CREATE POLICY "Users create comments" ON comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own comments
DROP POLICY IF EXISTS "Users update own comments" ON comments;
CREATE POLICY "Users update own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

-- Users can delete their own comments
DROP POLICY IF EXISTS "Users delete own comments" ON comments;
CREATE POLICY "Users delete own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- Admins can manage all comments
DROP POLICY IF EXISTS "Admins manage comments" ON comments;
CREATE POLICY "Admins manage comments" ON comments
  FOR ALL USING (public.is_admin());

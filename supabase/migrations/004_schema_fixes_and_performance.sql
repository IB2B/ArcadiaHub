-- ============================================
-- Migration 003: Schema Fixes + Performance
-- ============================================
-- Aligns SQL schema with TypeScript types, adds
-- composite indexes, pg_trgm for fast text search.
-- ============================================

-- ============================================
-- FIX: case_history column names
-- SQL had: action, description, performed_by
-- Types expect: old_status, new_status, changed_by, notes
-- ============================================
DO $$
BEGIN
  -- Rename 'action' -> 'new_status' (it stored the new case status)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'case_history' AND column_name = 'action'
  ) THEN
    ALTER TABLE case_history RENAME COLUMN action TO new_status;
  END IF;

  -- Rename 'description' -> 'notes'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'case_history' AND column_name = 'description'
  ) THEN
    ALTER TABLE case_history RENAME COLUMN description TO notes;
  END IF;

  -- Rename 'performed_by' -> 'changed_by'
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'case_history' AND column_name = 'performed_by'
  ) THEN
    ALTER TABLE case_history RENAME COLUMN performed_by TO changed_by;
  END IF;

  -- Add 'old_status' column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'case_history' AND column_name = 'old_status'
  ) THEN
    ALTER TABLE case_history ADD COLUMN old_status TEXT;
  END IF;
END $$;

-- ============================================
-- FIX: case_documents column name
-- SQL had: file_name TEXT NOT NULL
-- Types expect: title TEXT NOT NULL
-- ============================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'case_documents' AND column_name = 'file_name'
  ) THEN
    ALTER TABLE case_documents RENAME COLUMN file_name TO title;
  END IF;
END $$;

-- ============================================
-- FIX: notifications type constraint
-- Old constraint only allowed INFO | CASE_UPDATE | EVENT | CONTENT
-- App uses a much wider set of types
-- ============================================
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check CHECK (
    type IS NULL OR type IN (
      'event_created',
      'event_updated',
      'case_created',
      'case_status_changed',
      'case_document_added',
      'document_published',
      'academy_content_published',
      'blog_post_published',
      'partner_registered',
      'access_request_submitted',
      'system_announcement',
      'mention',
      'suggestion_reply',
      -- Legacy values kept for backwards compat
      'INFO',
      'CASE_UPDATE',
      'EVENT',
      'CONTENT'
    )
  );

-- ============================================
-- FIX: log_case_status_change trigger
-- Update to use new column names
-- ============================================
CREATE OR REPLACE FUNCTION log_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO case_history (case_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS log_case_status_change_trigger ON cases;
CREATE TRIGGER log_case_status_change_trigger
  AFTER UPDATE OF status ON cases
  FOR EACH ROW EXECUTE FUNCTION log_case_status_change();

-- ============================================
-- PERFORMANCE: Enable pg_trgm for fuzzy search
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- PERFORMANCE: GIN trgm indexes for text search
-- Makes ilike.%term% queries O(log n) instead of O(n)
-- ============================================

-- Profiles: searched by company_name, email, contact names
CREATE INDEX IF NOT EXISTS idx_profiles_company_name_trgm
  ON profiles USING gin (company_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_email_trgm
  ON profiles USING gin (email gin_trgm_ops);

-- Cases: searched by case_code and client_name
CREATE INDEX IF NOT EXISTS idx_cases_case_code_trgm
  ON cases USING gin (case_code gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_cases_client_name_trgm
  ON cases USING gin (client_name gin_trgm_ops);

-- Blog posts: searched by title and excerpt
CREATE INDEX IF NOT EXISTS idx_blog_posts_title_trgm
  ON blog_posts USING gin (title gin_trgm_ops);

-- Events: searched by title
CREATE INDEX IF NOT EXISTS idx_events_title_trgm
  ON events USING gin (title gin_trgm_ops);

-- Academy content: searched by title
CREATE INDEX IF NOT EXISTS idx_academy_content_title_trgm
  ON academy_content USING gin (title gin_trgm_ops);

-- ============================================
-- PERFORMANCE: Composite indexes for common queries
-- ============================================

-- cases: most common access pattern is partner_id + ordered by created_at
CREATE INDEX IF NOT EXISTS idx_cases_partner_created
  ON cases (partner_id, created_at DESC);

-- cases: status filter + partner
CREATE INDEX IF NOT EXISTS idx_cases_partner_status
  ON cases (partner_id, status);

-- events: published + datetime ordering (list page)
CREATE INDEX IF NOT EXISTS idx_events_published_start
  ON events (is_published, start_datetime ASC);

-- notifications: user unread panel (most common read path)
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications (user_id, is_read, created_at DESC);

-- academy_content: published + type filter
CREATE INDEX IF NOT EXISTS idx_academy_published_type
  ON academy_content (is_published, content_type, created_at DESC);

-- academy_content: published + year filter
CREATE INDEX IF NOT EXISTS idx_academy_published_year
  ON academy_content (is_published, year DESC);

-- documents: published + category filter
CREATE INDEX IF NOT EXISTS idx_documents_published_category
  ON documents (is_published, category, created_at DESC);

-- blog_posts: published + published_at ordering
CREATE INDEX IF NOT EXISTS idx_blog_published_at
  ON blog_posts (is_published, published_at DESC);

-- profiles: assigned commercial (for team views)
CREATE INDEX IF NOT EXISTS idx_profiles_assigned_commercial
  ON profiles (assigned_commercial_id)
  WHERE assigned_commercial_id IS NOT NULL;

-- access_requests: status filter (admin list page)
CREATE INDEX IF NOT EXISTS idx_access_requests_status
  ON access_requests (status, created_at DESC);

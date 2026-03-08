-- ============================================
-- Migration 007: Update suggestions and comments schema
-- Aligns DB tables with Phase 3 server actions
-- ============================================

-- ============================================
-- SUGGESTIONS: rename/add columns
-- ============================================

-- Rename title → subject (if old column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suggestions' AND column_name='title') THEN
    ALTER TABLE suggestions RENAME COLUMN title TO subject;
  END IF;
END $$;

-- Rename body → message (if old column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suggestions' AND column_name='body') THEN
    ALTER TABLE suggestions RENAME COLUMN body TO message;
  END IF;
END $$;

-- Add subject if it doesn't exist (fresh table)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suggestions' AND column_name='subject') THEN
    ALTER TABLE suggestions ADD COLUMN subject TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add message if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suggestions' AND column_name='message') THEN
    ALTER TABLE suggestions ADD COLUMN message TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add admin_reply
ALTER TABLE suggestions ADD COLUMN IF NOT EXISTS admin_reply TEXT;

-- Drop status check constraint and recreate with correct values
ALTER TABLE suggestions DROP CONSTRAINT IF EXISTS suggestions_status_check;
ALTER TABLE suggestions ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE suggestions ADD CONSTRAINT suggestions_status_check
  CHECK (status IN ('pending', 'reviewed', 'resolved'));

-- Drop old columns no longer needed
ALTER TABLE suggestions DROP COLUMN IF EXISTS votes;

-- ============================================
-- COMMENTS: rename/add columns
-- ============================================

-- Rename user_id → author_id
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='user_id') THEN
    ALTER TABLE comments RENAME COLUMN user_id TO author_id;
  END IF;
END $$;

-- Rename body → content (if old column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='body') THEN
    ALTER TABLE comments RENAME COLUMN body TO content;
  END IF;
END $$;

-- Add author_id if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='author_id') THEN
    ALTER TABLE comments ADD COLUMN author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add content if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='content') THEN
    ALTER TABLE comments ADD COLUMN content TEXT NOT NULL DEFAULT '';
  END IF;
END $$;

-- Add mentions array
ALTER TABLE comments ADD COLUMN IF NOT EXISTS mentions UUID[] DEFAULT '{}';

-- Add is_edited flag
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT FALSE;

-- Add edited_at timestamp
ALTER TABLE comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Drop updated_at (replaced by edited_at)
ALTER TABLE comments DROP COLUMN IF EXISTS updated_at;

-- Drop entity_type check constraint (if exists) and recreate
ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_entity_type_check;
ALTER TABLE comments ADD CONSTRAINT comments_entity_type_check
  CHECK (entity_type IN ('case', 'blog_post', 'event', 'academy_content'));

-- Update RLS policies to use author_id
DROP POLICY IF EXISTS "Users create comments" ON comments;
CREATE POLICY "Users create comments" ON comments
  FOR INSERT WITH CHECK (author_id = auth.uid());

DROP POLICY IF EXISTS "Users update own comments" ON comments;
CREATE POLICY "Users update own comments" ON comments
  FOR UPDATE USING (author_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own comments" ON comments;
CREATE POLICY "Users delete own comments" ON comments
  FOR DELETE USING (author_id = auth.uid() OR public.is_admin());

-- Update index for author
DROP INDEX IF EXISTS idx_comments_user_id;
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments (author_id);

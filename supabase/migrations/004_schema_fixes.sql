-- ============================================
-- Schema Fixes and Performance Improvements
-- ============================================

-- ============================================
-- Fix case_history table schema
-- Initial schema used action/description columns.
-- Application code (admin.ts) expects old_status/new_status/notes/changed_by.
-- ============================================
ALTER TABLE case_history
  DROP COLUMN IF EXISTS action,
  DROP COLUMN IF EXISTS description,
  DROP COLUMN IF EXISTS performed_by;

ALTER TABLE case_history
  ADD COLUMN IF NOT EXISTS old_status TEXT,
  ADD COLUMN IF NOT EXISTS new_status TEXT,
  ADD COLUMN IF NOT EXISTS changed_by UUID REFERENCES profiles(id),
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- Backfill new_status for any existing rows
UPDATE case_history SET new_status = 'PENDING' WHERE new_status IS NULL;

-- Make new_status NOT NULL now that it's backfilled
ALTER TABLE case_history ALTER COLUMN new_status SET NOT NULL;

-- Update the DB trigger to insert into the correct columns
CREATE OR REPLACE FUNCTION log_case_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO case_history (case_id, old_status, new_status, notes)
    VALUES (NEW.id, OLD.status, NEW.status, 'Status updated');
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================
-- Fix case_documents: rename file_name → title
-- Types expect 'title', initial schema used 'file_name'.
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
-- Add max_capacity to events (for registration limits)
-- ============================================
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS max_capacity INTEGER;

-- ============================================
-- Expand notifications type constraint
-- Add MENTION and SUGGESTION_REPLY types.
-- ============================================
ALTER TABLE notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('INFO', 'CASE_UPDATE', 'EVENT', 'CONTENT', 'MENTION', 'SUGGESTION_REPLY'));

-- ============================================
-- Fix access_requests RLS policies
-- Replace recursive subqueries with security-definer functions.
-- ============================================
DROP POLICY IF EXISTS "Staff can view access requests" ON access_requests;
DROP POLICY IF EXISTS "Admins can update access requests" ON access_requests;

CREATE POLICY "Staff can view access requests" ON access_requests
  FOR SELECT USING (public.is_admin() OR public.is_commercial());

CREATE POLICY "Admins can update access requests" ON access_requests
  FOR UPDATE USING (public.is_admin());

-- ============================================
-- Fix cases policies: Commercials should manage all assigned cases
-- ============================================
DROP POLICY IF EXISTS "Commercials see assigned partner cases" ON cases;
DROP POLICY IF EXISTS "Commercials can view assigned partner cases" ON cases;
CREATE POLICY "Commercials manage assigned partner cases" ON cases
  FOR ALL USING (
    public.is_commercial() AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = cases.partner_id
      AND p.assigned_commercial_id = auth.uid()
    )
  );

-- ============================================
-- Performance indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_case_history_case_id ON case_history(case_id);
CREATE INDEX IF NOT EXISTS idx_case_documents_case_id ON case_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

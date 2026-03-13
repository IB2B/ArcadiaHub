-- Migration 010: Ensure RLS policies exist for Phase 2 tables
-- Uses DROP IF EXISTS + CREATE to be safe even if policies already exist
-- (Migrations 001 & 005 may already have these, but this ensures consistency)

-- ─── event_registrations ───────────────────────────────────────────────────

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can register for events" ON event_registrations;
CREATE POLICY "Users can register for events"
  ON event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see own event registrations" ON event_registrations;
CREATE POLICY "Users see own event registrations"
  ON event_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unregister from events" ON event_registrations;
CREATE POLICY "Users can unregister from events"
  ON event_registrations FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff manage event registrations" ON event_registrations;
CREATE POLICY "Staff manage event registrations"
  ON event_registrations FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_commercial());

-- ─── content_completions ───────────────────────────────────────────────────

ALTER TABLE content_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can mark content complete" ON content_completions;
CREATE POLICY "Users can mark content complete"
  ON content_completions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users see own completions" ON content_completions;
CREATE POLICY "Users see own completions"
  ON content_completions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own completions" ON content_completions;
CREATE POLICY "Users can update own completions"
  ON content_completions FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Staff see all completions" ON content_completions;
CREATE POLICY "Staff see all completions"
  ON content_completions FOR SELECT
  TO authenticated
  USING (public.is_admin() OR public.is_commercial());

-- ─── case_documents ────────────────────────────────────────────────────────

ALTER TABLE case_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Partners upload own case documents" ON case_documents;
CREATE POLICY "Partners upload own case documents"
  ON case_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_id
        AND cases.partner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Partners see own case documents" ON case_documents;
CREATE POLICY "Partners see own case documents"
  ON case_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM cases
      WHERE cases.id = case_id
        AND cases.partner_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage case documents" ON case_documents;
DROP POLICY IF EXISTS "Admins manage all case documents" ON case_documents;
CREATE POLICY "Admins manage all case documents"
  ON case_documents FOR ALL
  TO authenticated
  USING (public.is_admin() OR public.is_commercial());

DROP POLICY IF EXISTS "Commercials manage assigned case documents" ON case_documents;
CREATE POLICY "Commercials manage assigned case documents"
  ON case_documents FOR ALL
  TO authenticated
  USING (
    public.is_commercial() AND EXISTS (
      SELECT 1 FROM cases
      JOIN profiles ON profiles.id = cases.partner_id
      WHERE cases.id = case_id
        AND profiles.assigned_commercial_id = auth.uid()
    )
  );

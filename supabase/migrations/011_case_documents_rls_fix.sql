-- Migration 011: Fix case_documents RLS policies
-- The nested subquery on `cases` inside case_documents policies is subject to
-- cases' own RLS, which can silently fail. Use a SECURITY DEFINER function
-- (like is_admin/is_commercial) to bypass the nested RLS check.

-- Helper: check if auth.uid() owns a case (bypasses nested RLS)
CREATE OR REPLACE FUNCTION public.user_owns_case(p_case_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.cases
    WHERE id = p_case_id AND partner_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: check if auth.uid() is a commercial assigned to a case's partner (bypasses nested RLS)
CREATE OR REPLACE FUNCTION public.commercial_manages_case(p_case_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.cases c
    JOIN public.profiles p ON p.id = c.partner_id
    WHERE c.id = p_case_id
      AND p.assigned_commercial_id = auth.uid()
      AND public.is_commercial()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Rebuild case_documents policies using the new helpers
DROP POLICY IF EXISTS "Partners upload own case documents" ON case_documents;
DROP POLICY IF EXISTS "Partners see own case documents"   ON case_documents;
DROP POLICY IF EXISTS "Admins manage all case documents"  ON case_documents;
DROP POLICY IF EXISTS "Admins can manage case documents"  ON case_documents;
DROP POLICY IF EXISTS "Commercials manage assigned case documents" ON case_documents;

CREATE POLICY "Partners upload own case documents" ON case_documents
  FOR INSERT TO authenticated
  WITH CHECK (public.user_owns_case(case_id));

CREATE POLICY "Partners see own case documents" ON case_documents
  FOR SELECT TO authenticated
  USING (public.user_owns_case(case_id));

CREATE POLICY "Commercials manage assigned case documents" ON case_documents
  FOR ALL TO authenticated
  USING (public.commercial_manages_case(case_id));

CREATE POLICY "Admins manage all case documents" ON case_documents
  FOR ALL TO authenticated
  USING (public.is_admin());

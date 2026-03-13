-- ============================================
-- Fix RLS Infinite Recursion on Profiles
-- ============================================
-- The issue: Admin policies query the profiles table to check role,
-- which triggers the same policies again, causing infinite recursion.
--
-- Solution: Use a security definer function that bypasses RLS

-- Create a function to check if user is admin (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a function to check if user is commercial (bypasses RLS)
CREATE OR REPLACE FUNCTION public.is_commercial()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'COMMERCIAL'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a function to get current user role (bypasses RLS)
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(user_role, 'PARTNER');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- Drop and recreate profiles policies
-- ============================================
DROP POLICY IF EXISTS "Anyone can view active profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view active profiles" ON profiles;

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can view other active profiles
CREATE POLICY "Users can view active profiles" ON profiles
  FOR SELECT USING (is_active = true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can do everything (using the security definer function)
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL USING (public.is_admin());

-- ============================================
-- Fix other table policies that reference profiles
-- ============================================

-- Cases policies
DROP POLICY IF EXISTS "Admins can manage all cases" ON cases;
CREATE POLICY "Admins can manage all cases" ON cases
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Commercials can view assigned partner cases" ON cases;
CREATE POLICY "Commercials can view assigned partner cases" ON cases
  FOR SELECT USING (
    public.is_commercial() AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = cases.partner_id
      AND p.assigned_commercial_id = auth.uid()
    )
  );

-- Events policies
DROP POLICY IF EXISTS "Admins can manage events" ON events;
CREATE POLICY "Admins can manage events" ON events
  FOR ALL USING (public.is_admin());

-- Academy content policies
DROP POLICY IF EXISTS "Admins can manage academy content" ON academy_content;
CREATE POLICY "Admins can manage academy content" ON academy_content
  FOR ALL USING (public.is_admin());

-- Documents policies
DROP POLICY IF EXISTS "Admins can manage documents" ON documents;
CREATE POLICY "Admins can manage documents" ON documents
  FOR ALL USING (public.is_admin());

-- Blog posts policies
DROP POLICY IF EXISTS "Admins can manage blog posts" ON blog_posts;
CREATE POLICY "Admins can manage blog posts" ON blog_posts
  FOR ALL USING (public.is_admin());

-- Notifications policies
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;
CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (public.is_admin());

-- Partner services policies
DROP POLICY IF EXISTS "Admins can manage partner services" ON partner_services;
CREATE POLICY "Admins can manage partner services" ON partner_services
  FOR ALL USING (public.is_admin());

-- Partner certifications policies
DROP POLICY IF EXISTS "Admins can manage partner certifications" ON partner_certifications;
CREATE POLICY "Admins can manage partner certifications" ON partner_certifications
  FOR ALL USING (public.is_admin());

-- Case documents policies
DROP POLICY IF EXISTS "Admins can manage case documents" ON case_documents;
CREATE POLICY "Admins can manage case documents" ON case_documents
  FOR ALL USING (public.is_admin());

-- Case history policies
DROP POLICY IF EXISTS "Admins can manage case history" ON case_history;
CREATE POLICY "Admins can manage case history" ON case_history
  FOR ALL USING (public.is_admin());

-- Lookup tables (categories, services, certifications)
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage services" ON services;
CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage certifications" ON certifications;
CREATE POLICY "Admins can manage certifications" ON certifications
  FOR ALL USING (public.is_admin());

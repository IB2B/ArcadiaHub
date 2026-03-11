-- ============================================
-- Atomic View Count Increment
-- Replaces the JS read-then-write race condition with a single atomic RPC.
-- ============================================

CREATE OR REPLACE FUNCTION increment_view_count(tbl TEXT, row_id UUID)
RETURNS VOID AS $$
BEGIN
  IF tbl = 'academy_content' THEN
    UPDATE academy_content SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSIF tbl = 'blog_posts' THEN
    UPDATE blog_posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

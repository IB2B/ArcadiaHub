-- Atomic view count increment function to avoid race conditions
-- Usage: SELECT increment_view_count('academy_content', 'uuid-here');
--        SELECT increment_view_count('blog_posts', 'uuid-here');

CREATE OR REPLACE FUNCTION increment_view_count(table_name text, row_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF table_name = 'academy_content' THEN
    UPDATE academy_content SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSIF table_name = 'blog_posts' THEN
    UPDATE blog_posts SET view_count = COALESCE(view_count, 0) + 1 WHERE id = row_id;
  ELSE
    RAISE EXCEPTION 'Unknown table: %', table_name;
  END IF;
END;
$$;

-- Grant execute to authenticated users (view counts are public-ish actions)
GRANT EXECUTE ON FUNCTION increment_view_count(text, uuid) TO authenticated;

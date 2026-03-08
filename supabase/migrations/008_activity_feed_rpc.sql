CREATE OR REPLACE FUNCTION get_activity_feed(p_user_id uuid, p_limit int DEFAULT 20)
RETURNS TABLE(id uuid, type text, title text, description text, created_at timestamptz, metadata jsonb)
LANGUAGE sql STABLE AS $$
  SELECT id, 'case' AS type, case_code AS title, client_name AS description, created_at, '{}'::jsonb
  FROM cases WHERE partner_id = p_user_id
  UNION ALL
  SELECT id, 'event', title, description, created_at, jsonb_build_object('event_type', event_type, 'start_datetime', start_datetime)
  FROM events WHERE is_published = true
  UNION ALL
  SELECT id, 'academy', title, description, created_at, jsonb_build_object('content_type', content_type)
  FROM academy_content WHERE is_published = true
  UNION ALL
  SELECT id, 'blog', title, excerpt, created_at, jsonb_build_object('slug', slug)
  FROM blog_posts WHERE is_published = true
  UNION ALL
  SELECT id, 'notification', title, message, created_at, jsonb_build_object('is_read', is_read)
  FROM notifications WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT p_limit;
$$;

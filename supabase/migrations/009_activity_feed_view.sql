-- Migration 008: Activity feed unified view
-- Replaces 5 separate N+1 queries with a single UNION ALL view

CREATE OR REPLACE VIEW activity_feed_view AS
  SELECT
    id::text,
    'case'::text AS feed_type,
    concat('Case ', case_code, ': ', client_name) AS title,
    notes AS description,
    COALESCE(updated_at, created_at)::timestamptz AS feed_timestamp,
    partner_id::text AS user_id,
    concat('/cases/', id) AS feed_link,
    status AS feed_meta,
    NULL::text AS feed_image,
    NULL::text AS feed_slug
  FROM cases

UNION ALL

  SELECT
    id::text,
    'event'::text AS feed_type,
    title,
    description,
    COALESCE(created_at, start_datetime)::timestamptz AS feed_timestamp,
    NULL::text AS user_id,
    concat('/events/', id) AS feed_link,
    event_type AS feed_meta,
    NULL::text AS feed_image,
    NULL::text AS feed_slug
  FROM events
  WHERE is_published = true

UNION ALL

  SELECT
    id::text,
    'content'::text AS feed_type,
    title,
    description,
    created_at::timestamptz AS feed_timestamp,
    NULL::text AS user_id,
    concat('/academy/', id) AS feed_link,
    content_type AS feed_meta,
    thumbnail_url AS feed_image,
    NULL::text AS feed_slug
  FROM academy_content
  WHERE is_published = true

UNION ALL

  SELECT
    id::text,
    'document'::text AS feed_type,
    title,
    description,
    created_at::timestamptz AS feed_timestamp,
    NULL::text AS user_id,
    '/documents'::text AS feed_link,
    category AS feed_meta,
    NULL::text AS feed_image,
    NULL::text AS feed_slug
  FROM documents
  WHERE is_published = true

UNION ALL

  SELECT
    id::text,
    'blog'::text AS feed_type,
    title,
    excerpt AS description,
    COALESCE(published_at, created_at)::timestamptz AS feed_timestamp,
    NULL::text AS user_id,
    concat('/blog/', slug) AS feed_link,
    category AS feed_meta,
    featured_image AS feed_image,
    slug AS feed_slug
  FROM blog_posts
  WHERE is_published = true;

-- Grant read access to authenticated users
GRANT SELECT ON activity_feed_view TO authenticated;

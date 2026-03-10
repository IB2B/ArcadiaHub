-- Add mobile phone and video URL to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS mobile text,
  ADD COLUMN IF NOT EXISTS video_url text;

-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Add Team Images Storage Bucket
--
-- Creates a Supabase storage bucket for team member profile images.
-- The bucket stores images uploaded via the admin team management panel.
-- ═══════════════════════════════════════════════════════════════════════════

-- Insert the storage bucket (idempotent — skips if already exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'team-images',
  'team-images',
  true,
  5242880, -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to team images
INSERT INTO storage.policies (name, definition, bucket_id, owner)
SELECT
  'Public Read Access',
  '(bucket_id = ''team-images''::text)',
  'team-images',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies
  WHERE bucket_id = 'team-images' AND name = 'Public Read Access'
);

-- Allow authenticated (admin) users to upload/update/delete team images
INSERT INTO storage.policies (name, definition, bucket_id, owner)
SELECT
  'Authenticated Write Access',
  '((bucket_id = ''team-images''::text) AND (auth.role() = ''authenticated''::text))',
  'team-images',
  NULL
WHERE NOT EXISTS (
  SELECT 1 FROM storage.policies
  WHERE bucket_id = 'team-images' AND name = 'Authenticated Write Access'
);

-- ============================================================
-- BTA LAB — Team English Translations (021)
-- ============================================================
-- Fixes the English /team page showing Georgian text.
--
-- The team_members English columns (name_en, position_en, bio_en,
-- image_alt_en) were previously populated with Georgian values.
-- This migration replaces them with proper English translations.
--
-- Also aligns the team hero content (site_content, page='team')
-- English values with the requested copy:
--   • badge:        "Our Team"
--   • heading:      "Meet the Team"
--   • description:  "A diverse group of talented students, designers,
--                    developers, and marketers working together to
--                    bring ideas to life."
--
-- Safe to run multiple times (idempotent).
-- Uses table-existence checks; does not reference missing tables.
--
-- NOTE: Rows are matched by Georgian name (name_ka / name) rather than
-- by id, because team members may carry either the fixed UUIDs from
-- migration 016 or the deterministic hash UUIDs from scripts/seed.ts.
-- The Georgian name is identical under both schemes and is unique
-- within the approved team list.
-- ============================================================

-- ── 1. Team members — English translations ──────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'team_members'
  ) THEN

    UPDATE public.team_members SET
      name_en = 'Sopio Macharashvili',
      position_en = 'Director',
      bio_en = 'Responsible for company development, strategic direction, and team management.',
      image_alt_en = 'Sopio Macharashvili portrait'
    WHERE (name_ka = 'სოფიო მაჭარაშვილი' OR name = 'სოფიო მაჭარაშვილი');

    UPDATE public.team_members SET
      name_en = 'Mariam Kakiashvili',
      position_en = 'Team Lead',
      bio_en = 'Mariam coordinates the technical direction and implementation of web projects. With years of experience and leadership skills, she ensures that every project is delivered to the highest standards.',
      image_alt_en = 'Mariam Kakiashvili portrait'
    WHERE (name_ka = 'მარიამ კაკიაშვილი' OR name = 'მარიამ კაკიაშვილი');

    UPDATE public.team_members SET
      name_en = 'Gaioz Kupravishvili',
      position_en = 'Lecturer',
      bio_en = 'Gaioz helps beginner developers learn web technologies. Through his experience and simple teaching style, he passes practical skills to students and shares the knowledge needed to build real projects.',
      image_alt_en = 'Gaioz Kupravishvili portrait'
    WHERE (name_ka = 'გაიოზ კუპრაშვილი' OR name = 'გაიოზ კუპრაშვილი');

    UPDATE public.team_members SET
      name_en = 'Tsotne Chaduneli',
      position_en = 'Lecturer',
      bio_en = 'Tsotne combines rich practical experience with deep academic knowledge. As a leading specialist in the field, he mentors our team, shares modern technology trends, and ensures the continuous growth of service quality.',
      image_alt_en = 'Tsotne Chaduneli portrait'
    WHERE (name_ka = 'ცოტნე ჩადუნელი' OR name = 'ცოტნე ჩადუნელი');

    UPDATE public.team_members SET
      name_en = 'Luka Mekokishvili',
      position_en = 'Web Developer',
      bio_en = 'Luka specializes in building modern, fully functional web applications and websites. His priority is delivering user-friendly, fast, and secure digital products.',
      image_alt_en = 'Luka Mekokishvili portrait'
    WHERE (name_ka = 'ლუკა მეკოკიშვილი' OR name = 'ლუკა მეკოკიშვილი');

    UPDATE public.team_members SET
      name_en = 'Luka Kharaishvili',
      position_en = 'Web Developer',
      bio_en = 'Luka is a talented and promising developer whose motivation and ability to solve complex technical problems make a significant contribution to our projects.',
      image_alt_en = 'Luka Kharaishvili portrait'
    WHERE (name_ka = 'ლუკა ხარაიშვილი' OR name = 'ლუკა ხარაიშვილი');

    UPDATE public.team_members SET
      name_en = 'Gaga Trapaidze',
      position_en = 'Social Media Manager',
      bio_en = 'Gaga successfully combines technical competence with communication skills. He manages the company''s social relations, ensuring a close connection with customers and partners.',
      image_alt_en = 'Gaga Trapaidze portrait'
    WHERE (name_ka = 'გაგა ტრაპაიძე' OR name = 'გაგა ტრაპაიძე');

    RAISE NOTICE 'team_members English translations updated.';
  ELSE
    RAISE NOTICE 'Table team_members does not exist — skipped.';
  END IF;
END $$;

-- ── 2. Team hero content — English values ───────────────────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_content'
  ) THEN

    UPDATE public.site_content
    SET content_value_en = 'Our Team'
    WHERE page = 'team' AND section = 'hero' AND content_key = 'badge';

    UPDATE public.site_content
    SET content_value_en = 'Meet the Team'
    WHERE page = 'team' AND section = 'hero' AND content_key = 'heading';

    UPDATE public.site_content
    SET content_value_en = 'A diverse group of talented students, designers, developers, and marketers working together to bring ideas to life.'
    WHERE page = 'team' AND section = 'hero' AND content_key = 'description';

    RAISE NOTICE 'Team hero English content updated.';
  ELSE
    RAISE NOTICE 'Table site_content does not exist — skipped.';
  END IF;
END $$;

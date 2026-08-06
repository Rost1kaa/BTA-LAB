-- ============================================================
-- BTA LAB — Team Content Update (016)
-- ============================================================
-- Consolidated from:
--   • migrations/update_team_members.sql
--   • database/update_team_positions.sql
--   • sql/update_team_roles.sql
--   • sql/update_mariam_photo.sql
--   • sql/update_team_join_text.sql
--
-- Safe to run multiple times (idempotent).
-- Prerequisite: migration 013_add_team_member_position.sql
-- (position columns are re-added below defensively).
-- ============================================================

-- ── 1. Ensure position columns exist ────────────────────────────────────
alter table public.team_members
  add column if not exists position text not null default '',
  add column if not exists position_ka text not null default '',
  add column if not exists position_en text not null default '';

-- ── 2. Delete old demo placeholder members (safe if they don't exist) ────
DELETE FROM public.team_members
WHERE name IN ('Alex Morgan', 'Sarah Chen', 'Marcus Johnson');

-- ── 3. Remove any remaining records not in the approved team list ───────
DELETE FROM public.team_members
WHERE name NOT IN (
  'სოფიო მაჭარაშვილი',
  'მარიამ კაკიაშვილი',
  'გაიოზ კუპრაშვილი',
  'ცოტნე ჩადუნელი',
  'ლუკა მეკოკიშვილი',
  'ლუკა ხარაიშვილი',
  'გაგა ტრაპაიძე'
);

-- ── 4. Upsert the seven approved team members ───────────────────────────
-- Images are served locally from /public/team/*.webp.
INSERT INTO public.team_members (id, name, name_ka, name_en, position, position_ka, position_en, bio, bio_ka, bio_en, image, image_alt_ka, image_alt_en, socials, display_order, published, created_at, updated_at)
VALUES (
  '11111111-1111-4111-8111-000000000001',
  'სოფიო მაჭარაშვილი', 'სოფიო მაჭარაშვილი', 'სოფიო მაჭარაშვილი',
  'დირექტორი', 'დირექტორი', 'დირექტორი',
  'კომპანიის განვითარების, სტრატეგიული მიმართულებებისა და გუნდის მართვის პასუხისმგებელი პირი.',
  'კომპანიის განვითარების, სტრატეგიული მიმართულებებისა და გუნდის მართვის პასუხისმგებელი პირი.',
  'კომპანიის განვითარების, სტრატეგიული მიმართულებებისა და გუნდის მართვის პასუხისმგებელი პირი.',
  '/team/sofio.webp', 'სოფიო მაჭარაშვილი პორტრეტი', 'სოფიო მაჭარაშვილი portrait',
  '{}'::jsonb, 0, true, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ka = EXCLUDED.name_ka,
  name_en = EXCLUDED.name_en,
  position = EXCLUDED.position,
  position_ka = EXCLUDED.position_ka,
  position_en = EXCLUDED.position_en,
  bio = EXCLUDED.bio,
  bio_ka = EXCLUDED.bio_ka,
  bio_en = EXCLUDED.bio_en,
  image = EXCLUDED.image,
  image_alt_ka = EXCLUDED.image_alt_ka,
  image_alt_en = EXCLUDED.image_alt_en,
  display_order = EXCLUDED.display_order,
  published = EXCLUDED.published,
  updated_at = NOW();

INSERT INTO public.team_members (id, name, name_ka, name_en, position, position_ka, position_en, bio, bio_ka, bio_en, image, image_alt_ka, image_alt_en, socials, display_order, published, created_at, updated_at)
VALUES (
  '11111111-1111-4111-8111-000000000002',
  'მარიამ კაკიაშვილი', 'მარიამ კაკიაშვილი', 'მარიამ კაკიაშვილი',
  'გუნდის ხელმძღვანელი', 'გუნდის ხელმძღვანელი', 'გუნდის ხელმძღვანელი',
  'მარიამი კოორდინაციას უწევს ტექნიკურ მიმართულებას და ვებ პროექტების განხორციელებას. მრავალწლიანი გამოცდილებითა და ლიდერული უნარებით, ის უზრუნველყოფს თითოეული პროექტის უმაღლესი სტანდარტებით შესრულებას.',
  'მარიამი კოორდინაციას უწევს ტექნიკურ მიმართულებას და ვებ პროექტების განხორციელებას. მრავალწლიანი გამოცდილებითა და ლიდერული უნარებით, ის უზრუნველყოფს თითოეული პროექტის უმაღლესი სტანდარტებით შესრულებას.',
  'მარიამი კოორდინაციას უწევს ტექნიკურ მიმართულებას და ვებ პროექტების განხორციელებას. მრავალწლიანი გამოცდილებითა და ლიდერული უნარებით, ის უზრუნველყოფს თითოეული პროექტის უმაღლესი სტანდარტებით შესრულებას.',
  '/team/mariami.webp', 'მარიამ კაკიაშვილი პორტრეტი', 'მარიამ კაკიაშვილი portrait',
  '{}'::jsonb, 1, true, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ka = EXCLUDED.name_ka,
  name_en = EXCLUDED.name_en,
  position = EXCLUDED.position,
  position_ka = EXCLUDED.position_ka,
  position_en = EXCLUDED.position_en,
  bio = EXCLUDED.bio,
  bio_ka = EXCLUDED.bio_ka,
  bio_en = EXCLUDED.bio_en,
  image = EXCLUDED.image,
  image_alt_ka = EXCLUDED.image_alt_ka,
  image_alt_en = EXCLUDED.image_alt_en,
  display_order = EXCLUDED.display_order,
  published = EXCLUDED.published,
  updated_at = NOW();

INSERT INTO public.team_members (id, name, name_ka, name_en, position, position_ka, position_en, bio, bio_ka, bio_en, image, image_alt_ka, image_alt_en, socials, display_order, published, created_at, updated_at)
VALUES (
  '11111111-1111-4111-8111-000000000003',
  'გაიოზ კუპრაშვილი', 'გაიოზ კუპრაშვილი', 'გაიოზ კუპრაშვილი',
  'ლექტორი', 'ლექტორი', 'ლექტორი',
  'გაიოზი ეხმარება დამწყებ დეველოპერებს ვებტექნოლოგიების შესწავლაში. თავისი გამოცდილებითა და მარტივი ახსნის მანერით, ის სტუდენტებს პრაქტიკულ უნარებს გადასცემს და უზიარებს იმ ცოდნას, რომელიც რეალური პროექტების შესაქმნელად არის საჭირო.',
  'გაიოზი ეხმარება დამწყებ დეველოპერებს ვებტექნოლოგიების შესწავლაში. თავისი გამოცდილებითა და მარტივი ახსნის მანერით, ის სტუდენტებს პრაქტიკულ უნარებს გადასცემს და უზიარებს იმ ცოდნას, რომელიც რეალური პროექტების შესაქმნელად არის საჭირო.',
  'გაიოზი ეხმარება დამწყებ დეველოპერებს ვებტექნოლოგიების შესწავლაში. თავისი გამოცდილებითა და მარტივი ახსნის მანერით, ის სტუდენტებს პრაქტიკულ უნარებს გადასცემს და უზიარებს იმ ცოდნას, რომელიც რეალური პროექტების შესაქმნელად არის საჭირო.',
  '/team/kupra.webp', 'გაიოზ კუპრაშვილი პორტრეტი', 'გაიოზ კუპრაშვილი portrait',
  '{}'::jsonb, 2, true, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ka = EXCLUDED.name_ka,
  name_en = EXCLUDED.name_en,
  position = EXCLUDED.position,
  position_ka = EXCLUDED.position_ka,
  position_en = EXCLUDED.position_en,
  bio = EXCLUDED.bio,
  bio_ka = EXCLUDED.bio_ka,
  bio_en = EXCLUDED.bio_en,
  image = EXCLUDED.image,
  image_alt_ka = EXCLUDED.image_alt_ka,
  image_alt_en = EXCLUDED.image_alt_en,
  display_order = EXCLUDED.display_order,
  published = EXCLUDED.published,
  updated_at = NOW();

INSERT INTO public.team_members (id, name, name_ka, name_en, position, position_ka, position_en, bio, bio_ka, bio_en, image, image_alt_ka, image_alt_en, socials, display_order, published, created_at, updated_at)
VALUES (
  '11111111-1111-4111-8111-000000000004',
  'ცოტნე ჩადუნელი', 'ცოტნე ჩადუნელი', 'ცოტნე ჩადუნელი',
  'ლექტორი', 'ლექტორი', 'ლექტორი',
  'ცოტნე აერთიანებს მდიდარ პრაქტიკულ გამოცდილებას და ღრმა აკადემიურ ცოდნას. როგორც დარგის წამყვანი სპეციალისტი, ის უწევს მენტორობას ჩვენს გუნდს, აზიარებს თანამედროვე ტექნოლოგიურ ტენდენციებს და ზრუნავს სერვისების ხარისხის მუდმივ ზრდაზე.',
  'ცოტნე აერთიანებს მდიდარ პრაქტიკულ გამოცდილებას და ღრმა აკადემიურ ცოდნას. როგორც დარგის წამყვანი სპეციალისტი, ის უწევს მენტორობას ჩვენს გუნდს, აზიარებს თანამედროვე ტექნოლოგიურ ტენდენციებს და ზრუნავს სერვისების ხარისხის მუდმივ ზრდაზე.',
  'ცოტნე აერთიანებს მდიდარ პრაქტიკულ გამოცდილებას და ღრმა აკადემიურ ცოდნას. როგორც დარგის წამყვანი სპეციალისტი, ის უწევს მენტორობას ჩვენს გუნდს, აზიარებს თანამედროვე ტექნოლოგიურ ტენდენციებს და ზრუნავს სერვისების ხარისხის მუდმივ ზრდაზე.',
  '/team/cotne.webp', 'ცოტნე ჩადუნელი პორტრეტი', 'ცოტნე ჩადუნელი portrait',
  '{}'::jsonb, 3, true, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ka = EXCLUDED.name_ka,
  name_en = EXCLUDED.name_en,
  position = EXCLUDED.position,
  position_ka = EXCLUDED.position_ka,
  position_en = EXCLUDED.position_en,
  bio = EXCLUDED.bio,
  bio_ka = EXCLUDED.bio_ka,
  bio_en = EXCLUDED.bio_en,
  image = EXCLUDED.image,
  image_alt_ka = EXCLUDED.image_alt_ka,
  image_alt_en = EXCLUDED.image_alt_en,
  display_order = EXCLUDED.display_order,
  published = EXCLUDED.published,
  updated_at = NOW();

INSERT INTO public.team_members (id, name, name_ka, name_en, position, position_ka, position_en, bio, bio_ka, bio_en, image, image_alt_ka, image_alt_en, socials, display_order, published, created_at, updated_at)
VALUES (
  '11111111-1111-4111-8111-000000000005',
  'ლუკა მეკოკიშვილი', 'ლუკა მეკოკიშვილი', 'ლუკა მეკოკიშვილი',
  'ვებ დეველოპერი', 'ვებ დეველოპერი', 'ვებ დეველოპერი',
  'ლუკა სპეციალიზებულია თანამედროვე, სრულყოფილად გამართული ვებ აპლიკაციებისა და საიტების შექმნაზე. მისი პრიორიტეტია მომხმარებლისთვის მოსახერხებელი, სწრაფი და უსაფრთხო ციფრული პროდუქტების მიწოდება.',
  'ლუკა სპეციალიზებულია თანამედროვე, სრულყოფილად გამართული ვებ აპლიკაციებისა და საიტების შექმნაზე. მისი პრიორიტეტია მომხმარებლისთვის მოსახერხებელი, სწრაფი და უსაფრთხო ციფრული პროდუქტების მიწოდება.',
  'ლუკა სპეციალიზებულია თანამედროვე, სრულყოფილად გამართული ვებ აპლიკაციებისა და საიტების შექმნაზე. მისი პრიორიტეტია მომხმარებლისთვის მოსახერხებელი, სწრაფი და უსაფრთხო ციფრული პროდუქტების მიწოდება.',
  '/team/rostika.webp', 'ლუკა მეკოკიშვილი პორტრეტი', 'ლუკა მეკოკიშვილი portrait',
  '{}'::jsonb, 4, true, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ka = EXCLUDED.name_ka,
  name_en = EXCLUDED.name_en,
  position = EXCLUDED.position,
  position_ka = EXCLUDED.position_ka,
  position_en = EXCLUDED.position_en,
  bio = EXCLUDED.bio,
  bio_ka = EXCLUDED.bio_ka,
  bio_en = EXCLUDED.bio_en,
  image = EXCLUDED.image,
  image_alt_ka = EXCLUDED.image_alt_ka,
  image_alt_en = EXCLUDED.image_alt_en,
  display_order = EXCLUDED.display_order,
  published = EXCLUDED.published,
  updated_at = NOW();

INSERT INTO public.team_members (id, name, name_ka, name_en, position, position_ka, position_en, bio, bio_ka, bio_en, image, image_alt_ka, image_alt_en, socials, display_order, published, created_at, updated_at)
VALUES (
  '11111111-1111-4111-8111-000000000006',
  'ლუკა ხარაიშვილი', 'ლუკა ხარაიშვილი', 'ლუკა ხარაიშვილი',
  'ვებ დეველოპერი', 'ვებ დეველოპერი', 'ვებ დეველოპერი',
  'ლუკა არის ნიჭიერი და პერსპექტიული დეველოპერი, რომელიც თავისი მოტივაციითა და რთული ტექნიკური ამოცანების გადაჭრის უნარით მნიშვნელოვან წვლილს შეიტანს ჩვენს პროექტებში.',
  'ლუკა არის ნიჭიერი და პერსპექტიული დეველოპერი, რომელიც თავისი მოტივაციითა და რთული ტექნიკური ამოცანების გადაჭრის უნარით მნიშვნელოვან წვლილს შეიტანს ჩვენს პროექტებში.',
  'ლუკა არის ნიჭიერი და პერსპექტიული დეველოპერი, რომელიც თავისი მოტივაციითა და რთული ტექნიკური ამოცანების გადაჭრის უნარით მნიშვნელოვან წვლილს შეიტანს ჩვენს პროექტებში.',
  '/team/xaraishvili.webp', 'ლუკა ხარაიშვილი პორტრეტი', 'ლუკა ხარაიშვილი portrait',
  '{}'::jsonb, 5, true, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ka = EXCLUDED.name_ka,
  name_en = EXCLUDED.name_en,
  position = EXCLUDED.position,
  position_ka = EXCLUDED.position_ka,
  position_en = EXCLUDED.position_en,
  bio = EXCLUDED.bio,
  bio_ka = EXCLUDED.bio_ka,
  bio_en = EXCLUDED.bio_en,
  image = EXCLUDED.image,
  image_alt_ka = EXCLUDED.image_alt_ka,
  image_alt_en = EXCLUDED.image_alt_en,
  display_order = EXCLUDED.display_order,
  published = EXCLUDED.published,
  updated_at = NOW();

INSERT INTO public.team_members (id, name, name_ka, name_en, position, position_ka, position_en, bio, bio_ka, bio_en, image, image_alt_ka, image_alt_en, socials, display_order, published, created_at, updated_at)
VALUES (
  '11111111-1111-4111-8111-000000000007',
  'გაგა ტრაპაიძე', 'გაგა ტრაპაიძე', 'გაგა ტრაპაიძე',
  'სოციალური მედიის მართვა', 'სოციალური მედიის მართვა', 'სოციალური მედიის მართვა',
  'გაგა წარმატებით აერთიანებს ტექნიკურ კომპეტენციას და კომუნიკაციის უნარებს. ის წარმართავს კომპანიის სოციალურ ურთიერთობებს, რაც უზრუნველყოფს მჭიდრო კავშირს მომხმარებლებთან და პარტნიორებთან.',
  'გაგა წარმატებით აერთიანებს ტექნიკურ კომპეტენციას და კომუნიკაციის უნარებს. ის წარმართავს კომპანიის სოციალურ ურთიერთობებს, რაც უზრუნველყოფს მჭიდრო კავშირს მომხმარებლებთან და პარტნიორებთან.',
  'გაგა წარმატებით აერთიანებს ტექნიკურ კომპეტენციას და კომუნიკაციის უნარებს. ის წარმართავს კომპანიის სოციალურ ურთიერთობებს, რაც უზრუნველყოფს მჭიდრო კავშირს მომხმარებლებთან და პარტნიორებთან.',
  '/team/gaga.webp', 'გაგა ტრაპაიძე პორტრეტი', 'გაგა ტრაპაიძე portrait',
  '{}'::jsonb, 6, true, NOW(), NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  name_ka = EXCLUDED.name_ka,
  name_en = EXCLUDED.name_en,
  position = EXCLUDED.position,
  position_ka = EXCLUDED.position_ka,
  position_en = EXCLUDED.position_en,
  bio = EXCLUDED.bio,
  bio_ka = EXCLUDED.bio_ka,
  bio_en = EXCLUDED.bio_en,
  image = EXCLUDED.image,
  image_alt_ka = EXCLUDED.image_alt_ka,
  image_alt_en = EXCLUDED.image_alt_en,
  display_order = EXCLUDED.display_order,
  published = EXCLUDED.published,
  updated_at = NOW();

-- ── 5. Fix roles (მასწავლებელი → ლექტორი) ──────────────────────────────
-- For databases where members were seeded with the legacy "Teacher" role.
UPDATE public.team_members
SET position = 'ლექტორი', position_ka = 'ლექტორი', position_en = 'ლექტორი'
WHERE name IN ('გაიოზ კუპრაშვილი', 'ცოტნე ჩადუნელი')
  AND position = 'მასწავლებელი';

-- ── 6. Ensure Mariam's photo path is correct ─────────────────────────────
UPDATE public.team_members
SET image = '/team/mariami.webp'
WHERE name = 'მარიამ კაკიაშვილი'
  AND (image IS NULL OR image != '/team/mariami.webp');

-- ── 7. Update team joining section text ─────────────────────────────────
DO $$
DECLARE
  old_text CONSTANT text := 'ჩვენ მუდმივად ვეძებთ მოტივირებულ სტუდენტებს BTA LAB-ში გასაწევრიანებლად. თუ გსურთ სწავლა და რეალურ პროექტებზე მუშაობა, მოგესალმებით.';
  new_text CONSTANT text := 'ჩვენ მუდმივად ვეძებთ მოტივირებულ სტუდენტებს ბითიეი ლაბში გასაწევრიანებლად. თუ გსურთ სწავლა და რეალურ პროექტებზე მუშაობა, მოგესალმებით.';
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'site_content'
  ) THEN
    UPDATE public.site_content
    SET content_value_ka = new_text
    WHERE content_value_ka = old_text;
  END IF;
END $$;

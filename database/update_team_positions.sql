-- ============================================================
-- Update Team Member Positions
-- ============================================================
-- This script updates existing team members with their
-- position/specialty values.
--
-- Prerequisites:
--   Run supabase/migrations/013_add_team_member_position.sql
--   first to add the position columns to the team_members table.
--
-- Usage:
--   1. Apply the migration first:
--      Run supabase/migrations/013_add_team_member_position.sql
--      in your Supabase SQL editor.
--
--   2. Then run this script:
--      Run this file in your Supabase SQL editor.
-- ============================================================

-- Update positions for all 7 team members
-- The name field is used to match records since it's the most stable identifier.

UPDATE team_members
SET
  position = 'დირექტორი',
  position_ka = 'დირექტორი',
  position_en = 'დირექტორი'
WHERE name = 'სოფიო მაჭარაშვილი';

UPDATE team_members
SET
  position = 'გუნდის ხელმძღვანელი',
  position_ka = 'გუნდის ხელმძღვანელი',
  position_en = 'გუნდის ხელმძღვანელი'
WHERE name = 'მარიამ კაკიაშვილი';

UPDATE team_members
SET
  position = 'მასწავლებელი',
  position_ka = 'მასწავლებელი',
  position_en = 'მასწავლებელი'
WHERE name = 'გაიოზ კუპრაშვილი';

UPDATE team_members
SET
  position = 'მასწავლებელი',
  position_ka = 'მასწავლებელი',
  position_en = 'მასწავლებელი'
WHERE name = 'ცოტნე ჩადუნელი';

UPDATE team_members
SET
  position = 'ვებ დეველოპერი',
  position_ka = 'ვებ დეველოპერი',
  position_en = 'ვებ დეველოპერი'
WHERE name = 'ლუკა მეკოკიშვილი';

UPDATE team_members
SET
  position = 'ვებ დეველოპერი',
  position_ka = 'ვებ დეველოპერი',
  position_en = 'ვებ დეველოპერი'
WHERE name = 'ლუკა ხარაიშვილი';

UPDATE team_members
SET
  position = 'სოციალური მედიის მართვა',
  position_ka = 'სოციალური მედიის მართვა',
  position_en = 'სოციალური მედიის მართვა'
WHERE name = 'გაგა ტრაპაიძე';

-- Verify the updates
SELECT name, position, position_ka, position_en FROM team_members ORDER BY display_order;

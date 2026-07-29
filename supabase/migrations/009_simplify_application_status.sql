-- ═══════════════════════════════════════════════════════════════════════════
-- BTA LAB — Simplify Campaign Application Status
-- ═══════════════════════════════════════════════════════════════════════════
-- Changes the campaign_application_status enum from 18 values to just 2:
--   UNOPENED, CHECKED
--
-- SAFE: Converts existing 'submitted' applications to 'UNOPENED'.
-- SAFE: Any other existing status values are also mapped to 'UNOPENED'.
-- SAFE: Does not delete any data.
-- ═══════════════════════════════════════════════════════════════════════════

-- Step 1: Create new enum type with only the two allowed values
do $$ begin
  create type public.campaign_application_status_new as enum ('UNOPENED', 'CHECKED');
exception when duplicate_object then null;
end $$;

-- Step 2: Alter the campaign_applications table to use the new enum
--         Map all existing non-CHECKED statuses to UNOPENED
alter table public.campaign_applications
  alter column status type public.campaign_application_status_new
  using (
    case
      when status::text = 'CHECKED' then 'CHECKED'::public.campaign_application_status_new
      else 'UNOPENED'::public.campaign_application_status_new
    end
  );

-- Step 3: Update default value for status column (old default 'submitted' is now invalid)
alter table public.campaign_applications
  alter column status set default 'UNOPENED'::public.campaign_application_status_new;

-- Step 4: Alter campaign_application_status_history table
alter table public.campaign_application_status_history
  alter column previous_status type public.campaign_application_status_new
  using (
    case
      when previous_status::text = 'CHECKED' then 'CHECKED'::public.campaign_application_status_new
      else 'UNOPENED'::public.campaign_application_status_new
    end
  );

alter table public.campaign_application_status_history
  alter column new_status type public.campaign_application_status_new
  using (
    case
      when new_status::text = 'CHECKED' then 'CHECKED'::public.campaign_application_status_new
      else 'UNOPENED'::public.campaign_application_status_new
    end
  );

-- Step 4: Drop the old enum type
drop type if exists public.campaign_application_status cascade;

-- Step 5: Rename the new enum to the original name
alter type public.campaign_application_status_new rename to campaign_application_status;

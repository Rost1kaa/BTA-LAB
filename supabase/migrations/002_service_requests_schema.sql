-- Add new columns to service_requests table for the professional service request system
-- Keeps existing columns for backward compatibility with the quiz component

alter table public.service_requests
  add column if not exists service_name text not null default '',
  add column if not exists client_name text not null default '',
  add column if not exists email text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists business_type text not null default '',
  add column if not exists business_description text not null default '',
  add column if not exists has_existing_website boolean not null default false,
  add column if not exists website_url text not null default '',
  add column if not exists deadline text not null default '',
  add column if not exists budget text not null default '';

-- Update the status check constraint to support the new status values
-- The old constraint allowed: 'new', 'read', 'in_progress', 'closed', 'spam'
-- The new constraint adds: 'contacted', 'completed', 'cancelled'

alter table public.service_requests
  drop constraint if exists service_requests_status_check;

alter table public.service_requests
  add constraint service_requests_status_check
  check (status in ('new', 'read', 'in_progress', 'closed', 'spam', 'contacted', 'completed', 'cancelled'));

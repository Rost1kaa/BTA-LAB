-- Add a separate cover image field for the portfolio detail page.
-- When set, this image is used as the hero on the project detail page
-- instead of the listing thumbnail (cover_image).

alter table public.portfolio_projects
add column detail_cover_image_url text not null default '';

# Clean Supabase Reset

Use this when replacing the old Supabase project with a fresh production-ready setup.

## 1. Delete the old Supabase project

1. Open the Supabase dashboard.
2. Select the old project.
3. Go to Project Settings > General.
4. Use Delete project and confirm the deletion.
5. Remove old local environment values that pointed at the deleted project.

## 2. Create the new Supabase project

1. Create a new Supabase project from the dashboard.
2. Save the project URL, anon key, and service role key.
3. In Authentication > Providers, keep Email enabled.
4. In Storage, no manual bucket creation is required; the migration creates `portfolio-images`.

## 3. Configure environment variables

Create `.env` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_EMAIL=admin@example.com
ADMIN_DISPLAY_NAME=BTA LAB Admin
ADMIN_PASSWORD=replace-with-a-strong-password
```

`ADMIN_PASSWORD` is only required when the seed script needs to create the Auth user. It must be at least 12 characters and include at least three of lowercase, uppercase, number, and symbol.

## 4. Run the database setup

Install and log into the Supabase CLI, then link the fresh project:

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

The schema comes from `supabase/migrations/001_clean_initial_schema.sql`.

## 5. Run the seed

```bash
npm install
npm run seed
```

The seed creates or links the Supabase Auth admin user, upserts `admin_profiles`, default settings, bilingual CMS content, services, portfolio categories/projects, and team members.

## 6. Verify

```bash
npm run lint
npm run build
npm run dev
```

Then verify:

- The public website opens in Georgian by default.
- Admin login works with the seeded admin email and password.
- CMS content appears on public pages.
- The contact form creates rows in `contact_messages`.
- The project questionnaire creates rows in `service_requests`.
- `/admin/messages` shows contact submissions.
- `/admin/service-requests` shows Website, Social Media, Advertising, and SEO request sections.

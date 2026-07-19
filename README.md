This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database Seeding

The BTA LAB CMS uses Supabase for its content management system. The seed script populates the database with initial content so the website works out of the box.

### How It Works

The seed script:

1. Loads environment variables from `.env` in the project root
2. Uses the Supabase **service-role key** (bypasses Row Level Security — server-side only)
3. Finds the Auth user automatically by `ADMIN_EMAIL` — paginates through all users
4. If the user does not exist, creates the Auth user (requires `ADMIN_PASSWORD` — minimum 8 characters)
5. Confirms newly created users automatically
6. Uses the Auth UUID automatically — no manual ID copying needed
7. Upserts the `admin_profiles` row linked to that UUID
8. Seeds all CMS content

### Setup

1. **Create `.env` in the project root:**

   ```bash
   cp .env.example .env
   ```

2. **Add your Supabase credentials and admin details:**

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-password
   ADMIN_DISPLAY_NAME=Admin
   ```

   > **Security:** The service-role key bypasses Row Level Security. Never commit `.env` or real secrets to version control. Find the service-role key in the Supabase Dashboard under **Project Settings → API → service_role key**.

3. **Apply the database migrations:**

   Apply the SQL files in `supabase/migrations` in numeric order before using the
   Admin Panel. For an existing database created from `001_initial_schema.sql`,
   apply `002_fix_admin_profiles_rls.sql` and
   `003_secure_admin_cms_policies.sql`. The latter removes automatic admin grants,
   secures all CMS/storage writes, and corrects legacy image paths.

   Use the Supabase SQL Editor, or `supabase db push` when the project is linked
   to the Supabase CLI.

4. **Install dependencies:**

   ```bash
   npm install
   ```

5. **Run the seed script:**

   ```bash
   npm run seed
   ```

6. **Verify the data** in the Supabase Table Editor (Dashboard → Table Editor).

### What Gets Seeded

| Table | Records | Upsert Key |
|---|---|---|
| `site_settings` | 13 | `setting_key` |
| `site_content` | 47 | `(page, section, content_key)` |
| `portfolio_categories` | 5 | `slug` |
| `portfolio_projects` | 1 (qey.ge) | `slug` |
| `service_packages` | 10 | Deterministic `id` |
| `team_members` | 8 | Deterministic `id` |
| `admin_profiles` | 1 | `id` |

### Password Requirements

- `ADMIN_PASSWORD` is **only required** when no existing Auth user with the configured email is found
- If the user already exists, the existing password is never changed
- New passwords must be at least 8 characters
- The password is never printed or logged

### Idempotency

The seed script is safe to run multiple times. It uses upsert operations with conflict keys — running it twice will not create duplicate Auth users or database rows. Duplicate-email race conditions during user creation are handled automatically.

### Error Handling

If any critical operation fails, the script prints an actionable error message and exits with a non-zero status code. A summary table shows how many records were processed per table.

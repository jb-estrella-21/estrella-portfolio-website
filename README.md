# Portfolio website — phase 6

The site supports a single-admin publishing flow, editable profile and skills, section visibility and ordering, project image management, and a first-visit space-map introduction. Portfolio text remains blank until supplied. Draft and archived projects stay private, including their images.

## Stack

- Next.js App Router, React, and TypeScript
- Supabase PostgreSQL, Auth, and row-level security
- Server Actions for protected admin mutations
- Markdown rendered without raw HTML

## Supabase setup

1. Create a Supabase project.
2. In **Authentication → Providers / Sign-in**, disable public sign-ups. Create the one administrator from the Supabase dashboard.
3. Run [`supabase/migrations/0001_portfolio_projects.sql`](supabase/migrations/0001_portfolio_projects.sql), then [`supabase/migrations/0002_profile_sections_media.sql`](supabase/migrations/0002_profile_sections_media.sql), in the Supabase SQL editor.
4. In **Authentication → Users**, copy the administrator's UUID. Add that UUID and email to the allowlist table in the SQL editor:

   ```sql
   insert into public.admin_users (id, email)
   values ('ADMIN-AUTH-UUID', 'ADMIN-EMAIL');
   ```

5. Copy `.env.example` to `.env.local` and set the project URL and publishable key from **Project Settings → API**. Set `NEXT_PUBLIC_SITE_URL` to the public site origin (for example, `https://portfolio.example.com`) before building for production. Never put a secret or service-role key in a `NEXT_PUBLIC_` variable.
6. Install dependencies and start the app:

   ```bash
   npm install
   npm run dev
   ```

7. Open `/admin/login` and sign in. Use **Profile & sections** to edit the portfolio details and navigation. Create a project, upload its images, and publish it when ready. Published projects appear at `/projects` and on the home page; draft and archived projects and their media remain private.

The app uses Supabase Auth sessions in secure cookies. The `proxy.ts` refreshes sessions for dashboard requests, while each protected server action checks the authenticated user against `admin_users`. Database row-level security independently limits public reads to published projects, visible sections, and published project media; administrator writes are limited to allowlisted accounts. The private `portfolio-media` bucket accepts optimized WebP files up to 5 MiB. The app converts JPEG, PNG, and WebP uploads to WebP, resizes them to at most 2400 × 1600, and returns media through a no-store route that rechecks publication access.

## Content behavior

- Profile fields support plain text and Markdown biography and experience content. Raw HTML is not rendered.
- Skills use one line per entry: `Skill name | Optional category`. Line order controls display order.
- The section list has fixed types (About, Projects, Skills, Experience / education, and Contact). Projects and Contact remain visible; other sections can be hidden and all sections can be reordered.
- Project and image display order uses lower numbers first. Each image needs descriptive alternative text.
- No biography, skills, contact links, project content, or experience details are seeded. Visible sections appear as destinations on the responsive space map and retain direct page routes. The short first-visit introduction can be skipped immediately; its dismissed preference is stored only in local browser storage.
- Keyboard users can skip directly to each page's main content. Reduced-motion preferences are honored.
- `/sitemap.xml` includes visible section routes and published project pages only. `/robots.txt` excludes the admin dashboard and private media endpoint. Canonical and share URLs are emitted when `NEXT_PUBLIC_SITE_URL` is configured.

## Production checks

Before connecting a production domain:

1. Configure all Supabase tables, row-level security policies, storage bucket, and the single admin allowlist entry using the setup steps above.
2. Set `NEXT_PUBLIC_SITE_URL` to the final HTTPS origin in the hosting provider's production environment, then rebuild the app.
3. Run `npm ci`, `npm run typecheck`, and `npm run build` in CI. Run `npm run smoke:site -- https://your-site.example` against a deployment to check public routes, crawler files, canonical URLs, and admin noindex behavior. This HTTP check does not replace browser testing of intro dismissal, keyboard interaction, and small-screen layout.
4. Check `/robots.txt`, `/sitemap.xml`, `/admin/login`, and a published project URL on the deployed domain. Confirm only published content appears in the sitemap and draft media remains inaccessible.

The repository is ready for deployment setup, but it has not been connected to a Supabase project or published to a hosting provider. No production credentials, domain, or personal portfolio content are included.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the Vercel release handoff and production smoke checks.

## Hosting default

For the current Next.js + Supabase architecture, use Vercel for the app and Supabase for Auth, Postgres, and private media. The free Vercel Hobby plan is limited to personal, non-commercial use; its current listed price is $0/month, while Pro is $20/month. Supabase Free is $0/month but projects can pause after a week of inactivity; Pro starts at $25/month. These limits make the free tiers suitable for development or a personal preview, while ongoing professional use should budget for the applicable paid plans and a domain. See the [Vercel plans](https://vercel.com/docs/plans/hobby) and [Supabase pricing](https://supabase.com/pricing) before launch because limits and prices can change.

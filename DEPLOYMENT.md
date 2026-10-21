# Phase 5 — Production deployment

## Current state

The production build and TypeScript checks pass. Local HTTP checks returned 200 for the home page, `/robots.txt`, `/sitemap.xml`, and `/admin/login`. The workspace is not a Git working tree, no Vercel project is linked, and Supabase has not been configured, so no external deployment has been made. Portfolio content remains placeholder text by request.

## Deployment target

Use Vercel for the Next.js app and Supabase for authentication, Postgres, and private media. Vercel detects Next.js projects and supports Git-connected preview and production deployments. See the [Next.js on Vercel guide](https://vercel.com/docs/frameworks/full-stack/nextjs) and [Git deployments guide](https://vercel.com/docs/git).

## Prepare the backend

1. Create the Supabase project and disable public sign-ups.
2. Run the migrations in order: [`0001_portfolio_projects.sql`](supabase/migrations/0001_portfolio_projects.sql), then [`0002_profile_sections_media.sql`](supabase/migrations/0002_profile_sections_media.sql). The second migration creates the private `portfolio-media` bucket and its access policies.
3. Create the administrator in Supabase Auth, then add that user's ID and email to `public.admin_users`. The SQL example is in the [README](README.md#supabase-setup).
4. Keep the Supabase service-role key out of this app. It uses the publishable key and database policies for access control.

## Connect and configure Vercel

1. Put this project in a Git repository and connect that repository to a new Vercel project. The current workspace has no Git history or remote to connect.
2. Select the project root as the Vercel root directory. Keep the Next.js framework preset, install command `npm ci`, and build command `npm run build`.
3. Add these environment variables to the Vercel Production environment before the first production build:

   | Variable | Value |
   | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
   | `NEXT_PUBLIC_SITE_URL` | Final public origin, such as `https://portfolio.example.com` |

   These values are environment-specific in Vercel. Configure Preview values separately if preview deployments should use a staging Supabase project; otherwise protect previews and avoid exposing draft or private content. See [Vercel environment variables](https://vercel.com/docs/environment-variables).

4. Deploy a preview first. Confirm the site URL matches the deployment environment, then run the checks below.
5. Add the production domain in Vercel, set `NEXT_PUBLIC_SITE_URL` to that exact HTTPS origin for Production, and redeploy so canonical URLs and the sitemap use the final domain.

## Release checks

- Open the home page and verify the introduction can be skipped, the map links work, and the keyboard skip link moves to the main content.
- Open each visible section directly and through navigation. Check browser Back and Forward and confirm hidden sections return not found.
- In the admin dashboard, create a project, upload an image with alt text, publish it, and verify its card and detail page. Confirm draft and archived projects and their media are not public.
- Check `/robots.txt`, `/sitemap.xml`, a project's page title/canonical/share metadata, and `/admin/login` on the deployed origin.
- Run `npm run smoke:site -- https://your-site.example` against the deployed origin. The command checks the anonymous HTTP surface and does not replace browser testing.
- Confirm uploads accept only supported images, admin changes persist after reload, and an unauthorized session cannot mutate content.
- Run `npm ci`, `npm run typecheck`, and `npm run build` before production deployment.

## Remaining launch dependencies

Deployment requires a Git repository and remote, a configured Supabase project, a connected Vercel account, and the final production origin. Add portfolio content before sharing the public URL. Do not paste credentials into chat; enter them in the provider's environment settings.

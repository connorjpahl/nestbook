# Little Timeline

A multi-tenant, interactive timeline where families add photos, videos, and
narrated stories to celebrate a child's milestones as they grow. Any number
of people (parents, grandparents, caregivers) can be invited to contribute to
the same timeline; each family's data is fully isolated from every other
family's via Postgres Row Level Security.

**Stack:** Next.js 16 (App Router) + TypeScript + Tailwind CSS v4 + Supabase
(Postgres, Auth, Storage).

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the SQL Editor, paste and run the contents of
   [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql).
   This creates every table, the `media` storage bucket, and all Row Level
   Security policies.
3. In **Project Settings → API**, copy the **Project URL** and **anon public**
   key.
4. (Optional, for local dev) In **Authentication → Providers → Email**,
   disable "Confirm email" so new accounts can sign in immediately without
   clicking an email link.

## 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` with
the values from step 1.

## 3. Run it

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), create an account, and
start a timeline.

## How the multi-tenancy works

- A **timeline** belongs to one child. A **timeline_members** row links users
  to timelines with a role (`owner`, `editor`, `viewer`).
- Every table (`timelines`, `events`, `event_media`, and the private `media`
  storage bucket) is locked down with RLS policies that check timeline
  membership — a user can only ever see or modify data for timelines they've
  been added to.
- Timelines can only be created through the `create_timeline` Postgres
  function, which atomically creates the timeline and makes the creator its
  `owner` — there's no direct-insert path that could create an orphaned or
  unowned timeline.
- Photos and videos live in a **private** storage bucket
  (`{timeline_id}/{event_id}/{filename}`); the app generates short-lived
  signed URLs server-side after confirming the requester is a member.

## Project structure

- `supabase/migrations/0001_init.sql` — full schema, RLS policies, storage
  bucket and policies.
- `src/lib/supabase/` — browser/server Supabase clients and the session-
  refresh helper used by `src/proxy.ts`.
- `src/lib/actions/` — server actions (auth, timeline creation, invites,
  adding events with media uploads).
- `src/app/` — routes: landing page, `/login`, `/signup`, `/dashboard`
  (list/create timelines), `/timeline/[id]` (the timeline itself).

## Deploying

Any Next.js host works (e.g. [Vercel](https://vercel.com/new)). Set the same
two `NEXT_PUBLIC_SUPABASE_*` environment variables in your hosting provider,
then deploy. See [`.env.local.example`](.env.local.example) for the exact
variable names.

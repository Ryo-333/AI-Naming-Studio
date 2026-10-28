# Supabase availability and recovery

## Production binding

On October 28, 2026, the JavaScript served by the production `/account` page
at https://ai-naming-studio.vercel.app contained the Supabase origin
`https://dtboygxezsgzztyewefr.supabase.co`. This matches the project named
**ai naming app** in the inactivity warning. The historical project log's
"Ryo Kami Studios" name is not a reliable environment identifier; no rename
history was verified. Match project references, not display names.

`mobile/capacitor.config.json` points the native wrapper at the same web
deployment. This establishes the checked-in wrapper's dependency; it does
not verify any separately distributed mobile build.

The deployed client uses `NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_ANON_KEY`. Changing Vercel variables requires a new
build for browser code. Keep both values on the same existing project.
Never place service-role credentials in browser variables or this repository.

## What an outage affects

- Email magic-link sign-in, registration, and session refresh depend on Auth.
- Pulling and pushing favorites collections depend on `public.user_collections`.
- Favorites stored on the device remain in localStorage (`ans.collections.v1`).
  A failed cloud save is not a backup. Local-only mode is also not cloud sync.
- Naming generation and local tools are separate from Supabase; generation
  still depends on its configured AI provider or demo mode.
- The repository's optional billing code depends on Supabase user validation
  and the `entitlements` table. Its presence in source does not establish
  that billing is enabled in production.

## Protect data before troubleshooting

1. On every device/browser that holds favorites, open Favorites, select each
   collection, and download its JSON export. Keep copies away from that device.
   Do not clear browser/app data, reinstall the wrapper, or remove saved local
   collections to troubleshoot a cloud outage. The existing exports are
   per-collection snapshots, not a full database/Auth backup; automatic import
   of them has not been verified.
2. Use the official [database backup guide](https://supabase.com/docs/guides/platform/backups)
   to make an off-site logical backup with the Supabase CLI. Free projects
   should not rely on paid-plan daily backup availability. Follow the linked
   backup/restore workflow for roles, schema, and data, including Auth data.
   Use a private environment for the database connection credentials; never
   commit database dumps, user records, passwords, or tokens.
3. Back up Storage object files separately if used. A database dump contains
   Storage metadata, not the object bytes. Preserve Auth URL settings and
   other project configuration separately from application data.
4. Validate a backup by restoring into an isolated test environment before
   treating it as a recovery guarantee. Do not overwrite production to test it.

## Warning received while active

Open the [existing project](https://supabase.com/dashboard/project/dtboygxezsgzztyewefr)
and verify its status. If active, there is nothing to resume. Supabase's
[pausing guide](https://supabase.com/docs/guides/platform/free-project-pausing)
lists dashboard activity and sufficient requests through the application/API
as ways to prevent a pending pause. Routine read-only health checks are useful
diagnostics, but one check does not guarantee cancellation of a warning or
future uptime. Free projects can still be paused after insufficient activity.

For reliable production availability without inactivity pausing, evaluate
Supabase's paid plan with the owner's approval. Do not upgrade automatically.
Do not add synthetic keep-alive jobs and represent them as an uptime guarantee.

## If the dashboard later says paused

1. Open the same project and use **Resume project**, then wait for healthy
   status. Resuming the existing project preserves its environment and data.
   Do not create a replacement database or rerun migrations just to unpause it.
2. Check the project-specific restore deadline in the dashboard. The warning
   email says 90 days from the pause date; the public guide read on October 28,
   2026 says one year. Act promptly within the shorter period until the
   dashboard or Supabase support confirms which applies. The warning date is
   not the start of the restore window.
3. If Resume is unavailable, download any available database backup and
   Storage objects from Project Overview before deletion. Follow Supabase's
   [recovery guide](https://supabase.com/kb/troubleshooting/restore-project-after-90-days-pause)
   to restore into a new project, then verify data, RLS, Auth configuration,
   and redirect URLs before changing production environment variables.
4. Confirm Authentication URL Configuration includes the intended production
   Site URL and `/account` redirect. Use the owner's account to test receiving
   and completing a fresh magic link. This requires access to that mailbox.
5. After exporting local favorites, use **Sync now** and check the cloud rows.
   Test on a second browser/device. The current merge algorithm has a known
   stale-device deletion-resurrection limitation; avoid mass cleanup while
   comparing copies. Successful Auth/settings or REST probes alone do not
   prove end-to-end sign-in, authorized writes, or cross-device synchronization.

## Sync failure regression tests

With Node 24, run from `app/`:

```sh
node --experimental-vm-modules --test tests/sync-outages.test.mjs
```

The suite executes the store with a scripted Supabase client and in-memory
browser storage. It checks successful merging, database failures at each
stage, session errors, network exceptions, sign-out between pull and push,
and missing configuration. Failures must preserve local names and must not
report a successful cloud save. These tests do not contact production.

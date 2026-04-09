-- Helper SQL for the assigned backend scope.
-- Apply the shared base schema first, then this patch.
-- This keeps the database aligned with the NestJS TypeScript backend.

alter table public.profiles
  add column if not exists notification_preferences jsonb not null default '{}'::jsonb;

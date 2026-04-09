# NestJS Backend

This folder contains the **TypeScript + NestJS** backend for the PakiSHIP web scope.

## Assigned backend scope

- Profile
- Settings
- Notifications

## Database-first setup

Prepare Supabase before running the API.

Apply these migration files in order:

1. `supabase/migrations/20260405120000_initial_shared_schema.sql`
2. `supabase/migrations/20260405121000_web_backend_scope.sql`

### What each backend module uses

- `profile` → `public.profiles`
- `settings` → `public.profiles` (`two_factor_enabled`, `password_updated_at`, `notification_preferences`)
- `notifications` → `public.customer_notifications`
- `auth` → Supabase Auth + `public.profiles`
- `parcel-drafts` → `public.parcel_drafts` + `public.parcel_draft_items`

## Run

```bash
npm install --prefix backend
npm run backend:dev
```

The API runs on `http://localhost:4000` by default and exposes routes under `/api`.

## Required env

Copy `backend/.env.example` into `backend/.env` and set:

```bash
PORT=4000
FRONTEND_ORIGIN=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
AUTH_SECRET=your_auth_secret_here
```

## Main routes

### Profile
- `GET /api/profile/me`
- `PATCH /api/profile/me`

### Settings
- `GET /api/settings/me`
- `PATCH /api/settings/me`
- `POST /api/settings/change-password`

### Notifications
- `GET /api/notifications`
- `POST /api/notifications`
- `PATCH /api/notifications/:notificationId/read`
- `POST /api/notifications/read-all`
- `DELETE /api/notifications/:notificationId`
- `DELETE /api/notifications`

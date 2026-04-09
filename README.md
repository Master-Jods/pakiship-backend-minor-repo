# PakiSHIP

This repository is now split into two clear apps:

- [`frontend/`](/Users/jods/Downloads/pakiship-backend-minor-repo-main/frontend): Next.js frontend
- [`backend/`](/Users/jods/Downloads/pakiship-backend-minor-repo-main/backend): NestJS backend

The original design source is available at:
https://www.figma.com/design/j5vmoQX9FcFtBRnnTzQE71/PakiSHIP

## Run The Frontend

```bash
npm install --prefix frontend
npm run frontend:dev
```

## Run The Backend

```bash
npm install --prefix backend
npm run backend:dev
```

## Frontend Env

Set this in [`frontend/.env.local`](/Users/jods/Downloads/pakiship-backend-minor-repo-main/frontend/.env.local):

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Supabase Schema (Customer Dashboard APIs)

Run this SQL in your Supabase SQL editor:

`backend/supabase/customer_dashboard_schema.sql`

This creates:
- `customer_reviews`
- `customer_announcements`

## New Customer API Endpoints

All routes are under `/api` (example base URL: `http://localhost:4000/api`):

- `GET /customer/dashboard/active-deliveries`
- `GET /customer/dashboard/announcements`
- `GET /customer/reviews?limit=5`
- `POST /customer/reviews`
- `GET /customer/settings/preferences`
- `PATCH /customer/settings/preferences`
  

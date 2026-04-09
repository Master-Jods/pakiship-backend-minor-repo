# Frontend

This folder contains the Next.js frontend only.

It calls the Nest backend through [`src/lib/api-client.ts`](/Users/jods/Downloads/pakiship-backend-minor-repo-main/frontend/src/lib/api-client.ts), using `NEXT_PUBLIC_API_BASE_URL` from [`frontend/.env.local`](/Users/jods/Downloads/pakiship-backend-minor-repo-main/frontend/.env.local).

To enable the customer delivery map flow, also add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to `frontend/.env.local`.

## Run

```bash
npm install --prefix frontend
npm run frontend:dev
```

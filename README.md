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
```
  

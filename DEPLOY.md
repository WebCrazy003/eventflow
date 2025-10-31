## Deploying to Render

This guide walks through deploying the EventFlow monorepo (frontend + backend) to Render, including PostgreSQL and Supabase Storage, and how CI/CD is configured.

## Architecture of the Deployed Application

- **Render Web Service: Backend**

  - Source: `backend/` (monorepo)
  - Docker: `backend/Dockerfile.deploy`
  - Runs Prisma migrations on boot, then `node dist/index.js`
  - Env: `DATABASE_URL`, JWT secrets, CORS, Supabase keys

- **Render Web Service: Frontend**

  - Source: `frontend/` (monorepo)
  - Docker: `frontend/Dockerfile.deploy`
  - Built as static site and served by Nginx
  - Env (build args): `VITE_GRAPHQL_URL`, `VITE_GRAPHQL_WS_URL`

- **Render PostgreSQL**

  - Managed Postgres instance
  - Connection string used as `DATABASE_URL` in backend

- **Supabase Storage**
  - Bucket for event images (public URLs)
  - Env in backend: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_BUCKET`

## Post‑Deployment Verification

1. Open the frontend URL and log in with demo accounts.
2. Open the backend `/graphql` explorer and run a health query.
3. Create an event (organizer), upload an image, and book a ticket (user) to validate DB and Storage integration.

## Deployed URLs & Online Credentials

- Backend GraphQL: `https://eventflow-backend-latest.onrender.com/graphql`
- Frontend: `https://eventflow-frontend-latest.onrender.com`
- Credentials:
  - Admin: `admin@eventflow.com` / `admin123`
  - Organizer: `organizer@eventflow.com` / `organizer123`
  - User: `user@eventflow.com` / `user123`

## CI Pipeline: `.github/workflows/ci.yml`

This section describes a typical GitHub Actions workflow for this monorepo that validates the code and triggers Render deploys via webhooks.

### What the workflow does (step by step)

https://github.com/WebCrazy003/eventflow/actions
<img width="925" height="184" alt="image" src="https://github.com/user-attachments/assets/62564a3a-a76c-446e-afe1-12074fe58142" />

https://dashboard.render.com/
<img width="946" height="425" alt="image" src="https://github.com/user-attachments/assets/427a7967-8ad9-4b45-bac1-9170c1b6a1ef" />

1. **Trigger**

   - Runs on push to `main` and on pull requests (for validation).

2. **Checkout repository**

   - Uses `actions/checkout` to fetch the monorepo code.

3. **Setup Node**

   - Uses `actions/setup-node@v4` with Node 18 and npm cache enabled.

4. **Install dependencies (backend and frontend)**

   - `npm ci` in `backend/`
   - `npm ci` in `frontend/`

5. **Run tests**

   - `npm test` in `backend/`
   - `npm test` in `frontend/`

6. **Build (sanity check)**

   - `npm run build` in `backend/` (ensures TypeScript compiles)
   - `npm run build` in `frontend/` (ensures SPA builds)

7. **Build and push Docker images to registry (GHCR)**

- Ensure workflow permissions include `packages: write`.
- Login to GHCR using `GITHUB_TOKEN`.
- Build and push images:
  - Backend: `ghcr.io/<owner>/<repo>-backend:${GITHUB_SHA}` and `:latest`
  - Frontend: `ghcr.io/<owner>/<repo>-frontend:${GITHUB_SHA}` and `:latest`

8. **Trigger Render deployments (only on main branch)**

   - Uses `curl` to POST to Render deploy webhooks stored as secrets:
     - `RENDER_BACKEND_DEPLOY_HOOK`
     - `RENDER_FRONTEND_DEPLOY_HOOK`
   - These webhooks are configured from the Render dashboard per service (Deploy Hooks) and should target services set to deploy from **Docker Image (Registry)** pointing to the GHCR tags above.

9. **Render pulls and deploys Docker images**
   - After receiving the webhook(s), Render pulls the prebuilt images from GHCR and deploys them. Image builds occur in GitHub Actions, not on Render.

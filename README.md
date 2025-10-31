## Overview

EventFlow is a full‑stack event management and ticketing app built with a GraphQL backend and a Vue 3 frontend. It supports authentication with roles, event browsing and filtering, bookings with capacity enforcement, image uploads, and real‑time updates via subscriptions.

## Tech Stack

### Backend (Node.js + TypeScript)

- **Apollo Server**: GraphQL API
- **Prisma**: ORM for **PostgreSQL**
- **JWT**: Access/refresh token auth
- **WebSocket**: GraphQL subscriptions
- **Supabase Storage**: Event image storage
- **Docker**: Containerization

### Frontend (Vue 3 + TypeScript)

- **Vue 3** with Composition API (`<script setup>`)
- **Pinia** for state management
- **Apollo Client** for GraphQL (queries/mutations/subscriptions)
- **Vite** for dev/build tooling
- **Tailwind CSS** for styling

## Architecture

- **Frontend (SPA)** calls the **GraphQL API** using Apollo Client over HTTP and WebSocket.
- **Backend** exposes GraphQL schema and resolvers, uses Prisma to access **PostgreSQL**.
- **Auth** uses JWT (access + refresh). Middleware extracts the user from `Authorization` headers.
- **Images** are uploaded from the backend to **Supabase Storage**, returning public URLs used by the frontend.
- **Subscriptions** notify clients about ticket count/availability changes in real time.

### Services

- Frontend: Vue SPA (Vite dev server in local; Nginx in production)
- Backend: Apollo Server (Node.js)
- Database: PostgreSQL
- Object storage: Supabase Storage (for event images)

## Database Structure

Tables (Prisma models):

- **users** (`User`)

  - `id`, `name`, `email` (unique), `password`
  - `roles` (enum array: USER, ORGANIZER, ADMIN)
  - Relations: `events` (organized), `tickets`

- **events** (`Event`)

  - `id`, `title`, `description?`, `location?`, `startAt`, `endAt`, `capacity`
  - `organizerId` → `users.id`
  - Relations: `tickets`, `images`

- **tickets** (`Ticket`)

  - `id`, `userId`, `eventId`, `type?`, `status` (CONFIRMED | CANCELLED | REFUNDED)
  - Unique: (`userId`, `eventId`) to prevent duplicate booking

- **event_images** (`EventImage`)
  - `id`, `eventId`, `filename`, `path`, `url`, `alt?`

Enums: `Role`, `TicketStatus`.

### Database Management

```bash
cd backend
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate client
npx prisma db seed         # Seed database
```

## Testing

This repo includes unit, integration, and acceptance tests.

### Backend

- **Unit tests**: Focus on isolated logic (auth utils, role checks, resolvers’ helpers).

  - Location: `backend/tests/*.test.ts`
  - Run:
    ```bash
    cd backend
    npm install
    npm test
    ```

- **Integration tests**: Start the GraphQL server against a test DB, exercise queries/mutations including auth and bookings.
  - Examples: `integration.events.test.ts`, `integration.booking.test.ts`
  - Requires a Postgres instance (Docker compose provides one) and seeded data.
  - Run (with services up):
    ```bash
    cd backend
    npm test
    ```

### Frontend

- **Unit/component tests**: Vue components with Vitest + Vue Test Utils (rendering, props, events, input validation).
  - Location: `frontend/tests/**` and `frontend/src/components/__tests__/`
  - Run:
    ```bash
    cd frontend
    npm install
    npm test
    ```

### End‑to‑end / Acceptance

- A minimal acceptance script is included to validate end‑to‑end flows against a running stack (API + DB + frontend).
  - Location: `test/acceptance.sh` and `test/subscription_client.js`
  - Typical flow: bring up services with Docker Compose, then run the acceptance script to verify booking/subscription behavior.
  - Example:
    ```bash
    # from repo root, with docker-compose up -d already running
    bash test/acceptance.sh
    ```

## Local Development

### Prerequisites

- Node.js 18+
- Docker & Docker Compose

### Configure environment

```bash
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

### Start with Docker Compose (recommended)

```bash
docker-compose up -d
```

This will:

- Start PostgreSQL on port 5432
- Build and start the backend API on port 4000
- Build and start the frontend on port 3000
- Run migrations and seed data automatically

### Access locally

- Frontend: http://localhost:3000
- GraphQL API: http://localhost:4000/graphql

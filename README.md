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

## Application Workflow

1. **Authentication**
   - Users sign up or log in; the backend issues JWTs. The frontend stores tokens and attaches them to subsequent GraphQL requests.
2. **Browse and filter events**
   - Users load events with filters (search text, date range, organizer). The backend resolves queries via Prisma.
3. **Event details**
   - Fetches event metadata, image(s), remaining capacity, and related tickets for the current user.
4. **Booking flow**
   - User (role: USER) books a ticket. Backend checks capacity and uniqueness (`userId + eventId`), creates a `Ticket`, and emits a subscription update.
5. **Organizer/Admin management**
   - ORGANIZER creates/edits events they own; ADMIN can manage any event/user. Image uploads go to Supabase and URLs are persisted.
6. **Real‑time updates**
   - Subscriptions broadcast capacity/ticket changes; connected clients update without refresh.

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

### Backend

```bash
cd backend
npm install
npm test
```

### Frontend

```bash
cd frontend
npm install
npm test
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

> The example files have sensible defaults for local use.

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

## Authentication and Roles

- **USER**: Browse events, book tickets, view own tickets
- **ORGANIZER**: Create/manage own events and images
- **ADMIN**: Full access

## Local Demo Credentials

After seeding the database:

- Admin: `admin@eventflow.com` / `admin123`
- Organizer: `organizer@eventflow.com` / `organizer123`
- User: `user@eventflow.com` / `user123`

## Deployed URLs & Online Credentials

- Backend GraphQL: `https://eventflow-backend-latest.onrender.com/graphql`
- Frontend: `https://eventflow-frontend-latest.onrender.com`
- Credentials (same as local demo):
  - Admin: `admin@eventflow.com` / `admin123`
  - Organizer: `organizer@eventflow.com` / `organizer123`
  - User: `user@eventflow.com` / `user123`

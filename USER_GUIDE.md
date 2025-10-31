## Summary

This User Guide explains how to use EventFlow to browse events, view details, and book tickets, as well as how organizers and admins manage events. It includes the end‑to‑end workflow, role capabilities, demo credentials, and links to the deployed frontend and GraphQL API so you can get started immediately.

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

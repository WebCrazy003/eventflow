## Architecture

### Backend (Node.js + TypeScript)
- **Apollo Server**: GraphQL API server
- **Prisma**: Database ORM with PostgreSQL
- **JWT**: Authentication with access/refresh tokens
- **WebSocket**: Real-time subscriptions
- **Docker**: Containerized deployment

### Frontend (Vue 3 + TypeScript)
- **Vue 3**: Composition API with `<script setup>`
- **Pinia**: State management
- **Apollo Client**: GraphQL client with subscriptions
- **Vite**: Build tool and dev server
- **TypeScript**: Strict type checking

### Database Schema
- **Users**: Authentication and role management
- **Events**: Event information and capacity
- **Tickets**: Booking system with status tracking
- **Images**: Event image management

### Database Management
```bash
cd backend
npx prisma studio          # Database GUI
npx prisma migrate dev     # Create migration
npx prisma generate        # Generate client
npx prisma db seed         # Seed database
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Authentication

### User Roles
- **USER**: Can book tickets and view events
- **ORGANIZER**: Can create and manage events
- **ADMIN**: Full system access

## Demo Credentials

After seeding the database:

- **Admin**: `admin@eventflow.com` / `admin123`
- **Organizer**: `organizer@eventflow.com` / `organizer123`
- **User**: `user@eventflow.com` / `user123`
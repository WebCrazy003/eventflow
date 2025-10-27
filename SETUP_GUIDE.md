# EventFlow - Simplified Setup Guide

## Overview
This guide provides detailed steps to run the simplified EventFlow application.

## Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Git

## Quick Start

### Step 1: Environment Configuration

#### Backend Environment
```bash
cp backend/env.example backend/.env
```

#### Frontend Environment
```bash
cp frontend/env.example frontend/.env
```

> **Note:** The default values in the example files work for local development.

### Step 2: Run with Docker Compose
```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database on port 5432
- Build and start the backend API on port 4000
- Build and start the frontend on port 3000
- Automatically run database migrations and seed data

### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **GraphQL API**: http://localhost:4000/graphql

## Demo Credentials

After the database is seeded, you can log in with:

- **Admin**: `admin@eventflow.com` / `admin123`
- **Organizer**: `organizer@eventflow.com` / `organizer123`
- **User**: `user@eventflow.com` / `user123`


## Manual Development Setup (Without Docker)

### Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Frontend Setup (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```

### Database Setup
You'll need to set up PostgreSQL manually and update the `DATABASE_URL` in your `.env` file.

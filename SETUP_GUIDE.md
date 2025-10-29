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

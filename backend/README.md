# Stocked Backend

Backend server for the Stocked invoice processing system built with Express, BullMQ, and better-auth.

## Features

- Express REST API for invoice processing
- BullMQ job queue for asynchronous invoice processing
- Better-auth integration for authentication and authorization
- Redis for job queue management
- PostgreSQL database with Prisma ORM
- OpenAI integration for invoice image analysis

## Prerequisites

- Node.js 18+ or Bun
- Docker and Docker Compose (for PostgreSQL and Redis)
- Running PostgreSQL and Redis services

## Getting Started

### 1. Install Dependencies

```bash
cd backend
npm install
# or
bun install
```

### 2. Start Database Services

Make sure PostgreSQL and Redis are running via Docker Compose:

```bash
# From the project root
docker-compose up -d
```

### 3. Set Up Prisma

The backend uses the Prisma schema from the frontend. You need to generate the Prisma client:

```bash
# From the frontend directory
cd ../frontend
npx prisma generate
```

### 4. Start the Backend Server

Run the Express server in development mode:

```bash
cd ../backend
npm run dev
# or
bun run dev
```

The backend server will start on `http://localhost:3001`

### 5. Start the Worker Thread

In a separate terminal, start the invoice processing worker:

```bash
npm run worker
# or
bun run worker
```

The worker will connect to Redis and start processing invoice jobs from the queue.

## Available Scripts

- `npm run dev` - Start the Express server in development mode with hot reload
- `npm run worker` - Start the invoice processing worker with hot reload
- `npm run build` - Build the TypeScript code for production
- `npm start` - Start the production server
- `npm run start:worker` - Start the production worker

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=3001
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=your-secret-here
DATABASE_URL=postgresql://admin:admin@localhost:5432/db?schema=public
NODE_ENV=development
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=admin
FRONTEND_URL=http://localhost:3000
OPENAI_API_KEY=your-openai-api-key
```

## API Endpoints

### Invoice Processing

- `GET /api/invoices/:jobId` - Get invoice job details
- `POST /api/invoices` - Create a new invoice processing job (requires multipart/form-data)
- `DELETE /api/invoices/:jobId` - Delete an invoice job
- `PATCH /api/invoices/:jobId/status` - Update invoice job status
- `PATCH /api/invoices/:jobId/response` - Update invoice job response
- `POST /api/invoices/accept` - Accept invoice analysis and save items to stock

### Health Check

- `GET /health` - Server health check

## Authentication

All endpoints require authentication via better-auth session. The session cookie must be sent with each request.

The middleware validates:
- User session existence
- Role-based access (USER, ADMIN, OWNER)
- Commerce-level authorization

## Architecture

```
backend/
├── src/
│   ├── index.ts                    # Express server entry point
│   ├── lib/
│   │   ├── auth.ts                 # Better-auth configuration
│   │   ├── prisma.ts               # Prisma client
│   │   ├── redis.ts                # Redis connection
│   │   ├── processInvoices.ts     # OpenAI invoice processing
│   │   └── queues/
│   │       └── invoice.queue.ts   # BullMQ queue setup
│   ├── middleware/
│   │   └── auth.middleware.ts     # Authentication middleware
│   ├── routes/
│   │   └── invoice.routes.ts      # Invoice API routes
│   └── workers/
│       └── invoice.worker.ts       # BullMQ worker for invoice processing
├── package.json
├── tsconfig.json
└── .env
```

## Worker Process

The invoice worker:
1. Connects to Redis and listens for jobs in the "invoice-processing" queue
2. Updates job status to PROCESSING when picked up
3. Processes invoice images using OpenAI's GPT-5-nano model
4. Extracts structured data (items, supplier, payment method)
5. Updates job status to COMPLETED, INVALID, or FAILED
6. Runs with concurrency of 2 jobs at a time

## Development

To run both the server and worker concurrently during development, use two terminal windows:

**Terminal 1 - Backend Server:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Invoice Worker:**
```bash
cd backend
npm run worker
```

Both will watch for file changes and automatically restart.

# Task Manager API - Backend Service

Node.js, Express, and MongoDB backend supporting the full-stack Task Management application (ITUE301: Advanced Web Development Frameworks).

## Features Implemented
- **CRUD Endpoints**: RESTful API for tasks (`GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`)
- **Single Task Endpoint**: `GET /tasks/:id` with 404 error handling
- **Database Persistence**: MongoDB integration with Mongoose schema validation (`models/Task.js`, `models/User.js`)
- **Authentication**: JWT token generation and verification with bcryptjs password hashing (`POST /register`, `POST /login`, `GET /me`)
- **Middleware Pipeline**: Global logging middleware, authentication guard, input validation, and centralized error handler
- **Practical 9 (In-Memory Caching)**: Server-side caching using `node-cache` with a 60-second TTL, automatic cache invalidation on write operations (`POST`, `PUT`, `DELETE`), and real-time cache metrics (`/cache-stats`)
- **Practical 10 (Event-Driven Architecture)**: Asynchronous non-blocking background notifications using Node.js native `EventEmitter` (`events.js`, `listeners.js`, `/event-logs`)
- **Practical 11 (Containerization & Docker Compose)**: Multi-container full-stack orchestration using Docker & Docker Compose (`docker-compose.yml`, multi-stage frontend Dockerfile, backend Dockerfile, named volumes, custom bridge network)
- **Practical 12 (CI/CD with GitHub Actions)**: Automated testing pipeline running on every push and pull request with Jest & Supertest (`.github/workflows/ci.yml`, `tests/api.test.js`)
- **Practical 13 (AI API Integration)**: Generative AI task description integration (OpenAI / Gemini) with rate limiting and graceful degradation (`/api/ai/generate-description`, `services/aiService.js`)

---

## Practical 13: AI API Integration into a Web Application

### 1. Features
- **Endpoint**: `POST /api/ai/generate-description`
- **Security**: Server-side API key storage in `.env` (never exposed to frontend)
- **Providers**: OpenAI `gpt-4o-mini`, Google Gemini REST API, and domain-aware heuristic fallback engine
- **Rate Limiting**: In-memory rate limiting (max 10 requests / minute)
- **Graceful Degradation**: Never crashes or blocks task creation if external AI APIs fail or time out
- **Frontend Integration**: "✨ AI Generate" button, animated loading state, editable textarea, and visible responsible AI disclaimer

---

## Practical 12: CI/CD Pipeline with GitHub Actions

![CI Pipeline](https://github.com/Bhushan-patil-git/portfolio-24DCE108/actions/workflows/ci.yml/badge.svg)

### 1. Automated Pipeline Steps
- **Trigger**: Runs on `push` to `main` and on `pull_request` targeting `main`.
- **Database**: Automated isolated MongoDB service container (`mongo:6.0`).
- **Backend Job**: Installs dependencies and executes Jest test suite (`npm test`).
- **Frontend Job**: Runs Oxlint code quality checks and builds the production bundle (`npm run build`).

### 2. Running Automated Tests Locally
```bash
npm test
```

---

## Practical 11: Containerization with Docker and Docker Compose

### 1. Multi-Container Orchestration
- **Root `docker-compose.yml`**: Defines and connects `mongodb`, `backend`, and `frontend`.
- **Backend `task-manager-api/Dockerfile`**: Alpine-based Node container running on port `5000`.
- **Frontend `portfolio/Dockerfile`**: Multi-stage build producing an optimized production bundle served on port `5173`.
- **Data Persistence**: Uses named volume `mongo-data` for MongoDB data survival.
- **Service Discovery**: Backend connects to MongoDB via `mongodb://mongodb:27017/taskmanager`.
- **Start Command**: `docker-compose up --build`

---

## Practical 10: Asynchronous Processing with Event-Driven Architecture

### 1. Architecture Details
- **Module**: Built using Node.js native `EventEmitter` in `events.js` and `listeners.js`.
- **Events Supported**:
  - `task-created`: Emitted when a new task is created. Dispatches background notifications asynchronously without blocking the client HTTP response.
  - `task-deleted`: Emitted when a task is deleted to generate background audit logs.
  - `error`: Catches listener errors to prevent server termination.
- **Endpoints**:
  - `GET /event-logs`: Exposes in-memory event audit records with exact timestamps.

### 2. Timestamp Verification Evidence
- **Client Response Sent**: `2026-10-14T16:32:01.120Z` (HTTP 201 Created in **~74ms**)
- **Background Work Finished**: `2026-10-14T16:32:01.931Z` (**811ms later**)
- **Command to verify**: `npm run verify:events`

---

## Practical 9: In-Memory Caching & Performance Benchmark

### 1. Cache Implementation Details
- **Library**: `node-cache`
- **Default TTL**: 60 seconds (`stdTTL: 60`)
- **Cache Keys**:
  - `all_tasks` (General tasks list)
  - `tasks_user_<id>` (User-specific tasks list)
  - `task_<id>` (Single-task endpoint cache)
- **Cache Invalidation**: Triggered automatically on all write operations (`POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`) to prevent stale data.

### 2. Empirical Performance Measurements
Tested via `npm run benchmark` against the live MongoDB instance:

| Request Condition | Sample 1 | Sample 2 | Sample 3 | Average Time | Speedup Factor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Uncached (MongoDB Reads)** | 39.88 ms | 4.74 ms | 4.87 ms | **16.50 ms** | 1x (Baseline) |
| **Cached (node-cache In-Memory)** | 5.48 ms (MISS) | 2.32 ms (HIT) | 2.04 ms (HIT) | **2.18 ms (HITs)** | **~7.5x Faster** |

### 3. How to Run the Server & Benchmark
```bash
# 1. Install dependencies
npm install

# 2. Start the server (runs on http://localhost:5000)
npm start

# 3. In a separate terminal, run the automated Practical 9 benchmark
npm run benchmark
```

### 4. Cache Debug Endpoints
- **GET `/cache-stats`**: Returns cache hits, misses, hit ratio, and active cache keys.
- **POST `/cache-clear`**: Manually flushes the in-memory cache.
- **GET `/tasks?no_cache=true`**: Query parameter to bypass cache and query the database directly.

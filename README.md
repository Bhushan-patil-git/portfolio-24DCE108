# ITUE301: Advanced Web Development Frameworks - Lab Portfolio

![CI Pipeline](https://github.com/Bhushan-patil-git/portfolio-24DCE108/actions/workflows/ci.yml/badge.svg)

- **Student Name:** Bhushan Patil
- **Student ID:** 24DCE108
- **Department:** Computer Engineering (Semester 5)
- **Institution:** Chandubhai S. Patel Institute of Technology (CSPIT) / DEPSTAR, Charotar University of Science and Technology (CHARUSAT)
- **Repository:** [Bhushan-patil-git/portfolio-24DCE108](https://github.com/Bhushan-patil-git/portfolio-24DCE108)

---

## 📚 Curriculum Practicals Overview

| Practical | Title / Topic | Status | Technologies Used |
| :--- | :--- | :---: | :--- |
| **Practical 1** | Introduction to React and Component Architecture | ✅ Complete | React, Vite, Functional Components, Props |
| **Practical 2** | State Management and Routing in React | ✅ Complete | React Router v7, `useState`, Controlled Forms |
| **Practical 3** | API Integration and Data Rendering in React | ✅ Complete | GitHub REST API, Async Fetch, Loading/Error States |
| **Practical 4** | Building a RESTful API with Node.js and Express | ✅ Complete | Express.js, REST CRUD, Logging & Error Middleware |
| **Practical 5** | MongoDB Integration and Schema Design with Mongoose | ✅ Complete | MongoDB, Mongoose Models, Validation, `.env` |
| **Practical 6** | Full Stack Integration (React + Node + MongoDB) | ✅ Complete | CORS, Axios/Fetch API client (`api.js`), Full-Stack CRUD |
| **Practical 7** | Authentication and Middleware Pipeline | ✅ Complete | JWT (`jsonwebtoken`), Password Hashing (`bcryptjs`), Auth Guard |
| **Practical 8** | Performance Optimization and Lazy Loading in React | ✅ Complete | `React.lazy()`, `<Suspense>`, Route-based Code Splitting |
| **Practical 9** | In-Memory Caching and Query Optimization | ✅ Complete | `node-cache`, TTL, Automatic Cache Invalidation, Benchmarks |
| **Practical 10** | Asynchronous Processing with Event-Driven Architecture | ✅ Complete | Node.js `EventEmitter`, Background Listeners, Audit Logs |
| **Practical 11** | Containerization with Docker and Docker Compose | ✅ Complete | Multi-stage Dockerfile, Nginx, `docker-compose.yml`, Volumes |
| **Practical 12** | CI/CD Pipeline with GitHub Actions | ✅ Complete | GitHub Actions (`.github/workflows/ci.yml`), Jest, Supertest |
| **Practical 13** | AI API Integration into a Web Application | ✅ Complete | OpenAI / Google Gemini API, Rate Limiting, Graceful Fallback |

---

## 🚀 Architecture & Monorepo Structure

```
portfolio-24DCE108/
├── .github/
│   └── workflows/
│       └── ci.yml               # Automated CI pipeline running tests on push/PR
├── docker-compose.yml           # Multi-container orchestration (MongoDB + API + React)
├── portfolio/                   # Frontend SPA (React + Vite)
│   ├── Dockerfile               # Multi-stage production container build
│   ├── nginx.conf               # High-performance SPA static server
│   ├── src/
│   │   ├── api.js               # Centralized authenticated backend API client
│   │   ├── App.jsx              # Code-split routing using React.lazy & Suspense
│   │   ├── components/          # Reusable UI components (NavBar, About, Skills, Footer, etc.)
│   │   └── pages/               # Route views (Home, Projects/Task Management, Contact, 404)
│   └── package.json
└── task-manager-api/            # Backend Service (Node.js + Express + MongoDB)
    ├── Dockerfile               # Containerized backend service
    ├── server.js                # Core Express application with middleware pipeline
    ├── models/                  # Mongoose Schemas (Task, User)
    ├── middleware/              # Authentication (`auth.js`) & Validation (`validate.js`)
    ├── cache.js                 # In-memory caching engine (`node-cache`)
    ├── events.js & listeners.js # Asynchronous event-driven background processing
    ├── services/aiService.js    # AI description generation with graceful degradation
    ├── tests/                   # Automated API tests (Jest + Supertest)
    └── package.json
```

---

## 🛠️ How to Run Locally

### Option 1: Multi-Container Setup via Docker Compose (Recommended)
Make sure Docker Desktop is running, then execute:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`
- MongoDB: `mongodb://localhost:27017`

### Option 2: Running Services Individually

1. **Start Backend Server:**
   ```bash
   cd task-manager-api
   npm install
   npm run dev
   ```

2. **Start Frontend Client:**
   ```bash
   cd portfolio
   npm install
   npm run dev
   ```

3. **Run Automated Test Suite:**
   ```bash
   cd task-manager-api
   npm test
   ```

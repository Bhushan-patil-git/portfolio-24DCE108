# Practical 11 Report: Containerization with Docker and Docker Compose

- **Course**: Advanced Web Development Frameworks (ITUE301)
- **Topic**: Full-Stack Multi-Container Orchestration with Docker and Docker Compose
- **Course Outcomes**: CO5 / PO3, PO5

---

## 1. Objective
To containerize the full-stack web application (React frontend, Node/Express backend, and MongoDB database) using Docker and orchestrate all three services seamlessly using a single `docker-compose up` command.

---

## 2. Multi-Container Architecture & Network Topology

```text
Host Machine / Browser
       │
       ├───► Port 5173 ──► [wdf-frontend]  (React / Vite Preview)
       │                         │
       ├───► Port 5000 ──► [wdf-backend]   (Express REST API)
       │                         │
       └───► Port 27017 ─► [wdf-mongodb]   (Official Mongo 6.0 Image)
                                 │
                      ┌──────────┴──────────┐
                      ▼                     ▼
              [wdf-app-network]      [wdf-mongo-data]
              (Bridge Network)       (Persistent Volume)
```

---

## 3. Implementation Summary

### A. Backend Dockerfile (`task-manager-api/Dockerfile`)
- Base Image: `node:18-alpine` (lightweight, secure Linux distribution).
- Copies `package*.json` first to leverage Docker layer caching during image rebuilds.
- Installs production dependencies (`npm install --omit=dev`).
- Exposes port `5000` and starts `server.js`.
- Configured `.dockerignore` to exclude local `node_modules` and `.env`.

### B. Frontend Dockerfile (`portfolio/Dockerfile`)
- **Multi-Stage Build** (Supplementary Problem):
  - **Stage 1 (`builder`)**: Uses `node:18-alpine` to install all dependencies and compiles production assets (`npm run build`) into `/app/dist`.
  - **Stage 2 (`runner`)**: Slim production runtime that only retains the compiled bundle and preview server, drastically reducing final image footprint.
- Exposes port `5173` and binds to `0.0.0.0` for host access.

### C. Docker Compose Orchestration (`docker-compose.yml`)
- Single command startup: `docker-compose up --build`.
- **Service Discovery**: Backend connects to MongoDB using the service name:
  `MONGO_URI=mongodb://mongodb:27017/taskmanager`.
- **Healthchecks & Dependencies**: Backend waits for MongoDB to be healthy (`service_healthy`) before launching.
- **Data Persistence**: Uses a named volume (`mongo-data:/data/db`) so database documents persist across container stops, restarts, and rebuilds.
- **Network Isolation**: Uses a dedicated bridge network (`wdf-app-network`).

---

## 4. Key Questions & Viva Answers

### Q1: Why does the backend container need to reference the MongoDB container by its service name (`mongodb`) rather than `localhost`?
**Answer**:
Each container runs in its own isolated network namespace with its own `localhost` (loopback interface `127.0.0.1`). If the backend container attempts to connect to `localhost:27017`, it searches for MongoDB inside its *own* container, which fails. In Docker Compose, all services attached to a user-defined bridge network (`app-network`) share an internal **embedded DNS server**. Docker automatically resolves the service name `mongodb` to the internal IP address assigned to the MongoDB container.

### Q2: What is the difference between `EXPOSE` in a Dockerfile and the `ports` mapping in `docker-compose.yml`?
**Answer**:
- **`EXPOSE` (Dockerfile)**: Serves primarily as documentation and metadata. It informs Docker that the container listens on that port at runtime, and allows communication between containers on the same Docker network, but **does not publish the port to the host machine**.
- **`ports` (docker-compose.yml)**: Actually publishes and maps the container port to the host machine interface (e.g., `"5000:5000"` forwards host traffic from `localhost:5000` to port `5000` inside the container).

### Q3: Why is it considered bad practice to copy `node_modules` into a Docker image instead of running `npm install` inside the container?
**Answer**:
1. **Binary Compatibility & Architecture**: Packages with native C/C++ bindings (e.g., `bcrypt`, `sharp`) compiled on Windows or macOS will fail or crash inside a Linux-based Docker container (`node:18-alpine`). Running `npm install` inside the container ensures native modules are compiled for the container's exact OS and architecture.
2. **Build Context Bloat**: Copying `node_modules` sends gigabytes of unnecessary data over the Docker daemon build context, causing slow builds.
3. **Layer Caching**: Relying on container-level `npm install` allows Docker to cache the dependency layer until `package.json` changes.

---

## 5. How to Run the Containerized Application

```bash
# 1. From the project root (where docker-compose.yml is located):
docker-compose up --build

# 2. Access the application in your browser:
#    - Frontend UI:  http://localhost:5173
#    - Backend API:  http://localhost:5000
#    - MongoDB:      localhost:27017

# 3. Stop all containers gracefully:
docker-compose down

# 4. Stop containers and remove persistent volumes (clean reset):
docker-compose down -v
```

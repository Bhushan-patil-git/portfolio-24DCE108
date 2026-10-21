# Practical 9 Report: In-Memory Caching and Query Optimization

- **Course**: Advanced Web Development Frameworks (ITUE301)
- **Topic**: Server-Side In-Memory Caching with `node-cache`
- **Course Outcomes**: CO2, CO4 / PO3, PO5

---

## 1. Objective
To implement server-side caching using `node-cache` in the Node.js/Express backend and empirically measure its performance impact on API response time.

---

## 2. Architecture & Flow Diagram

```text
GET /tasks request
       │
       ▼
 Cache Check (node-cache)
 ├── [HIT]  ──► Return cached tasks in-memory immediately (X-Cache: HIT) (~2ms)
 └── [MISS] ──► Query MongoDB ──► Store in Cache (TTL: 60s) ──► Return tasks (X-Cache: MISS) (~16ms-40ms)

POST / PUT / DELETE /tasks
       │
       ▼
 Write to MongoDB ──► Invalidate Cache Key ("all_tasks", "tasks_*", "task_<id>")
```

---

## 3. Implementation Steps Completed

1. **Dependency Installation**:
   - Installed `node-cache` (`npm install node-cache`).
2. **Dedicated Shared Cache Module (`cache.js`)**:
   - Initialized `NodeCache` with `stdTTL: 60` (60-second time-to-live) and `checkperiod: 120`.
   - Built helper functions: `getCache()`, `setCache()`, `delCache()`, `invalidateTaskCache()`, and `getMetrics()`.
3. **Route Integration in `server.js`**:
   - **`GET /tasks`**: First checks cache key `all_tasks` (or user-specific key). On a hit, returns cached data instantly with response headers `X-Cache: HIT` and `X-Response-Time`. On a miss, queries MongoDB and sets data into cache for 60s.
   - **`GET /tasks/:id`** *(Supplementary Problem)*: Implemented single-task caching with key `task_<id>`.
   - **Write Invalidation**: In `POST /tasks`, `PUT /tasks/:id`, and `DELETE /tasks/:id`, called `invalidateTaskCache(id)` to immediately evict stale data.
4. **Debug Endpoints**:
   - `GET /cache-stats`: Exposes cache hits, misses, hit ratio, active keys, and memory stats.
   - `POST /cache-clear`: Flushes in-memory cache on demand.
5. **Empirical Benchmarking**:
   - Built `benchmark-cache.js` to execute automated comparison runs against live MongoDB and output measured timings.

---

## 4. Empirical Performance Readings

Measurements obtained from automated benchmark runs (`npm run benchmark`):

| Condition | Sample 1 | Sample 2 | Sample 3 | Average Response Time | Speedup Factor |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Uncached (MongoDB Reads)** | 39.88 ms | 4.74 ms | 4.87 ms | **16.50 ms** | 1x (Baseline) |
| **Cached (node-cache HITs)** | 5.48 ms (MISS) | 2.32 ms (HIT) | 2.04 ms (HIT) | **2.18 ms** | **~7.5x Faster** |

### Observation:
- Caching eliminates database I/O, disk queries, and Mongoose document serialization overhead.
- Requests served from RAM memory respond in approximately ~2 ms compared to 16–40 ms for database queries.

---

## 5. Key Questions & Viva Answers

### Q1: Why must the cache be invalidated on every write operation, and what would happen to data correctness if it were not?
**Answer**:
A cache stores a snapshot of data at a specific point in time. When a write operation (`POST`, `PUT`, `DELETE`) occurs, the database state changes. If the cache is not invalidated, subsequent `GET` requests will continue serving outdated/stale data from memory until the TTL expires. This leads to **data inconsistency** (e.g., a deleted task still appearing on screen, or a completed task showing as pending). Invalidating the cache upon every write ensures **strict read-after-write consistency**.

### Q2: What is a reasonable TTL (time-to-live) for cached data in a task management context, and what trade-off does TTL length represent?
**Answer**:
In a task management system, a reasonable TTL is typically **30 to 60 seconds**.
The trade-off represents **Freshness vs. Performance**:
- **Shorter TTL (e.g., 5-15s)**: High data freshness and lower risk of stale data, but more frequent database queries (lower cache hit ratio).
- **Longer TTL (e.g., 5-10 minutes)**: Maximizes cache hits and minimizes database load, but increases the duration of potential staleness if an invalidation event is missed.

### Q3: Why is in-memory caching (`node-cache`) not suitable for a multi-server/multi-instance deployment, even though it works fine in this lab?
**Answer**:
`node-cache` stores cached values within the **process-local RAM** of that specific Node.js process. In a production multi-instance environment (behind a load balancer, PM2 cluster, or Kubernetes pods):
1. Instance A would have its own cache, and Instance B would have a separate cache.
2. A write request handled by Instance A invalidates only Instance A's local memory.
3. A subsequent read routed to Instance B would still read stale cached data.
For distributed/multi-server deployments, a **centralized distributed cache** such as **Redis** or **Memcached** is required so all server instances share the same cache state.

# Practical 10 Report: Asynchronous Processing with Event-Driven Architecture

- **Course**: Advanced Web Development Frameworks (ITUE301)
- **Topic**: Event-Driven Architecture using Node.js Native `EventEmitter`
- **Course Outcomes**: CO4 / PO3, PO5

---

## 1. Objective
To implement asynchronous background processing using Node.js native `EventEmitter` without external dependencies, decoupling side-effect processing (such as notifications and audit logs) from the critical HTTP request-response pipeline.

---

## 2. Architecture & Flow Diagram

```text
POST /tasks (HTTP Request)
       │
       ▼
 Save task to MongoDB (Mongoose)
       │
       ├──► res.status(201).json(task) ──► HTTP Response Sent Immediately (~74ms)
       │
       └──► emit('task-created', taskData) (Asynchronous Event)
                    │
                    ▼ (Handled in background after response is flushed)
             Notification Listener
                    │
                    ├──► Log task title, ID, timestamp
                    ├──► Execute background work (e.g. email, push notification, webhook)
                    └──► Background work completed timestamp (~800ms later)
```

---

## 3. Implementation Steps Completed

1. **Dedicated Event Emitter Module (`events.js`)**:
   - Created `TaskEvents` extending Node.js built-in `EventEmitter`.
   - Exported a singleton instance `taskEvents` across the application.
2. **Dedicated Listeners Module (`listeners.js`)**:
   - **`task-created` listener**: Listens for newly created tasks, logs entry, simulates asynchronous notification dispatch with `setTimeout` delay, and records execution completion.
   - **`task-deleted` listener** *(Supplementary Problem)*: Listens for task deletions and generates audit logs.
   - **`error` listener** *(Supplementary Problem)*: Catches unexpected event listener exceptions, safeguarding against server crashes.
   - Maintained in-memory audit logs of all events.
3. **Route Integration in `server.js`**:
   - Initialized event listeners at server boot.
   - In `POST /tasks`, dispatched the HTTP `201 Created` response immediately, then emitted `task-created` via `setImmediate()`.
   - In `DELETE /tasks/:id`, dispatched the HTTP `200 OK` response immediately, then emitted `task-deleted` via `setImmediate()`.
   - Added `GET /event-logs` endpoint for live event inspection.
4. **Automated Verification Script (`verify-events.js`)**:
   - Script runs `POST /tasks`, records exact client/server timestamps, verifies background completion, and tests deletion events (`npm run verify:events`).

---

## 4. Empirical Evidence: Log Timestamp Comparison

Server console logs during test execution:

```text
1. [API] Response sent at:
   2026-10-14T16:32:01.120Z

2. [Notification Service] Event received at:
   2026-10-14T16:32:01.125Z

3. [Notification Service] Background notification dispatched at:
   2026-10-14T16:32:01.931Z (+811ms later)
```

### Observation:
The HTTP response was transmitted and received by the client in **~74 ms**. The notification listener completed its background work **811 ms later**, proving conclusively that the main request-response cycle was **non-blocking**.

---

## 5. Key Questions & Viva Answers

### Q1: Why does emitting an event not block the API response, even though both run on the same Node.js process?
**Answer**:
Node.js operates on a single-threaded **Event Loop**. When `res.status(201).json(task)` is called and the event is emitted asynchronously (using `setImmediate()` or non-blocking timer callbacks in the listener like `setTimeout`), Node.js prioritizes completing and flushing the current synchronous call stack and socket I/O for the HTTP response. The background listener logic is scheduled onto the Event Loop's event queue and executes during subsequent ticks, ensuring the client receives its response without waiting for background tasks to finish.

### Q2: What would happen to API response time if the notification logic were placed directly inside the POST route instead of in an event handler?
**Answer**:
If notification logic (e.g., sending emails, SMS, external webhook requests, or heavy processing) were placed synchronously inside the `POST` route handler, the client would be blocked until that entire operation completes. For an 800ms email dispatch:
- **Without EventEmitter (synchronous inline)**: Response time = **~875 ms** (blocking the user).
- **With EventEmitter (asynchronous decoupled)**: Response time = **~74 ms** (instant user experience).

### Q3: Why is `EventEmitter` a reasonable choice for this scale of application, but not for a production system handling millions of events per day?
**Answer**:
`EventEmitter` is an excellent lightweight solution for small/medium applications because it is built into Node.js (zero external dependencies) and executes entirely in-memory with near-zero latency. However, for large-scale production systems:
1. **No Persistence**: If the Node process crashes or restarts, all pending events in memory are lost forever.
2. **Single-Process Bound**: `EventEmitter` cannot broadcast events across multiple server instances or microservices.
3. **No Retries / Backpressure**: It lacks built-in retry mechanisms, dead-letter queues, and rate-limiting.
Production distributed systems instead use dedicated message brokers such as **RabbitMQ**, **Apache Kafka**, **Redis BullMQ**, or **AWS SQS**.

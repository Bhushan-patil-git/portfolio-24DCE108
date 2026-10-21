# Practical 12 Report: CI/CD Pipeline with GitHub Actions

- **Course**: Advanced Web Development Frameworks (ITUE301)
- **Topic**: Automated Testing & CI/CD Pipeline using GitHub Actions
- **Course Outcomes**: CO5 / PO3, PO5

---

## 1. Objective
To automate testing and integration of the web application using a continuous integration (CI) pipeline powered by GitHub Actions, ensuring that every code push and pull request is automatically validated.

---

## 2. Pipeline Architecture & Flow Diagram

```text
git push origin main  OR  Pull Request
          │
          ▼
GitHub Actions Event Trigger (on: push, pull_request)
          │
          ├──► Job 1: Backend Automated Tests (ubuntu-latest)
          │     ├── Spin up MongoDB service container (mongo:6.0)
          │     ├── actions/checkout@v4
          │     ├── actions/setup-node@v4 (Node 18)
          │     ├── npm install
          │     └── npm test (Jest + Supertest suite)
          │
          └──► Job 2: Frontend Lint & Build (ubuntu-latest)
                ├── actions/checkout@v4
                ├── actions/setup-node@v4 (Node 18)
                ├── npm install
                ├── npm run lint (Oxlint 0 errors)
                └── npm run build (Vite production bundle)
          │
          ▼
Report Status: 🟢 Green Checkmark (Pass)  OR  🔴 Red X (Fail) on GitHub
```

---

## 3. Implementation Summary

### A. Automated Test Suite (`task-manager-api/tests/api.test.js`)
Built using **Jest** and **Supertest** covering 5 automated test cases:
1. `GET /tasks`: Asserts HTTP `200 OK` and returns JSON array of tasks.
2. `GET /cache-stats` *(Supplementary Problem)*: Asserts HTTP `200 OK` and validates cache metrics (`hits`, `misses`, `hitRatio`).
3. `POST /tasks` validation: Asserts HTTP `400 Bad Request` when required `title` is omitted.
4. Undefined route handling: Asserts HTTP `404 Not Found` for invalid endpoints.
5. `GET /event-logs`: Asserts HTTP `200 OK` for Practical 10 asynchronous event logs.

### B. CI Workflow Configuration (`.github/workflows/ci.yml`)
- **Triggers**: Runs automatically on every `push` to `main` and on every `pull_request` targeting `main`.
- **Database Provisioning**: Employs an official `mongo:6.0` container service with automated healthchecks so tests execute against a real isolated database in the cloud.
- **Frontend Quality Gate**: Runs `npm run lint` and `npm run build` to catch syntax, type, and bundle issues before merging.

---

## 4. Local Test Execution Results

```text
> task-manager-api@1.0.0 test
> jest --detectOpenHandles --forceExit --runInBand

PASS tests/api.test.js
  Practical 12: Automated API Tests for CI/CD Pipeline
    √ GET /tasks returns status 200 and task list (197 ms)
    √ GET /cache-stats returns status 200 with cache metrics (17 ms)
    √ POST /tasks returns 400 when title is missing (31 ms)
    √ GET /non-existent-route returns 404 Not Found (17 ms)
    √ GET /event-logs returns 200 with audit logs (27 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Snapshots:   0 total
Time:        2.727 s
```

---

## 5. Lab Demonstration: Simulating Failure and Recovery

### Step 1: Deliberate Test Failure (Red ❌)
In `tests/api.test.js`, temporarily change:
```javascript
// Deliberately broken assertion:
expect(res.statusCode).toBe(500); // Expected 200, received 200 -> FAILS
```
Commit and push to GitHub:
- The `npm test` step fails with exit code 1.
- GitHub Actions shows a **Red X** icon next to the commit and sends a failure notification.

### Step 2: Fixing the Test (Green ✅)
Restore the correct assertion:
```javascript
expect(res.statusCode).toBe(200);
```
Commit and push to GitHub:
- All 5 test cases pass.
- GitHub Actions shows a **Green Checkmark** indicating build and test success.

---

## 6. Key Questions & Viva Answers

### Q1: What is the difference between Continuous Integration and Continuous Deployment, and which one does this practical demonstrate?
**Answer**:
- **Continuous Integration (CI)**: Automatically builds code, runs linters, and executes automated tests every time a developer commits code. Its goal is to catch bugs and integration conflicts immediately.
- **Continuous Deployment (CD)**: Automatically deploys the validated code artifacts to production/staging servers without manual intervention once CI tests pass.
- **This practical demonstrates Continuous Integration (CI)** because it validates code correctness, runs automated test suites, and verifies production builds, but does not deploy to a production host.

### Q2: Why does running tests automatically on every push catch problems earlier than testing manually before a release?
**Answer**:
Automated tests execute within seconds of code being pushed. If an engineer breaks an existing endpoint, the bug is isolated to that specific commit, making the root cause obvious and fast to fix. Manual testing before a release often tests weeks of aggregated changes, making regression bugs significantly harder and more expensive to trace and resolve.

### Q3: What would happen to the pipeline if the test file path were incorrect — would the workflow fail at the same step as a genuine test failure?
**Answer**:
If the test file path is incorrect or no test files match the pattern, Jest will output an error such as `No tests found related to files matching...` and exit with an error code (or pass trivially if `--passWithNoTests` is enabled without tests). The workflow would fail at the **`Run tests` step**, but the error log would indicate a **configuration/file discovery failure** rather than an **assertion failure** from business logic.

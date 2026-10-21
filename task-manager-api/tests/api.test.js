const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../server");

// Ensure mongoose connection is ready before tests and disconnected cleanly after
beforeAll(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskmanager");
  }
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Practical 12: Automated API Tests for CI/CD Pipeline", () => {
  // 1. Core Practical 12 requirement: GET /tasks returns 200
  test("GET /tasks returns status 200 and task list", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 2. Supplementary Problem: Test a second endpoint (GET /cache-stats from Practical 9)
  test("GET /cache-stats returns status 200 with cache metrics", async () => {
    const res = await request(app).get("/cache-stats");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("hits");
    expect(res.body).toHaveProperty("misses");
    expect(res.body).toHaveProperty("hitRatio");
  });

  // 3. Validation test: POST /tasks without title should return 400 Bad Request
  test("POST /tasks returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/tasks")
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });

  // 4. Undefined route test: Returns 404 Not Found
  test("GET /non-existent-route returns 404 Not Found", async () => {
    const res = await request(app).get("/api/unknown-endpoint-xyz");
    expect(res.statusCode).toBe(404);
  });

  // 5. Practical 10 verification test: GET /event-logs returns 200
  test("GET /event-logs returns 200 with audit logs", async () => {
    const res = await request(app).get("/event-logs");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  // 6. Practical 13 verification test: POST /api/ai/generate-description returns 200
  test("POST /api/ai/generate-description generates description with fallback support", async () => {
    const res = await request(app)
      .post("/api/ai/generate-description")
      .send({ title: "Build Dockerfile for backend" });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("description");
    expect(typeof res.body.description).toBe("string");
    expect(res.body.description.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty("disclaimer");
  });

  // 7. Practical 13 validation test: returns 400 when title is missing
  test("POST /api/ai/generate-description returns 400 when title is missing", async () => {
    const res = await request(app)
      .post("/api/ai/generate-description")
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty("error");
  });
});

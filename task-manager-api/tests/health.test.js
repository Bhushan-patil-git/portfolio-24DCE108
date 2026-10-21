const request = require("supertest");
const app = require("../server");

describe("Health endpoint", () => {
  test("GET /health returns 200", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

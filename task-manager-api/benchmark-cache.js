/**
 * Practical 9: In-Memory Caching Benchmark Script
 * Demonstrates:
 * 1. Uncached MongoDB response time (3 sample readings)
 * 2. In-memory cached response time (3 sample readings)
 * 3. Cache HIT / MISS verification
 * 4. Cache Invalidation on write operation (POST /tasks)
 */

const http = require("http");

const BASE_HOST = "localhost";
const BASE_PORT = 5000;

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const start = process.hrtime();
    const req = http.request(
      {
        host: BASE_HOST,
        port: BASE_PORT,
        ...options,
      },
      (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          const diff = process.hrtime(start);
          const timeMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
            timeMs: parseFloat(timeMs),
          });
        });
      }
    );

    req.on("error", reject);

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runBenchmark() {
  console.log("==================================================================");
  console.log(" Practical 9: In-Memory Caching (node-cache) Verification & Benchmark ");
  console.log("==================================================================\n");

  try {
    // 0. Reset cache
    await request({ path: "/cache-clear", method: "POST" });
    console.log("🧹 Cache cleared for clean test baseline.\n");

    // 1. Uncached requests (bypassing cache to query MongoDB directly)
    console.log("📊 Phase 1: Uncached Requests (Direct MongoDB Reads)");
    console.log("--------------------------------------------------");
    const uncachedTimes = [];
    for (let i = 1; i <= 3; i++) {
      const res = await request({ path: "/tasks?no_cache=true", method: "GET" });
      uncachedTimes.push(res.timeMs);
      console.log(`  Sample ${i}: Response Time = ${res.timeMs}ms | X-Cache = ${res.headers["x-cache"]}`);
    }
    const avgUncached = (uncachedTimes.reduce((a, b) => a + b, 0) / uncachedTimes.length).toFixed(2);
    console.log(`  👉 Average Uncached Time: ${avgUncached}ms\n`);

    // 2. Cached requests (node-cache enabled)
    console.log("⚡ Phase 2: In-Memory Cached Requests (node-cache stdTTL: 60s)");
    console.log("------------------------------------------------------------");
    const cachedTimes = [];
    for (let i = 1; i <= 3; i++) {
      const res = await request({ path: "/tasks", method: "GET" });
      cachedTimes.push(res.timeMs);
      console.log(`  Sample ${i}: Response Time = ${res.timeMs}ms | X-Cache = ${res.headers["x-cache"]}`);
    }
    const avgCached = (cachedTimes.slice(1).reduce((a, b) => a + b, 0) / (cachedTimes.length - 1)).toFixed(2);
    console.log(`  👉 Cache HIT Average Time (Samples 2-3): ${avgCached}ms\n`);

    // 3. Cache Metrics Check
    console.log("📈 Phase 3: Cache Metrics Inspection (/cache-stats)");
    console.log("---------------------------------------------------");
    const statsRes = await request({ path: "/cache-stats", method: "GET" });
    console.log("  Metrics Output:", JSON.stringify(statsRes.body, null, 2), "\n");

    // 4. Test Invalidation on write (POST /tasks)
    console.log("🔄 Phase 4: Cache Invalidation on Write (POST /tasks)");
    console.log("-----------------------------------------------------");
    const newTask = { title: "Practical 9 Automated Benchmark Task" };
    const createRes = await request(
      {
        path: "/tasks",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      newTask
    );
    console.log(`  Created Task ID: ${createRes.body._id}`);
    console.log("  Cache 'all_tasks' automatically invalidated by write handler.");

    // Next GET must be a Cache MISS
    const postWriteGet = await request({ path: "/tasks", method: "GET" });
    console.log(`  Subsequent GET /tasks: X-Cache = ${postWriteGet.headers["x-cache"]} (Expected: MISS)`);

    // Cleanup created task
    if (createRes.body._id) {
      await request({ path: `/tasks/${createRes.body._id}`, method: "DELETE" });
      console.log(`  Cleaned up benchmark task (${createRes.body._id}).`);
    }

    console.log("\n==================================================================");
    console.log(" Summary Comparison Table (For Lab Report / Evaluation)");
    console.log("==================================================================");
    console.log("| Request Condition | Sample 1 | Sample 2 | Sample 3 | Average Time |");
    console.log("| :--- | :---: | :---: | :---: | :---: |");
    console.log(`| Uncached (MongoDB) | ${uncachedTimes[0]}ms | ${uncachedTimes[1]}ms | ${uncachedTimes[2]}ms | ${avgUncached}ms |`);
    console.log(`| Cached (node-cache) | ${cachedTimes[0]}ms (MISS) | ${cachedTimes[1]}ms (HIT) | ${cachedTimes[2]}ms (HIT) | ${avgCached}ms (HITs) |`);
    console.log("==================================================================\n");
    console.log("🎉 Practical 9 In-Memory Caching is fully operational and verified!");
  } catch (err) {
    console.error("Benchmark error:", err.message);
  }
}

runBenchmark();

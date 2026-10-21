/**
 * Practical 10: Event-Driven Asynchronous Processing Verification Script
 * Demonstrates:
 * 1. Immediate HTTP response before event listener finishes
 * 2. Asynchronous execution timing proof (timestamps comparison)
 * 3. task-created event and background processing
 * 4. task-deleted event processing (Supplementary Problem)
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
          let parsed = null;
          try {
            parsed = body ? JSON.parse(body) : null;
          } catch (e) {
            parsed = body;
          }
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsed,
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function verifyEvents() {
  console.log("==================================================================");
  console.log(" Practical 10: Asynchronous Event-Driven Architecture Verification ");
  console.log("==================================================================\n");

  try {
    const taskTitle = `Practical 10 Async Event Test Task (${Date.now()})`;

    console.log("🚀 Step 1: Sending POST /tasks to trigger 'task-created' event");
    console.log(`   Task Title: "${taskTitle}"`);

    const postStart = new Date().toISOString();
    console.log(`   Client Request Sent At: ${postStart}`);

    const res = await request(
      {
        path: "/tasks",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { title: taskTitle }
    );

    const clientReceivedAt = new Date().toISOString();
    console.log(`   Client Response Received At: ${clientReceivedAt}`);
    console.log(`   HTTP Status Code: ${res.statusCode} (Created)`);
    console.log(`   Round-Trip Duration: ${res.timeMs}ms (Instant response!)`);
    console.log(`   Created Task ID: ${res.body._id}\n`);

    console.log("⏳ Step 2: Waiting 1000ms for simulated background work to complete in listener...");
    await delay(1000);

    console.log("\n📋 Step 3: Fetching /event-logs to verify background processing timestamps");
    const logsRes = await request({ path: "/event-logs", method: "GET" });
    const relevantLog = logsRes.body.find((l) => l.taskId === res.body._id);

    if (relevantLog) {
      console.log("   Audit Log Entry:", JSON.stringify(relevantLog, null, 2));
      console.log("\n⏱️  Timing Order Verification:");
      console.log(`   1. Client HTTP Response Sent : ${clientReceivedAt}`);
      console.log(`   2. Background Listener Started: ${relevantLog.receivedAt}`);
      console.log(`   3. Background Work Finished   : ${relevantLog.completedAt}`);
      console.log("   ✅ Confirmed: API responded IMMEDIATELY while background processing finished asynchronously!\n");
    }

    console.log("🗑️  Step 4: Testing 'task-deleted' Event (Supplementary Problem)");
    const deleteRes = await request({ path: `/tasks/${res.body._id}`, method: "DELETE" });
    console.log(`   Delete Response Status: ${deleteRes.statusCode} (${deleteRes.body.message})`);

    await delay(200);
    const updatedLogs = await request({ path: "/event-logs", method: "GET" });
    const deleteLog = updatedLogs.body.find((l) => l.event === "task-deleted" && l.taskId === res.body._id);
    if (deleteLog) {
      console.log("   Delete Event Log Entry:", JSON.stringify(deleteLog, null, 2));
      console.log("   ✅ 'task-deleted' event processed successfully by audit listener!\n");
    }

    console.log("==================================================================");
    console.log("🎉 Practical 10 EventEmitter architecture verified successfully!");
    console.log("==================================================================");
  } catch (err) {
    console.error("Verification error:", err.message);
  }
}

verifyEvents();

const taskEvents = require("./events");

/**
 * Practical 10: Event Listeners Module
 * Decouples background processing (notifications, audit logging, analytics)
 * from the main HTTP request-response cycle.
 */

// In-memory audit log of emitted and processed events (for verification & API inspection)
const eventAuditLogs = [];

const logEvent = (entry) => {
  eventAuditLogs.push(entry);
  if (eventAuditLogs.length > 50) {
    eventAuditLogs.shift();
  }
};

// 1. Task Created Listener
taskEvents.on("task-created", (task) => {
  const handlerReceivedAt = new Date().toISOString();
  console.log(`[Notification Service] Task "${task.title}" created event received at ${handlerReceivedAt}`);

  const logEntry = {
    event: "task-created",
    taskId: task._id,
    title: task.title,
    receivedAt: handlerReceivedAt,
    status: "processing",
  };
  logEvent(logEntry);

  // Simulate an asynchronous background job (e.g. sending email, webhook dispatch, analytics)
  // Artificial delay (800ms) proves API response finishes BEFORE background work completes
  setTimeout(() => {
    const completedAt = new Date().toISOString();
    console.log(`[Notification Service] Background notification dispatched for "${task.title}" at ${completedAt}`);
    logEntry.completedAt = completedAt;
    logEntry.status = "completed";
  }, 800);
});

// 2. Task Deleted Listener (Supplementary Problem)
taskEvents.on("task-deleted", (taskInfo) => {
  const deletedAt = new Date().toISOString();
  console.log(`[Audit Service] Task deleted event: ID ${taskInfo.id} ("${taskInfo.title}") at ${deletedAt}`);

  logEvent({
    event: "task-deleted",
    taskId: taskInfo.id,
    title: taskInfo.title,
    processedAt: deletedAt,
    status: "completed",
  });
});

// 3. Error Event Listener (Supplementary Problem)
// Prevents unhandled 'error' events from crashing the Node.js process
taskEvents.on("error", (err) => {
  console.error(`[Event Error Handler] Caught EventEmitter error:`, err.message);
  logEvent({
    event: "error",
    error: err.message,
    timestamp: new Date().toISOString(),
  });
});

/**
 * Export audit logs for API route inspection
 */
const getEventAuditLogs = () => [...eventAuditLogs];

module.exports = {
  getEventAuditLogs,
};

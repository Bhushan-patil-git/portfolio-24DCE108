const EventEmitter = require("events");

/**
 * Practical 10: Asynchronous Processing with Event-Driven Architecture
 * TaskEvents extends Node.js native EventEmitter for decoupled, non-blocking background operations.
 */
class TaskEvents extends EventEmitter {}

// Singleton event emitter instance across the backend application
const taskEvents = new TaskEvents();

// Configure max listeners to avoid warnings in high-load scenarios
taskEvents.setMaxListeners(20);

module.exports = taskEvents;

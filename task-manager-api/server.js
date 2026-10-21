require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Task = require("./models/Task");
const User = require("./models/User");
const { authMiddleware, optionalAuth } = require("./middleware/auth");
const { validateTaskInput, validateRegisterInput } = require("./middleware/validate");

// Practical 9: In-Memory Caching (node-cache)
const {
  getCache,
  setCache,
  invalidateTaskCache,
  getMetrics,
  resetMetrics,
} = require("./cache");

// Practical 10: Event-Driven Architecture (EventEmitter)
const taskEvents = require("./events");
const { getEventAuditLogs } = require("./listeners");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskmanager";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretjwtkey_wdf_practical_2026";

// Database Connection
if (process.env.NODE_ENV !== "test") {
  mongoose
    .connect(MONGO_URI)
    .then(() => console.log("MongoDB connected successfully"))
    .catch((error) => console.log("MongoDB connection error:", error));
}

// Core Middlewares
app.use(cors());
app.use(express.json());

// Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Request Logger Middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// ==========================================
// AUTHENTICATION ROUTES (Practical 7)
// ==========================================

// 1. Register User (POST /register)
app.post("/register", validateRegisterInput, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, name: newUser.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 2. Login User (POST /login)
app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

// 3. Current User Profile (GET /me) - Strictly Protected
app.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
});

// ==========================================
// CACHE METRICS & CONTROL (Practical 9)
// ==========================================

app.get("/cache-stats", (req, res) => {
  res.status(200).json(getMetrics());
});

app.post("/cache-reset", (req, res) => {
  resetMetrics();
  res.status(200).json({ message: "Cache statistics reset successfully." });
});

// ==========================================
// EVENT AUDIT LOGS (Practical 10)
// ==========================================

app.get("/event-logs", (req, res) => {
  res.status(200).json(getEventAuditLogs());
});

// ==========================================
// TASK ROUTES (Practical 5/6/7/9/10)
// ==========================================

// GET /tasks - Read all tasks with in-memory caching
app.get("/tasks", optionalAuth, async (req, res, next) => {
  const startTime = Date.now();
  try {
    const bypassCache = req.query.no_cache === "true";
    const cacheKey = req.user ? `tasks_user_${req.user.id}` : "all_tasks";

    // 1. Check cache first (Cache HIT)
    if (!bypassCache) {
      const { data: cachedTasks, hit } = getCache(cacheKey);
      if (hit && cachedTasks) {
        const duration = Date.now() - startTime;
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Response-Time", `${duration}ms`);
        return res.status(200).json(cachedTasks);
      }
    }

    // 2. Cache MISS: Query MongoDB
    const filter = req.user
      ? { $or: [{ user: req.user.id }, { user: { $exists: false } }, { user: null }] }
      : {};
    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    // 3. Store result in cache with 60s TTL
    if (!bypassCache) {
      setCache(cacheKey, tasks, 60);
    }

    const duration = Date.now() - startTime;
    res.setHeader("X-Cache", bypassCache ? "BYPASS" : "MISS");
    res.setHeader("X-Response-Time", `${duration}ms`);
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
});

// GET /tasks/:id - Read single task with single-task caching
app.get("/tasks/:id", optionalAuth, async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID format." });
    }

    const cacheKey = `task_${id}`;
    const bypassCache = req.query.no_cache === "true";

    if (!bypassCache) {
      const { data: cachedTask, hit } = getCache(cacheKey);
      if (hit && cachedTask) {
        const duration = Date.now() - startTime;
        res.setHeader("X-Cache", "HIT");
        res.setHeader("X-Response-Time", `${duration}ms`);
        return res.status(200).json(cachedTask);
      }
    }

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    if (!bypassCache) {
      setCache(cacheKey, task, 60);
    }

    const duration = Date.now() - startTime;
    res.setHeader("X-Cache", bypassCache ? "BYPASS" : "MISS");
    res.setHeader("X-Response-Time", `${duration}ms`);
    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// POST /tasks - Create task with validation, cache invalidation & EventEmitter
app.post("/tasks", optionalAuth, validateTaskInput, async (req, res, next) => {
  try {
    const taskData = {
      title: req.body.title.trim(),
      description: req.body.description ? req.body.description.trim() : "",
      completed: req.body.completed || false,
    };

    if (req.user) {
      taskData.user = req.user.id;
    }

    const task = await Task.create(taskData);

    // Invalidate cache on write
    invalidateTaskCache();

    // Immediate response to client
    const apiResponseSentTimestamp = new Date().toISOString();
    console.log(`[API] Response 201 sent to client at: ${apiResponseSentTimestamp}`);
    res.status(201).json(task);

    // Practical 10: Asynchronously emit background task event without blocking
    setImmediate(() => {
      taskEvents.emit("task-created", {
        task,
        triggeredBy: req.user ? req.user.email : "Anonymous / Guest",
        apiResponseTime: apiResponseSentTimestamp,
      });
    });
  } catch (error) {
    next(error);
  }
});

// PUT /tasks/:id - Update task with validation and cache invalidation
app.put("/tasks/:id", optionalAuth, validateTaskInput, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID format." });
    }

    const task = await Task.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Invalidate both collection and single task cache
    invalidateTaskCache(id);

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
});

// DELETE /tasks/:id - Delete task, invalidate cache & emit event
app.delete("/tasks/:id", optionalAuth, async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid task ID format." });
    }

    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      return res.status(404).json({ error: "Task not found." });
    }

    // Invalidate cache on delete
    invalidateTaskCache(id);

    res.status(200).json({ message: "Task deleted successfully.", id });

    // Practical 10: Emit task-deleted event asynchronously
    setImmediate(() => {
      taskEvents.emit("task-deleted", {
        taskId: id,
        taskTitle: task.title,
        deletedBy: req.user ? req.user.email : "Anonymous / Guest",
      });
    });
  } catch (error) {
    next(error);
  }
});

// 404 Handler for Undefined Endpoints
app.use((req, res) => {
  res.status(404).json({
    error: `Cannot ${req.method} ${req.originalUrl} - Endpoint not found.`,
  });
});

// Global Centralized Error Handler
app.use((err, req, res, next) => {
  console.error("[Global Error Handler]", err.stack || err.message);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val) => val.message);
    return res.status(400).json({
      error: "Mongoose Validation Error",
      details: messages,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: `Invalid resource identifier: ${err.value}`,
    });
  }

  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

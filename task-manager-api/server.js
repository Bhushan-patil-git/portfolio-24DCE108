const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

const tasks = [];
let nextId = 1;

app.get("/tasks", (req, res) => {
  res.json(tasks);
});

app.post("/tasks", (req, res, next) => {
  try {
    const { title, description } = req.body;
    if (!title) {
      return res.status(400).json({ error: "Task title is required" });
    }

    const newTask = {
      id: nextId++,
      title,
      description: description || "",
      completed: false,
    };

    tasks.push(newTask);
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

app.put("/tasks/:id", (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const task = tasks.find((t) => t.id === taskId);

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    const { title, description, completed } = req.body;
    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;

    res.json(task);
  } catch (err) {
    next(err);
  }
});

app.delete("/tasks/:id", (req, res, next) => {
  try {
    const taskId = Number(req.params.id);
    const taskIndex = tasks.findIndex((t) => t.id === taskId);

    if (taskIndex === -1) {
      return res.status(404).json({ error: "Task not found" });
    }

    tasks.splice(taskIndex, 1);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

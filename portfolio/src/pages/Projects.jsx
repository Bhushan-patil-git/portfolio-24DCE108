import { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask, generateTaskDescription } from "../api";
import LoadingSpinner from "../components/LoadingSpinner";

function Projects() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiDisclaimer, setAiDisclaimer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState("");

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification("");
    }, 3500);
  };

  // 1. Fetch Tasks from Backend
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      setError(err.message || "Failed to load tasks from server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. Practical 13: Auto-generate description via AI API
  const handleGenerateAiDescription = async () => {
    if (!newTaskTitle.trim()) {
      alert("Please enter a task title first so the AI can generate a relevant description.");
      return;
    }

    try {
      setGeneratingAi(true);
      setAiDisclaimer("");
      const result = await generateTaskDescription(newTaskTitle.trim());

      if (result.description) {
        setNewTaskDescription(result.description);
        setAiDisclaimer(result.disclaimer || "AI-generated suggestion. Please review and edit before saving.");
        showNotification(result.fallback ? "Contextual description generated via graceful fallback!" : "AI description generated successfully!");
      }
    } catch (err) {
      // Graceful frontend error handling
      setNewTaskDescription(`Complete: ${newTaskTitle.trim()} with required steps.`);
      setAiDisclaimer("Fallback suggestion applied due to network error.");
      showNotification("Could not reach AI service, applied fallback suggestion.");
    } finally {
      setGeneratingAi(false);
    }
  };

  // 3. Create Task (POST /tasks)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      setSubmitting(true);
      const created = await createTask({
        title: newTaskTitle.trim(),
        description: newTaskDescription.trim(),
        completed: false,
      });
      setTasks((prev) => [created, ...prev]);
      setNewTaskTitle("");
      setNewTaskDescription("");
      setAiDisclaimer("");
      showNotification("Task created successfully!");
    } catch (err) {
      alert("Error creating task: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 4. Toggle Complete (PUT /tasks/:id)
  const handleToggleTask = async (task) => {
    try {
      const updated = await updateTask(task._id, { completed: !task.completed });
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? updated : t))
      );
      showNotification(`Task marked as ${updated.completed ? "Done" : "Pending"}!`);
    } catch (err) {
      alert("Error updating task: " + err.message);
    }
  };

  // 5. Delete Task (DELETE /tasks/:id)
  const handleDeleteTask = async (id) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showNotification("Task deleted successfully!");
    } catch (err) {
      alert("Error deleting task: " + err.message);
    }
  };

  return (
    <div className="projects-page-container">
      <section className="tasks-section">
        <div className="tasks-header">
          <h2>Full Stack Task Manager</h2>
          <p className="tasks-subtitle">Connected to Node.js / Express &amp; MongoDB with AI Enhancement</p>
        </div>

        {notification && <div className="toast-notification">{notification}</div>}

        {/* Task Creation Form with Practical 13 AI Feature */}
        <form onSubmit={handleCreateTask} className="task-form">
          <div className="task-form-inputs">
            <div className="input-with-button">
              <input
                type="text"
                placeholder="Enter a task title (e.g. Implement Dockerfile for Frontend)..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                disabled={submitting || generatingAi}
                className="task-input"
              />
              <button
                type="button"
                onClick={handleGenerateAiDescription}
                disabled={generatingAi || !newTaskTitle.trim()}
                className="btn-ai"
                title="Use AI to generate a detailed description"
              >
                {generatingAi ? "✨ Generating..." : "✨ AI Generate"}
              </button>
            </div>

            <textarea
              placeholder="Task description (type manually or click 'AI Generate' above)..."
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              disabled={submitting}
              className="task-desc-input"
              rows={2}
            />

            {aiDisclaimer && (
              <div className="ai-disclaimer-box">
                <span className="ai-badge">🤖 AI Suggestion</span>
                <span className="ai-disclaimer-text">{aiDisclaimer}</span>
              </div>
            )}
          </div>

          <button type="submit" disabled={submitting || !newTaskTitle.trim()} className="btn-primary">
            {submitting ? "Adding..." : "+ Add Task"}
          </button>
        </form>

        {/* Status views */}
        {loading && <LoadingSpinner />}

        {error && (
          <div className="error-message">
            <p><strong>Connection Error:</strong> {error}</p>
            <button onClick={fetchTasks} className="btn-retry">Retry</button>
          </div>
        )}

        {/* Task List */}
        {!loading && !error && (
          <div className="task-list">
            {tasks.length === 0 ? (
              <p className="empty-state">No tasks found. Add your first task above!</p>
            ) : (
              tasks.map((task) => (
                <div key={task._id} className={`task-card ${task.completed ? "task-completed" : ""}`}>
                  <div className="task-info">
                    <input
                      type="checkbox"
                      checked={task.completed || false}
                      onChange={() => handleToggleTask(task)}
                      className="task-checkbox"
                    />
                    <div className="task-text-group">
                      <span className="task-title">{task.title}</span>
                      {task.description && (
                        <p className="task-description-text">{task.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="task-actions">
                    <span className={`status-badge ${task.completed ? "badge-done" : "badge-pending"}`}>
                      {task.completed ? "Done" : "Pending"}
                    </span>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="btn-delete"
                      title="Delete task"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>
    </div>
  );
}

export default Projects;
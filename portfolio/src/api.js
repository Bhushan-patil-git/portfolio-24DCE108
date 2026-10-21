const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Token Helpers
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem("wdf_auth_token", token);
  } else {
    localStorage.removeItem("wdf_auth_token");
  }
};

export const getAuthToken = () => {
  return localStorage.getItem("wdf_auth_token");
};

export const setAuthUser = (user) => {
  if (user) {
    localStorage.setItem("wdf_auth_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("wdf_auth_user");
  }
};

export const getAuthUser = () => {
  const user = localStorage.getItem("wdf_auth_user");
  return user ? JSON.parse(user) : null;
};

// Request wrapper that attaches Authorization Bearer token automatically
const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token expired or invalid
    setAuthToken(null);
    setAuthUser(null);
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
};

// ==========================================
// AUTH API METHODS (Practical 7)
// ==========================================

export const register = async (name, email, password) => {
  const data = await authFetch("/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  if (data.token) {
    setAuthToken(data.token);
    setAuthUser(data.user);
  }
  return data;
};

export const login = async (email, password) => {
  const data = await authFetch("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data.token) {
    setAuthToken(data.token);
    setAuthUser(data.user);
  }
  return data;
};

export const getMe = async () => {
  return authFetch("/me");
};

export const logout = () => {
  setAuthToken(null);
  setAuthUser(null);
};

// ==========================================
// TASK API METHODS (Protected)
// ==========================================

export const getTasks = async () => {
  return authFetch("/tasks");
};

export const createTask = async (taskData) => {
  return authFetch("/tasks", {
    method: "POST",
    body: JSON.stringify(taskData),
  });
};

export const updateTask = async (id, updates) => {
  return authFetch(`/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
};

export const deleteTask = async (id) => {
  return authFetch(`/tasks/${id}`, {
    method: "DELETE",
  });
};

// ==========================================
// AI TASK ENHANCEMENT API (Practical 13)
// ==========================================

export const generateTaskDescription = async (title) => {
  return authFetch("/api/ai/generate-description", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
};

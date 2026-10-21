const validateTaskInput = (req, res, next) => {
  const { title } = req.body;

  if (req.method === "POST" && (!title || typeof title !== "string" || title.trim().length === 0)) {
    return res.status(400).json({
      error: "Validation failed: 'title' is required and cannot be empty.",
    });
  }

  if (req.method === "PUT") {
    if (title !== undefined && (typeof title !== "string" || title.trim().length === 0)) {
      return res.status(400).json({
        error: "Validation failed: 'title' must be a non-empty string.",
      });
    }

    if (req.body.completed !== undefined && typeof req.body.completed !== "boolean") {
      return res.status(400).json({
        error: "Validation failed: 'completed' must be a boolean (true or false).",
      });
    }
  }

  next();
};

const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length === 0) {
    return res.status(400).json({ error: "Validation failed: 'name' is required." });
  }

  if (!email || !/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).json({ error: "Validation failed: A valid 'email' is required." });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ error: "Validation failed: 'password' must be at least 6 characters." });
  }

  next();
};

module.exports = {
  validateTaskInput,
  validateRegisterInput,
};

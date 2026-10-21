const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Access denied. No authorization token provided.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        error: "Access denied. Malformed token format.",
      });
    }

    const secret = process.env.JWT_SECRET || "supersecretjwtkey_wdf_practical_2026";
    const decoded = jwt.verify(token, secret);

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        error: "Authentication token expired. Please login again.",
        expired: true,
      });
    }

    return res.status(401).json({
      error: "Invalid authentication token.",
    });
  }
};

// Optional auth helper for frontend compatibility
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const secret = process.env.JWT_SECRET || "supersecretjwtkey_wdf_practical_2026";
      const decoded = jwt.verify(token, secret);
      req.user = decoded;
    }
  } catch (err) {
    // Ignore invalid token for public fallback
  }
  next();
};

module.exports = { authMiddleware, optionalAuth };

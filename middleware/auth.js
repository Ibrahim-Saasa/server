import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided",
        error: true,
        success: false,
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // ✅ Changed from req.user to req.userId (to match your controller)

    next();
  } catch (error) {
    console.log("Auth Error:", error.message);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired",
        error: true,
        success: false,
      });
    }

    return res.status(401).json({
      message: "Invalid token",
      error: true,
      success: false,
    });
  }
};

export default auth;

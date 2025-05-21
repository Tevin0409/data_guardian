import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function protect(allowedRoles = []) {
  return (req, res, next) => {
    const token =
      req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized: No token" });
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET);
      req.user = decoded;

      if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
        return res.status(403).json({ message: "Forbidden: Invalid role" });
      }

      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }
  };
}

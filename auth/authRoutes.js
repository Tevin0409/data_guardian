import express from "express";
import { register, login, me, logout, createUser } from "./authController.js";
import { protect } from "./authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect(), me);
router.post("/logout", logout);

// Example protected route
router.get("/admin-only", protect(["super_admin"]), (req, res) =>
  res.send("Welcome Admin!")
);
router.post("/create-user", protect(["super_admin"]), createUser);

export default router;

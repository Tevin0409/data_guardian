import express from "express";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "./projectController.js";
import { protect } from "../auth/authMiddleware.js";

const router = express.Router();

// Public read access (authenticated)
router.get("/", protect(), getProjects);

// Restricted to data_steward
router.post("/", protect(["data_steward"]), createProject);
router.put("/:id", protect(["data_steward"]), updateProject);
router.delete("/:id", protect(["data_steward"]), deleteProject);

export default router;

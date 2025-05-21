import express from "express";
import {
  createDepartment,
  getDepartments,
  updateDepartment,
  deleteDepartment,
} from "./departmentController.js";
import { protect } from "../auth/authMiddleware.js";

const router = express.Router();

// Only DPO can create, update, delete
router.post("/", protect(["dpo", "super_admin"]), createDepartment);
router.put("/:id", protect(["dpo", "super_admin"]), updateDepartment);
router.delete("/:id", protect(["dpo", "super_admin"]), deleteDepartment);

// All authenticated users can view
router.get("/", protect(), getDepartments);

export default router;

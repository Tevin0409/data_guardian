import express from "express";
import {
  createProcess,
  getProcesses,
  updateProcess,
  deleteProcess,
} from "./processController.js";
import { protect } from "../auth/authMiddleware.js";

const router = express.Router();

router.get("/", protect(), getProcesses);
router.post("/", protect(["data_steward"]), createProcess);
router.put("/:id", protect(["data_steward"]), updateProcess);
router.delete("/:id", protect(["data_steward"]), deleteProcess);

export default router;

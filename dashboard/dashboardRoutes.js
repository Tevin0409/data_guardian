import express from "express";

import { protect } from "../auth/authMiddleware.js";
import { getDashboardSummary } from "./dashboardController.js";

const router = express.Router();

// All authenticated users can view
router.get("/summary", protect(), getDashboardSummary);

export default router;

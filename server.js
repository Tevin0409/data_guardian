import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./auth/authRoutes.js";
import departmentRoutes from "./departments/departmentRoutes.js";
import projectRoutes from "./projects/projectRoutes.js";
import processRoutes from "./processes/processRoutes.js";
import dashboardRoutes from "./dashboard/dashboardRoutes.js";

import { verifyDbConnection } from "./db/index.js";

dotenv.config();
const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/processes", processRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 3003;

verifyDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

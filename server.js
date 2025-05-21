import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();

import authRoutes from "./auth/authRoutes.js";
import departmentRoutes from "./departments/departmentRoutes.js";
import projectRoutes from "./projects/projectRoutes.js";
import processRoutes from "./processes/processRoutes.js";
import { verifyDbConnection } from "./db/index.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/processes", processRoutes);

const PORT = process.env.PORT || 5000;

verifyDbConnection().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

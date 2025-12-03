// src/routes/dashboardRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { 
  getStatsCharts, 
  getDashboard, 
  getResumenGeneral 
} from "../controllers/dashboardController.js";

const router = express.Router();

// === VISTAS ===
router.get("/dashboard", protect, getDashboard);

// === API ===
router.get("/api/dashboard/stats", protect, getStatsCharts);
router.get("/api/dashboard/resumen", protect, getResumenGeneral);

export default router;

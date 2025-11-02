// src/routes/dashboardRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js"; // tu middleware JWT
import pool from "../config/db.js";

const router = express.Router();

// DASHBOARD → solo usuarios logueados
router.get("/dashboard", protect, (req, res) => {
  res.render("dashboard", { alert: req.session.alert || null });
});

// LISTA DE PERSONAS → solo usuarios logueados
router.get("/personas", protect, async (req, res) => {
  const [personas] = await pool.query("SELECT * FROM personas");
  res.render("personas", { personas });
});

export default router;

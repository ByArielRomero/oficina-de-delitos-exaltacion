// src/routes/dashboardRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import pool from "../config/db.js";
import { getStatsCharts } from "../controllers/dashboardController.js";

const router = express.Router();


router.get("/api/dashboard/stats", getStatsCharts);

router.get("/dashboard", protect, async (req, res) => {
  try {
    // Total de casos
    const [totalCasos] = await pool.query("SELECT COUNT(*) AS total FROM casos");

    // Total de personas
    const [totalPersonas] = await pool.query("SELECT COUNT(*) AS total FROM personas");

    // Total de zonas
    const [totalZonas] = await pool.query("SELECT COUNT(*) AS total FROM zona");

    // Casos del mes actual
    const [casosMes] = await pool.query(`
      SELECT COUNT(*) AS total 
      FROM casos 
      WHERE MONTH(fecha_creada) = MONTH(CURRENT_DATE())
      AND YEAR(fecha_creada) = YEAR(CURRENT_DATE())
    `);

    res.render("dashboard", {
      alert: req.session.alert || null,
      stats: {
        totalCasos: totalCasos[0].total,
        totalPersonas: totalPersonas[0].total,
        totalZonas: totalZonas[0].total,
        casosMes: casosMes[0].total,
      },
    });
  } catch (error) {
    console.error("Error al cargar el dashboard:", error);
    res.status(500).send("Error al obtener los datos del dashboard");
  }
});


// ENDPOINT API para el resumen general
router.get("/api/dashboard/resumen", protect, async (req, res) => {
  try {
    const [[totalCasos]] = await pool.query("SELECT COUNT(*) AS total FROM casos");
    const [[totalPersonas]] = await pool.query("SELECT COUNT(*) AS total FROM personas");
    const [[totalZonas]] = await pool.query("SELECT COUNT(*) AS total FROM zona");

    // Casos del mes actual
    const [[casosEsteMes]] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM casos
      WHERE MONTH(fecha_creada) = MONTH(CURRENT_DATE())
        AND YEAR(fecha_creada) = YEAR(CURRENT_DATE())
    `);

    res.json({
      success: true,
      data: {
        totalCasos: totalCasos.total,
        totalPersonas: totalPersonas.total,
        totalZonas: totalZonas.total,
        casosEsteMes: casosEsteMes.total,
      },
    });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    res.json({ success: false, message: "Error al obtener los datos" });
  }
});


export default router;

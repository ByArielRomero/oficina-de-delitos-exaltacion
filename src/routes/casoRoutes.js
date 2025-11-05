import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getData,
  addDelito,
  createCasoController,
  mostrarFormularioCaso
} from "../controllers/casoController.js";

const router = express.Router();

// GET /agregar-caso - Renderiza EJS
router.get("/agregar-casos", protect, mostrarFormularioCaso);

// API
router.get("/api/casos/data", protect, getData);
router.post("/api/casos/delito", protect, addDelito);
router.post("/api/casos", protect, createCasoController);

// Lista casos (placeholder; ajusta si tienes vista EJS)
router.get("/lista-casos", protect, (req, res) => {
  res.render("lista-casos", { alert: req.session?.alert || null });  // Asume lista-casos.ejs
});

export default router;
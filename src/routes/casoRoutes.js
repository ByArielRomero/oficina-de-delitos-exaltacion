import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  mostrarFormularioCaso,
  mostrarListaCasos,
  getData,
  addDelito,
  createCasoController,
  obtenerCaso,
  actualizarCaso,
} from "../controllers/casoController.js";

const router = express.Router();

router.get("/agregar-caso", protect, mostrarFormularioCaso);
router.get("/lista-casos", protect, mostrarListaCasos);

router.get("/api/casos/data", protect, getData);
router.get("/api/casos/:id", protect, obtenerCaso);
router.put("/api/casos/:id", protect, actualizarCaso);
router.post("/api/casos/delito", protect, addDelito);
router.post("/api/casos", protect, createCasoController);

export default router;
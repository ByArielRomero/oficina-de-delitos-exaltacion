import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();
import {
  mostrarFormularioCaso,
  mostrarListaCasos,
  getData,
  addDelito,
  createCasoController,
  obtenerCaso,
  actualizarCaso,
  eliminarCaso,
} from "../controllers/casoController.js";



router.get("/agregar-caso", protect, mostrarFormularioCaso);
router.get("/lista-casos", protect, mostrarListaCasos);

router.get("/api/casos/data", protect, getData);
router.get("/api/casos/:id", protect, obtenerCaso);
router.put("/api/casos/:id", protect, actualizarCaso);
router.post("/api/casos/delito", protect, addDelito);
router.post("/api/casos", protect, createCasoController);
router.delete('/api/casos/:id', protect, eliminarCaso);

export default router;
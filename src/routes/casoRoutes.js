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
  getDelitosList,
  updateDelito,
  deleteDelito,
  listarCasosEliminados,
  restaurarCaso,
  mostrarMenuEliminados,
  listarPersonasEliminadas,
  listarZonasEliminadas,
  listarDelitosEliminados,
  restaurarDelito
} from "../controllers/casoController.js";

// === VISTAS ===
router.get("/agregar-caso", protect, mostrarFormularioCaso);     // → /agregar-caso
router.get("/lista-casos", protect, mostrarListaCasos);         // → /lista-casos
router.get("/casos-eliminados", protect, listarCasosEliminados); // → /casos-eliminados (Admin)

// === VISTAS ELIMINADOS ===
router.get("/eliminados", protect, mostrarMenuEliminados);       // → /eliminados
router.get("/personas-eliminadas", protect, listarPersonasEliminadas); // → /personas-eliminadas
router.get("/zonas-eliminadas", protect, listarZonasEliminadas);       // → /zonas-eliminadas
router.get("/delitos-eliminados", protect, listarDelitosEliminados);   // → /delitos-eliminados

// === API ===
router.get("/api/casos/data", protect, getData);                // → /api/casos/data
router.get("/api/casos/delitos", protect, getDelitosList);      // → /api/casos/delitos
router.post("/api/casos/delito", protect, addDelito);           // → /api/casos/delito
router.put("/api/casos/delito/:id", protect, updateDelito);     // → /api/casos/delito/1
router.delete("/api/casos/delito/:id", protect, deleteDelito);  // → /api/casos/delito/1
router.put("/api/casos/delito/:id/restore", protect, restaurarDelito); // → /api/casos/delito/1/restore
router.post("/api/casos", protect, createCasoController);       // → /api/casos
router.get("/api/casos/:id", protect, obtenerCaso);             // → /api/casos/1
router.put("/api/casos/:id", protect, actualizarCaso);          // → /api/casos/1
router.delete("/api/casos/:id", protect, eliminarCaso);         // → /api/casos/1
router.put("/api/casos/:id/restore", protect, restaurarCaso);   // → /api/casos/1/restore

export default router;
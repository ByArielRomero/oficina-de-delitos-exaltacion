import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { listarCasos, obtenerCaso, actualizarCaso } from "../controllers/personaController.js";
import pool from "../config/db.js";
import {
  getData,
  addDelito,
  createCasoController,
  mostrarFormularioCaso,
} from "../controllers/casoController.js";

const router = express.Router();
// Renderizar formulario
router.get("/agregar-caso", protect, mostrarFormularioCaso);

// API para datos de selects
router.get("/api/casos/data", protect, getData);

// Obtener un caso por ID
router.get("/api/casos/:id", protect, obtenerCaso);

// Actualizar caso
router.put("/api/casos/:id", protect, actualizarCaso);


// Agregar delito desde modal
router.post("/api/casos/delito", protect, addDelito);

// Crear caso
router.post("/api/casos", protect, createCasoController);



export default router;
// src/routes/personaRoutes.js
import express from "express";

const router = express.Router();

import { 
  mostrarFormularioPersona , 
  crearPersona, 
  listarPersonas, 
  borrarPersona, 
  actualizarPersona 
} from "../controllers/personaController.js";
import { protect } from '../middlewares/authMiddleware.js';


// RUTA CORRECTA: usa el controlador + protect
router.get("/agregar-persona", protect, mostrarFormularioPersona);
router.post("/agregar-persona", protect, crearPersona);

// APIs para el modal
router.get("/personas", protect, listarPersonas);


router.put("/personas/:id", protect, actualizarPersona);
router.delete("/borrarPersona/:id", protect, borrarPersona);

export default router;

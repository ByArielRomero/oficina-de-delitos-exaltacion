// src/routes/personaRoutes.js
import express from "express";
import { mostrarFormularioPersona, crearPersona } from "../controllers/personaController.js";

const router = express.Router();

router.get("/agregar-persona", mostrarFormularioPersona);
router.post("/agregar-persona", crearPersona);

export default router;

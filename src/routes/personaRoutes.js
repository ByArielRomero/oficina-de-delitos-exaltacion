// src/routes/personaRoutes.js
import express from "express";
import { mostrarFormularioPersona, crearPersona, listarPersonas, borrarPersona, actualizarPersona } from "../controllers/personaController.js";
const router = express.Router();

router.get("/agregar-persona", mostrarFormularioPersona);
router.post("/agregar-persona", crearPersona);

router.get("/personas", listarPersonas);  // GET /personas?search=texto (lista con búsqueda)
router.delete("/personas/:id", borrarPersona);  // DELETE /personas/:id (borrar)
router.put("/personas/:id", actualizarPersona);  // PUT /personas/:id (editar)

export default router;

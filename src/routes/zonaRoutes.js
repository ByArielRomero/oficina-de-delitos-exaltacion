import express from "express";
import { listarZonas, agregarZona, editarZona, borrarZona, restaurarZona } from "../controllers/zonaController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Listar todas las zonas (si lo necesitás)
/*router.get("/", listarZonas);*/
router.get("/", protect, listarZonas);

// Agregar una nueva zona (llamado por el modal con fetch)
router.post("/agregar", protect, agregarZona);

router.put("/:id", protect, editarZona);  // PUT /zonas/:id (editar)
router.delete("/:id", protect, borrarZona);  // DELETE /zonas/:id (borrar)
router.put("/:id/restore", protect, restaurarZona); // PUT /zonas/:id/restore

export default router;

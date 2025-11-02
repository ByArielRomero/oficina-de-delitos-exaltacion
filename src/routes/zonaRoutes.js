import express from "express";
import { listarZonas, agregarZona } from "../controllers/zonaController.js";

const router = express.Router();

// Listar todas las zonas (si lo necesitás)
router.get("/", listarZonas);

// Agregar una nueva zona (llamado por el modal con fetch)
router.post("/agregar", agregarZona);

export default router;

import express from "express";
import { listarZonas, agregarZona, editarZona, borrarZona} from "../controllers/zonaController.js";

const router = express.Router();

// Listar todas las zonas (si lo necesitás)
/*router.get("/", listarZonas);*/
router.get("/", listarZonas);

// Agregar una nueva zona (llamado por el modal con fetch)
router.post("/agregar", agregarZona);

router.put("/:id", editarZona);  // PUT /zonas/:id (editar)
router.delete("/:id", borrarZona);  // DELETE /zonas/:id (borrar)

export default router;

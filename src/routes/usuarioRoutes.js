import express from "express";
import { isAdmin } from "../middlewares/isAdmin.js";
import usuarioController from "../controllers/usuarioController.js";
import { protect } from "../middlewares/authMiddleware.js";


const router = express.Router();

// TODO EN /register
router.get("/register", protect, usuarioController.listar);
router.post("/register/crear", protect, isAdmin, usuarioController.crear);
router.post("/register/editar/:id", protect, isAdmin, usuarioController.editar);
router.post("/register/eliminar/:id", protect, isAdmin, usuarioController.eliminar);
router.get("/listar", protect, isAdmin, usuarioController.listar);

export default router;
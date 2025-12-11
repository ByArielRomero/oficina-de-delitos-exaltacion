import express from "express";
import authController from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// === VISTAS PÚBLICAS ===
router.get("/login", authController.mostrarLogin);
router.get("/admin", authController.mostrarLoginAdmin);

// === VISTAS PRIVADAS ===
router.get("/register", protect, authController.mostrarFormularioRegistro);

// === ACCIONES ===
router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/logout", protect, authController.logout);

export default router;

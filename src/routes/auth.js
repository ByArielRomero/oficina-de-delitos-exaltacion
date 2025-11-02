import express from "express";
import authController from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";
import {
  mostrarFormularioPersona,
  crearPersona,
  listarCasos,
} from "../controllers/personaController.js";

const router = express.Router();

// LOGIN → público
router.get("/login", (req, res) => {
  const { alert } = req.query;
  res.render("login", { alert: alert || null });
});

// REGISTER → privada
router.get("/register", protect, (req, res) => {
  res.render("register", { alert: null });
});

// POST routes
router.post("/login", authController.login);
router.post("/register", authController.register);

// DASHBOARD → privada
router.get("/dashboard", protect, (req, res) => {
  const alert = req.session?.alert || null;
  req.session.alert = null;
  res.render("dashboard", { alert });
});

// FORMULARIO PERSONA → privado
router.get("/agregar-persona", protect, mostrarFormularioPersona);
router.post("/agregar-persona", protect, crearPersona);

// LISTA DE CASOS → privado
router.get("/lista-casos", protect, listarCasos);

// LOGOUT → privado
router.post("/logout", protect, (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log("Error al destruir sesión:", err);
      return res.status(500).send("No se pudo cerrar sesión");
    }
    res.clearCookie("jwt", { path: "/", httpOnly: true, sameSite: "lax", secure: false });
    res.clearCookie("connect.sid", { path: "/", httpOnly: true, sameSite: "lax" });
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).send("Sesión cerrada correctamente");
  });
});



export default router;

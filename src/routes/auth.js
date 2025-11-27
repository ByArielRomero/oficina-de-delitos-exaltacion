import express from "express";
import pool from "../config/db.js";
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
// REGISTER → privada (para todos los usuarios logueados)
router.get("/register", protect, async (req, res) => {
  // Solo si es admin, cargamos la lista de usuarios
  if (req.user && Number(req.user.rol || req.user.id_rol) === 1) {
    try {
      const [usuarios] = await pool.query(
        "SELECT id_usuario, nombre_usuario, id_rol FROM usuario ORDER BY id_usuario"
      );
      return res.render("register", {
        currentUser: req.user,
        usuarios,
        alert: req.query.alert || null
      });
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
      return res.render("register", {
        currentUser: req.user,
        usuarios: [],
        alert: "error"
      });
    }
  }

  // Si NO es admin (operador o cualquier otro), renderizamos sin usuarios
  res.render("register", {
    currentUser: req.user,
    usuarios: [],           // ← Esto evita el error "usuarios is not defined"
    alert: req.query.alert || null
  });
});

// POST routes
router.post("/login", authController.login);
router.post("/register", authController.register);

// DASHBOARD → privada
/*router.get("/dashboard", protect, (req, res) => {
  const alert = req.session?.alert || null;
  req.session.alert = null;
  res.redirect(`/dashboard-stats?alert=${alert || ""}`);
});
*/


// DASHBOARD → privada
router.get("/dashboard", protect, async (req, res) => {
  const alert = req.session?.alert || null;
  req.session.alert = null;

  try {
    // Total de casos
    const [totalCasos] = await pool.query("SELECT COUNT(*) AS total FROM casos");
    // Total de personas
    const [totalPersonas] = await pool.query("SELECT COUNT(*) AS total FROM persona");
    // Total de zonas
    const [totalZonas] = await pool.query("SELECT COUNT(*) AS total FROM zona");
    // Casos del mes actual
    const [casosMes] = await pool.query(`
      SELECT COUNT(*) AS total 
      FROM casos 
      WHERE MONTH(fecha_creada) = MONTH(CURRENT_DATE())
        AND YEAR(fecha_creada) = YEAR(CURRENT_DATE())
    `);

    // Renderizamos directamente con los stats
    res.render("dashboard", {
      alert,
      stats: {
        totalCasos: totalCasos[0].total,
        totalPersonas: totalPersonas[0].total,
        totalZonas: totalZonas[0].total,
        casosMes: casosMes[0].total,
      },
       currentUser: req.user || null
    });
  } catch (error) {
    console.error("Error al cargar el dashboard:", error);
    res.status(500).send("Error al obtener los datos del dashboard");
  }
});



// FORMULARIO PERSONA → privado
router.get("/agregar-persona", protect, mostrarFormularioPersona);
router.post("/agregar-persona", protect, crearPersona);

// LISTA DE CASOS → privado
router.get("/lista-casos", protect, listarCasos);

// LOGOUT → privado
router.post("/logout", protect, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log("Error al destruir sesión:", err);
      return res.status(500).send("No se pudo cerrar sesión");
    }
    res.clearCookie("jwt", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate"
    );
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.status(200).send("Sesión cerrada correctamente");
  });
});




export default router;

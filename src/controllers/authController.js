import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";

const authController = {
  // REGISTRO
  register: async (req, res) => {
    try {
      const { name, password, rol } = req.body;

      if (!name || !password || !rol) {
        return res.render("register", { alert: "empty" });
      }

      const passwordHash = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_ROUNDS || 10)
      );

      await pool.query(
        "INSERT INTO usuario (nombre_usuario, password, id_rol) VALUES (?, ?, ?)",
        [name, passwordHash, rol]
      );

      return res.render("register", { alert: "success" });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return res.render("register", { alert: "error" });
    }
  },

  // LOGIN
  login: async (req, res) => {
    try {
      const { name, password } = req.body;

      if (!name || !password) {
        return res.redirect("/login?alert=empty");
      }

      const [rows] = await pool.query(
        "SELECT * FROM usuario WHERE nombre_usuario = ?",
        [name]
      );

      if (rows.length === 0) {
        return res.redirect("/login?alert=notfound");
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.redirect("/login?alert=invalid");
      }

      // ✅ Login exitoso

      // login exitoso
      const token = jwt.sign(
        { id: user.id_usuario, name: user.nombre_usuario },
        process.env.JWT_SECRET,
        { expiresIn: "1m" } // 1 minuto solo para pruebas
      );

      res.cookie("jwt", token, {
        httpOnly: true,
        secure: false, // true si usás HTTPS
        sameSite: "lax",
        path: "/", // 👈 importante: para que sea global y se pueda borrar igual
        maxAge: 60 * 1000, // 1 minuto para pruebas
      });

      req.session.alert = "success"; // mensaje de inicio de sesión
      return res.redirect("/dashboard")

    } catch (error) {
      console.error("Error en login:", error);
      return res.redirect("/login?alert=error");
    }
  },
};

authController.mostrarDashboard = (req, res) => {
  const alert = req.session?.alert || null; // tomamos la alerta de la sesión
  req.session.alert = null; // limpiamos para la próxima visita
  res.render("dashboard", { alert });
};

export default authController;

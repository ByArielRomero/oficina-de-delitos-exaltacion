import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as UsuarioModel from "../models/UsuarioModel.js";

const authController = {
  // === VISTAS ===
  
  /**
   * Renderiza la vista de login público.
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
  mostrarLogin: (req, res) => {
    const { alert } = req.query;
    res.render("login", { alert: alert || null, isAdmin: false });
  },

  /**
   * Renderiza la vista de login de administrador.
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
  mostrarLoginAdmin: (req, res) => {
    const { alert } = req.query;
    res.render("login", { alert: alert || null, isAdmin: true });
  },

  /**
   * Renderiza el formulario de registro (solo admin ve lista de usuarios).
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
  mostrarFormularioRegistro: async (req, res) => {
    // Solo si es admin, cargamos la lista de usuarios
    if (req.user && Number(req.user.rol || req.user.id_rol) === 1) {
      try {
        const usuarios = await UsuarioModel.getAllUsers();
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
      usuarios: [],
      alert: req.query.alert || null
    });
  },

  // === LOGIC ===

  /**
   * Registra un nuevo usuario.
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
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

      await UsuarioModel.createUser({
        nombre_usuario: name,
        password: passwordHash,
        id_rol: rol
      });

      return res.render("register", {
        alert: "success",
        currentUser: req.user || null,
      });
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return res.render("register", {
        alert: "error",
        currentUser: req.user || null,
      });
    }
  },

  /**
   * Inicia sesión.
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
  login: async (req, res) => {
    try {
      const { name, password } = req.body;

      if (!name || !password) {
        return res.redirect("/login?alert=empty");
      }

      const user = await UsuarioModel.getUserByUsername(name);

      if (!user) {
        return res.redirect("/login?alert=credentials");
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return res.redirect("/login?alert=credentials");
      }

      // Validar origen del login
      const { login_source } = req.body;
      const isAdmin = user.id_rol === 1;

      // Si intenta entrar por /admin (login_source='admin') y NO es admin -> Error
      if (login_source === 'admin' && !isAdmin) {
        return res.redirect("/admin?alert=credentials");
      }

      // Si intenta entrar por /login (login_source='operator') y ES admin -> Error
      if (login_source === 'operator' && isAdmin) {
        return res.redirect("/login?alert=credentials");
      }

      // ✅ Login exitoso
      const token = jwt.sign(
        {
          id: user.id_usuario,
          name: user.nombre_usuario,
          nombre: user.nombre_completo || user.nombre_usuario,
          rol: user.id_rol,
        },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: false, // true si usás HTTPS
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60 * 1000,
      });

      req.session.alert = "success"; // mensaje de inicio de sesión
      return res.redirect("/dashboard");
    } catch (error) {
      console.error("Error en login:", error);
      return res.redirect("/login?alert=error");
    }
  },

  /**
   * Cierra sesión.
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log("Error al destruir sesión:", err);
        return res.status(500).send("No se pudo cerrar sesión");
      }
      res.clearCookie("jwt", { path: "/" });
      res.clearCookie("connect.sid", { path: "/" });
      res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");
      res.status(200).send("Sesión cerrada correctamente");
    });
  }
};

authController.mostrarDashboard = (req, res) => {
  const alert = req.session?.alert || null;
  req.session.alert = null;
  res.render("dashboard", { alert });
};

export default authController;

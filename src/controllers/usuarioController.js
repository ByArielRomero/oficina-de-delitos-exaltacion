import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const usuarioController = {
listar: async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id_usuario, nombre_usuario, id_rol FROM usuario ORDER BY id_usuario"
    );

    res.render("register", {
      currentUser: res.locals.currentUser,  // ← AQUÍ EL FIX
      usuarios: rows,
      alert: req.query.alert
    });

  } catch (err) {
    console.error(err);
    res.render("register", {
      currentUser: res.locals.currentUser,  // ← AQUÍ TAMBIÉN
      usuarios: [],
      alert: "error"
    });
  }
},
  crear: async (req, res) => {
    const { name, password, rol } = req.body;

    if (!name || !password || !rol) {
      return res.redirect("/register?alert=empty");
    }

    try {
      // Verificar si el usuario ya existe
      const [existe] = await pool.query(
        "SELECT id_usuario FROM usuario WHERE nombre_usuario = ?",
        [name.trim()]
      );

      if (existe.length > 0) {
        return res.redirect("/register?alert=userexists");
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO usuario (nombre_usuario, password, id_rol) VALUES (?, ?, ?)",
        [name.trim(), passwordHash, rol]
      );

      res.redirect("/register?alert=success");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res.redirect("/register?alert=error");
    }
  },

  editar: async (req, res) => {
  const { id } = req.params;
  const { name, password, rol } = req.body;

  try {
    if (!password || password.trim() === '') {
      // NO cambiar contraseña
      await pool.query(
        "UPDATE usuario SET nombre_usuario = ?, id_rol = ? WHERE id_usuario = ?",
        [name, rol, id]
      );
      return res.redirect("/register?alert=edited_no_pass");
    }

    // Cambiar contraseña
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE usuario SET nombre_usuario = ?, id_rol = ?, password = ? WHERE id_usuario = ?",
      [name, rol, hash, id]
    );

    return res.redirect("/register?alert=edited");
  } catch (error) {
    return res.redirect("/register?alert=error");
  }
},


  eliminar: async (req, res) => {
  const { id } = req.params;

  if (Number(id) === Number(res.locals.currentUser.id_usuario)) {
    return res.redirect("/register?alert=selfdelete");
  }

  try {
    await pool.query("DELETE FROM usuario WHERE id_usuario = ?", [id]);
    res.redirect("/register?alert=deleted");
  } catch (error) { 
    res.redirect("/register?alert=error"); 
  }
}

};

export default usuarioController;
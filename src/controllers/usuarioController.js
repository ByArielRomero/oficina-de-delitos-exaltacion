import * as UsuarioModel from "../models/UsuarioModel.js";
import bcrypt from "bcryptjs";

const usuarioController = {
  /**
   * Lista todos los usuarios.
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
  listar: async (req, res) => {
    try {
      const rows = await UsuarioModel.getAllUsers();

      res.render("register", {
        currentUser: res.locals.currentUser,
        usuarios: rows,
        alert: req.query.alert
      });

    } catch (err) {
      console.error(err);
      res.render("register", {
        currentUser: res.locals.currentUser,
        usuarios: [],
        alert: "error"
      });
    }
  },

  /**
   * Crea un nuevo usuario.
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
  crear: async (req, res) => {
    const { name, password, rol } = req.body;

    if (!name || !password || !rol) {
      return res.redirect("/register?alert=empty");
    }

    try {
      // Verificar si el usuario ya existe
      const existe = await UsuarioModel.getUserByUsername(name.trim());

      if (existe) {
        return res.redirect("/register?alert=userexists");
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      await UsuarioModel.createUser({
        nombre_usuario: name.trim(),
        password: passwordHash,
        id_rol: rol
      });

      res.redirect("/register?alert=success");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      res.redirect("/register?alert=error");
    }
  },

  /**
   * Edita un usuario existente.
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
  editar: async (req, res) => {
    const { id } = req.params;
    const { name, password, rol } = req.body;

    try {
      let updateData = {
        nombre_usuario: name,
        id_rol: rol
      };

      if (password && password.trim() !== '') {
        const hash = await bcrypt.hash(password, 10);
        updateData.password = hash;
      }

      await UsuarioModel.updateUser(id, updateData);

      if (!password || password.trim() === '') {
        return res.redirect("/register?alert=edited_no_pass");
      }
      return res.redirect("/register?alert=edited");
    } catch (error) {
      console.error("Error al editar usuario:", error);
      return res.redirect("/register?alert=error");
    }
  },

  /**
   * Elimina un usuario.
   * @param {Object} req - Request.
   * @param {Object} res - Response.
   */
  eliminar: async (req, res) => {
    const { id } = req.params;

    if (Number(id) === Number(res.locals.currentUser.id_usuario)) {
      return res.redirect("/register?alert=selfdelete");
    }

    try {
      await UsuarioModel.deleteUser(id);
      res.redirect("/register?alert=deleted");
    } catch (error) { 
      console.error("Error al eliminar usuario:", error);
      res.redirect("/register?alert=error"); 
    }
  }
};

export default usuarioController;
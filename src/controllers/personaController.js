// src/controllers/personaController.js
import { agregarPersona } from "../models/personaModel.js";
import pool from "../config/db.js"; // solo para obtener zonas

export const mostrarFormularioPersona = async (req, res) => {
  try {
    const [zonas] = await pool.query("SELECT * FROM zona");
    res.render("agregar-persona", { zonas });
  } catch (error) {
    console.error("Error al obtener zonas:", error);
    res.status(500).send("Error al cargar el formulario");
  }
};

export const crearPersona = async (req, res) => {
  try {
    const { nombre, apellido, dni, telefono, direccion, zona, email } = req.body;
    console.log("Datos recibidos:", req.body);

    const idPersona = await agregarPersona({
      nombre,
      apellido,
      dni,
      telefono,
      direccion,
      zona_id: Number(zona),
      email,
    });

    res.json({ success: true, message: "Persona agregada correctamente" });
  } catch (error) {
    console.error("Error completo:", error); // <-- Esto muestra el mensaje exacto
    res.status(500).json({ success: false, message: error.message }); // <-- Muestra el error en front también
  }

};

export const listarCasos = async (req, res) => {
  try {
    const [casos] = await pool.query("SELECT * FROM casos");
    res.render("lista-casos", { casos });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al listar casos");
  }
};
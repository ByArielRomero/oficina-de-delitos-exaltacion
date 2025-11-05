import pool from "../config/db.js";
import {
  getPersonas,
  getDelitos,
  getUsuarios,
  getZonas,
  createDelito,
  createCaso,
} from "../models/casoModel.js";

// API: obtener datos para selects
export const getData = async (req, res) => {
  try {
    const [personas, delitos, usuarios, zonas] = await Promise.all([
      getPersonas(),
      getDelitos(),
      getUsuarios(),
      getZonas(),
    ]);
    res.json({ success: true, data: { personas, delitos, usuarios, zonas } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al cargar datos" });
  }
};

// API: agregar delito desde modal
export const addDelito = async (req, res) => {
  try {
    const { tipo_delito } = req.body;
    if (!tipo_delito || tipo_delito.trim().length < 3) {
      return res
        .status(400)
        .json({ success: false, message: "Tipo de delito inválido" });
    }
    const nuevoDelito = await createDelito(tipo_delito.trim());
    res.status(201).json({ success: true, data: nuevoDelito });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error al agregar delito" });
  }
};

// API: crear caso
// API: crear caso
export const createCasoController = async (req, res) => {
  try {
    const {
      observacion,
      id_persona,
      id_usuario,
      id_delito,
      id_zona,
      fecha_creacion,
      fecha_actualizacion,
    } = req.body;

    if (!id_persona || !id_delito || !id_zona) {
      return res.status(400).json({
        success: false,
        message: "Persona, delito y zona son requeridos",
      });
    }

    const usuarioLogueado = req.user?.id_usuario || id_usuario;

    // Crear caso en DB
    const ahora = new Date(); // fecha/hora actual de Argentina
    const nuevoCaso = await createCaso({
      observacion,
      id_persona: Number(id_persona),
      id_usuario: usuarioLogueado,
      id_delito: Number(id_delito),
      id_zona: Number(id_zona),
      fecha_creada: ahora,
      fecha_actualizado: ahora, // igual que creación al inicio
    });

    res.status(201).json({ success: true, data: nuevoCaso });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al crear el caso" });
  }
};

// Render EJS con selects ya llenos desde DB
export const mostrarFormularioCaso = async (req, res) => {
  try {
    const [personas] = await pool.query(
      "SELECT id_persona, CONCAT(nombre,' ',apellido) AS nombre_completo FROM persona"
    );
    const [delitos] = await pool.query(
      "SELECT id_delito, tipo_delito FROM delito"
    );
    const [zonas] = await pool.query("SELECT id_zona, nombre_zona FROM zona");
    const [usuarios] = await pool.query(
      "SELECT id_usuario, nombre_usuario FROM usuario"
    );

    res.render("agregar-casos", {
      alert: req.session?.alert || null,
      personas,
      delitos,
      zonas,
      usuarios,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar formulario de casos");
  }
};

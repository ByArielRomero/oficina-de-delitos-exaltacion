import {
  getPersonas,
  getDelitos,
  createDelito,
  getUsuarios,
  getZonas,
  createCaso
} from "../models/casoModel.js";

export const getData = async (req, res) => {
  try {
    const [personas, delitos, usuarios, zonas] = await Promise.all([
      getPersonas(),
      getDelitos(),
      getUsuarios(),
      getZonas()
    ]);
    res.json({
      success: true,
      data: { personas, delitos, usuarios, zonas }
    });
  } catch (error) {
    console.error("Error cargando datos para casos:", error);
    res.status(500).json({ success: false, message: "Error al cargar datos" });
  }
};

export const addDelito = async (req, res) => {
  try {
    const { tipo_delito } = req.body;
    if (!tipo_delito || tipo_delito.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Tipo de delito inválido (mín. 3 chars)" });
    }
    const nuevoDelito = await createDelito(tipo_delito.trim());
    res.status(201).json({ success: true, data: nuevoDelito });
  } catch (error) {
    console.error("Error agregando delito:", error);
    res.status(500).json({ success: false, message: "Error al agregar tipo de delito" });
  }
};

export const createCasoController = async (req, res) => {
  try {
    const { observacion, id_persona, id_usuario, id_delito, fecha_creacion, fecha_actualizacion } = req.body;
    if (!id_persona || !id_delito) {
      return res.status(400).json({ success: false, message: "Persona y tipo de delito son requeridos" });
    }

    const validarFecha = (fechaStr) => {
      if (!fechaStr) return null;
      const date = new Date(fechaStr);
      return isNaN(date.getTime()) ? null : date;  // NULL si inválida
    };

    const usuarioLogueado = req.user?.id_usuario || id_usuario;
    const nuevoCaso = await createCaso({
      observacion,
      id_zona: 1,  // Default fijo
      id_persona: Number(id_persona),
      id_usuario: usuarioLogueado,
      id_delito: Number(id_delito),
      fecha_creado: fecha_creacion,
      fecha_actualizado: fecha_actualizacion
    });
    res.status(201).json({ success: true, data: nuevoCaso, message: "Caso creado exitosamente" });
  } catch (error) {
    console.error("Error creando caso:", error);
    res.status(500).json({ success: false, message: error.message || "Error al crear el caso" });
  }
};

// ← CAMBIO: Render EJS en lugar de sendFile
export const mostrarFormularioCaso = async (req, res) => {
  res.render("agregar-casos", { alert: req.session?.alert || null });  // Nombre exacto: agregar-casos.ejs
};
import pool from "../config/db.js";
import {
  getPersonas,
  getDelitos,
  getUsuarios,
  getZonas,
  createDelito,
  createCaso,
  getCasos,
  getCasoById,
} from "../models/casoModel.js";

// === Render: Lista de casos ===
export const mostrarListaCasos = async (req, res) => {
  try {
    const casos = await getCasos(); // ← OBTIENE DATOS FRESCOS

    // DESACTIVAR CACHÉ
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.render("lista-casos", { 
      casos,
      _cacheBuster: Date.now() // ← FUERZA RECARGA
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al cargar la lista de casos");
  }
};

// === API: Obtener caso por ID (con delitos y zonas) ===
export const obtenerCaso = async (req, res) => {
  try {
    const { id } = req.params;
    const caso = await getCasoById(id);
    if (!caso) {
      return res.status(404).json({ success: false, message: "Caso no encontrado" });
    }

    const [delitos] = await pool.query("SELECT id_delito, tipo_delito FROM delito ORDER BY tipo_delito");
    const [zonas] = await pool.query("SELECT id_zona, nombre_zona FROM zona ORDER BY nombre_zona");

    // Aseguramos que tipo_caso y zona vengan completos
    res.json({ 
      success: true, 
      caso: {
        ...caso,
        tipo_caso: caso.tipo_delito,     // ← alias correcto
        zona: caso.nombre_zona,          // ← alias correcto
        estado: caso.estado || 'Pendiente'
      }, 
      delitos, 
      zonas 
    });
  } catch (error) {
    console.error("Error en obtenerCaso:", error);
    res.status(500).json({ success: false, message: "Error al obtener caso" });
  }
};

// === API: Actualizar caso (incluye estado) ===
export const actualizarCaso = async (req, res) => {
  const id = Number(req.params.id); // ← Asegura número
  const {
    nombre,
    apellido,
    dni,
    telefono,
    tipo_caso: id_delito,
    zona: id_zona,
    estado: estado,
    observaciones: observacion,
  } = req.body;

  console.log("Actualizando caso ID:", id);
  console.log("Datos recibidos:", { nombre, apellido, dni, telefono, id_delito, id_zona, estado, observacion });

  try {
    // === VALIDACIÓN ===
    if (!nombre || !apellido || !dni || !id_delito || !id_zona || !estado) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos" });
    }

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    // === 1. ACTUALIZAR PERSONA ===
    const [personaResult] = await pool.query(
      `UPDATE persona p
       JOIN casos c ON p.id_persona = c.id_persona
       SET p.nombre = ?, p.apellido = ?, p.dni = ?, p.telefono = ?
       WHERE c.id_casos = ?`,
      [nombre.trim(), apellido.trim(), dni.trim(), telefono?.trim() || null, id]
    );

    console.log("Persona afectada:", personaResult.affectedRows);

    if (personaResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Caso o persona no encontrado" });
    }

    // === 2. ACTUALIZAR CASO ===
    const [casoResult] = await pool.query(
      `UPDATE casos 
       SET id_delito = ?, id_zona = ?, estado = ?, observacion = ?, fecha_actualizado = NOW()
       WHERE id_casos = ?`,
      [Number(id_delito), Number(id_zona), estado.trim(), observacion?.trim() || null, id]
    );

    console.log("Caso afectado:", casoResult.affectedRows);

    if (casoResult.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Caso no encontrado" });
    }

    res.json({ success: true, message: "Caso actualizado correctamente" });
  } catch (error) {
    console.error("ERROR COMPLETO EN actualizarCaso:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
      sql: error.sql,
    });
  }
};

// === Resto (getData, createCaso, etc.) ===
export const getData = async (req, res) => {
  try {
    const [personas, delitos, usuarios, zonas] = await Promise.all([
      getPersonas(), getDelitos(), getUsuarios(), getZonas()
    ]);
    res.json({ success: true, data: { personas, delitos, usuarios, zonas } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al cargar datos" });
  }
};

export const addDelito = async (req, res) => {
  try {
    const { tipo_delito } = req.body;
    if (!tipo_delito || tipo_delito.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Tipo de delito inválido" });
    }
    const nuevo = await createDelito(tipo_delito.trim());
    res.status(201).json({ success: true, data: nuevo });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al agregar delito" });
  }
};

export const createCasoController = async (req, res) => {
  try {
    const { observacion, id_persona, id_usuario, id_delito, id_zona, estado = 'Pendiente' } = req.body;
    if (!id_persona || !id_delito || !id_zona) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos" });
    }
    const usuarioLogueado = req.user?.id_usuario || id_usuario;
    const ahora = new Date();
    const nuevoCaso = await createCaso({
      observacion, id_persona: Number(id_persona), id_usuario: usuarioLogueado,
      id_delito: Number(id_delito), id_zona: Number(id_zona),
      fecha_creada: ahora, fecha_actualizado: ahora, estado
    });
    res.status(201).json({ success: true, data: nuevoCaso });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error al crear caso" });
  }
};

export const mostrarFormularioCaso = async (req, res) => {
  try {
    const [personas] = await pool.query("SELECT id_persona, CONCAT(nombre,' ',apellido) AS nombre_completo FROM persona ORDER BY apellido");
    const [delitos] = await pool.query("SELECT id_delito, tipo_delito FROM delito ORDER BY tipo_delito");
    const [zonas] = await pool.query("SELECT id_zona, nombre_zona FROM zona ORDER BY nombre_zona");
    const [usuarios] = await pool.query("SELECT id_usuario, nombre_usuario FROM usuario ORDER BY nombre_usuario");
    res.render("agregar-casos", { alert: req.session?.alert || null, personas, delitos, zonas, usuarios ,currentUser: req.user || null});
  } catch (error) {
    res.status(500).send("Error al cargar formulario");
  }
};

// === Nueva función: Listar casos (con usuario actual) ===
export const listarCasos = async (req, res) => {
  try {
    const [casos] = await pool.query(/* tu consulta */);

    // DEBUG: ver en server si req.user existe
    console.log('listarCasos - req.user =', req.user);

    res.render("lista-casos", {
      casos,
      currentUser: req.user || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al listar casos");
  }
};

// ← NUEVO: Eliminar caso (solo admin)
export const eliminarCaso = async (req, res) => {
  const { id } = req.params;

  // DIAGNÓSTICO
  console.log("=== INTENTO DE ELIMINAR CASO ===");
  console.log("ID del caso:", id);
  console.log("req.user:", req.user);
  console.log("req.user.rol (crudo):", req.user?.rol);
  console.log("Tipo de rol:", typeof req.user?.rol);
  console.log("=====================================");

  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    const rol = Number(req.user.rol || 0);
    console.log("ROL CONVERTIDO A NÚMERO:", rol);

    if (rol !== 1) {
      return res.status(403).json({ 
        success: false, 
        message: "Acceso denegado: solo admin",
        debug: { 
          rol_original: req.user.rol,
          rol_convertido: rol,
          tipo: typeof req.user.rol
        }
      });
    }

    const [caso] = await pool.query("SELECT 1 FROM casos WHERE id_casos = ?", [id]);
    if (!caso.length) {
      return res.status(404).json({ success: false, message: "Caso no encontrado" });
    }

    await pool.query("DELETE FROM casos WHERE id_casos = ?", [id]);
    console.log("CASO ELIMINADO CORRECTAMENTE:", id);
    res.json({ success: true, message: "Caso eliminado correctamente" });
  } catch (error) {
    console.error("ERROR EN ELIMINAR CASO:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};
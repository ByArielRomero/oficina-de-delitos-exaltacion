import * as CasoModel from "../models/casoModel.js";
import * as PersonaModel from "../models/personaModel.js";
import * as DelitoModel from "../models/DelitoModel.js";
import * as ZonaModel from "../models/zonaModel.js";
import * as UsuarioModel from "../models/UsuarioModel.js";

// === Render: Lista de casos ===
export const mostrarListaCasos = async (req, res) => {
  try {
    const casos = await CasoModel.getCasos();

    // DESACTIVAR CACHÉ
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    res.render("lista-casos", { 
      casos,
      currentUser: req.user || null,
      _cacheBuster: Date.now()
    });
  } catch (error) {
    console.error("Error al cargar lista de casos:", error);
    res.status(500).send("Error al cargar la lista de casos");
  }
};

// === API: Obtener caso por ID (con delitos y zonas) ===
export const obtenerCaso = async (req, res) => {
  try {
    const { id } = req.params;
    const caso = await CasoModel.getCasoById(id);
    if (!caso) {
      return res.status(404).json({ success: false, message: "Caso no encontrado" });
    }

    const [delitos, zonas] = await Promise.all([
      DelitoModel.getDelitos(),
      ZonaModel.getZonas()
    ]);

    res.json({ 
      success: true, 
      caso: {
        ...caso,
        tipo_caso: caso.tipo_delito,
        zona: caso.nombre_zona,
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
  const id = Number(req.params.id);
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

  try {
    // === VALIDACIÓN ===
    if (!nombre || !apellido || !dni || !id_delito || !id_zona || !estado) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos" });
    }

    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID inválido" });
    }

    // 1. Obtener el caso para saber el ID de la persona
    const casoActual = await CasoModel.getCasoById(id);
    if (!casoActual) {
      return res.status(404).json({ success: false, message: "Caso no encontrado" });
    }

    // 2. Actualizar Persona
    const personaActualizada = await PersonaModel.updatePersona(casoActual.id_persona, {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      telefono: telefono?.trim() || null
    });

    if (!personaActualizada) {
       // Si no se actualizó (ej. ID no existe), aunque es raro si el caso existe.
       console.warn("No se pudo actualizar la persona asociada al caso", id);
    }

    // 3. Actualizar Caso
    const casoActualizado = await CasoModel.updateCaso(id, {
      id_delito: Number(id_delito),
      id_zona: Number(id_zona),
      estado: estado.trim(),
      observacion: observacion?.trim() || null
    });

    if (!casoActualizado) {
      return res.status(500).json({ success: false, message: "No se pudo actualizar el caso" });
    }

    res.json({ success: true, message: "Caso actualizado correctamente" });
  } catch (error) {
    console.error("ERROR EN actualizarCaso:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// === API: Obtener datos para formularios (Personas, Delitos, Usuarios, Zonas) ===
export const getData = async (req, res) => {
  try {
    const [personas, delitos, usuarios, zonas] = await Promise.all([
      PersonaModel.getPersonas(),
      DelitoModel.getDelitos(),
      UsuarioModel.getUsuarios(),
      ZonaModel.getZonas()
    ]);
    res.json({ success: true, data: { personas, delitos, usuarios, zonas } });
  } catch (error) {
    console.error("Error en getData:", error);
    res.status(500).json({ success: false, message: "Error al cargar datos" });
  }
};

// === API: Agregar Delito ===
export const addDelito = async (req, res) => {
  try {
    const { tipo_delito } = req.body;
    if (!tipo_delito || tipo_delito.trim().length < 3) {
      return res.status(400).json({ success: false, message: "Tipo de delito inválido (min 3 caracteres)" });
    }

    const existing = await DelitoModel.getDelitoByNombre(tipo_delito.trim());
    if (existing) {
      return res.status(400).json({ success: false, message: "Ya existe un tipo de caso con ese nombre." });
    }

    const nuevo = await DelitoModel.createDelito(tipo_delito.trim());
    res.status(201).json({ success: true, data: nuevo });
  } catch (error) {
    console.error("Error en addDelito:", error);
    res.status(500).json({ success: false, message: "Error al agregar delito" });
  }
};

// === API: Crear Caso ===
export const createCasoController = async (req, res) => {
  try {
    const { observacion, id_persona, id_usuario, id_delito, id_zona, estado = 'Pendiente', fecha_creacion } = req.body;
    
    if (!id_persona || !id_delito || !id_zona) {
      return res.status(400).json({ success: false, message: "Faltan campos requeridos" });
    }

    const usuarioLogueado = req.user?.id_usuario || id_usuario;
    const ahora = new Date();
    
    const nuevoCaso = await CasoModel.createCaso({
      observacion, 
      id_persona: Number(id_persona), 
      id_usuario: usuarioLogueado,
      id_delito: Number(id_delito), 
      id_zona: Number(id_zona),
      fecha_creada: fecha_creacion || ahora, 
      fecha_actualizado: ahora, 
      estado
    });

    res.status(201).json({ success: true, data: nuevoCaso });
  } catch (error) {
    console.error("Error en createCasoController:", error);
    res.status(500).json({ success: false, message: "Error al crear caso" });
  }
};

// === Render: Formulario Agregar Caso ===
export const mostrarFormularioCaso = async (req, res) => {
  try {
    const [personas, delitos, zonas, usuarios] = await Promise.all([
      PersonaModel.getPersonas(),
      DelitoModel.getDelitos(),
      ZonaModel.getZonas(),
      UsuarioModel.getUsuarios()
    ]);

    res.render("agregar-casos", { 
      alert: req.session?.alert || null, 
      personas, 
      delitos, 
      zonas, 
      usuarios, 
      currentUser: req.user || null
    });
  } catch (error) {
    console.error("Error en mostrarFormularioCaso:", error);
    res.status(500).send("Error al cargar formulario");
  }
};

// === API: Eliminar Caso (Solo Admin) ===
export const eliminarCaso = async (req, res) => {
  const { id } = req.params;

  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }

    const rol = Number(req.user.rol || 0);

    if (rol !== 1) {
      return res.status(403).json({ success: false, message: "Acceso denegado: solo admin" });
    }

    const exists = await CasoModel.existsCaso(id);
    if (!exists) {
      return res.status(404).json({ success: false, message: "Caso no encontrado" });
    }

    await CasoModel.deleteCaso(id);
    res.json({ success: true, message: "Caso eliminado correctamente" });
  } catch (error) {
    console.error("ERROR EN ELIMINAR CASO:", error);
    res.status(500).json({ success: false, message: "Error del servidor" });
  }
};

// === API: Listar Delitos ===
export const getDelitosList = async (req, res) => {
  try {
    const delitos = await DelitoModel.getDelitos();
    res.json({ delitos });
  } catch (error) {
    console.error("Error en getDelitosList:", error);
    res.status(500).json({ success: false, message: "Error al cargar delitos" });
  }
};

// === API: Actualizar Delito ===
export const updateDelito = async (req, res) => {
  const { id } = req.params;
  const { tipo_delito } = req.body;

  if (!tipo_delito || tipo_delito.trim().length < 2) {
    return res.status(400).json({ success: false, message: "Nombre inválido" });
  }

  try {
    // Verificar si ya existe OTRO con ese nombre
    const existing = await DelitoModel.getDelitoByNombre(tipo_delito.trim());
    if (existing && existing.id_delito != id) {
      return res.status(400).json({ success: false, message: "Ya existe un tipo de caso con ese nombre." });
    }

    await DelitoModel.updateDelito(id, tipo_delito.trim());
    res.json({ success: true, message: "Delito actualizado" });
  } catch (error) {
    console.error("Error en updateDelito:", error);
    res.status(500).json({ success: false, message: "Error al actualizar" });
  }
};

// === API: Eliminar Delito ===
export const deleteDelito = async (req, res) => {
  const { id } = req.params;
  try {
    const inUse = await DelitoModel.isDelitoInUse(id);
    if (inUse) {
      return res.status(400).json({ success: false, message: "Hay casos asociados a este delito, no se puede eliminar." });
    }

    await DelitoModel.deleteDelito(id);
    res.json({ success: true, message: "Delito eliminado" });
  } catch (error) {
    console.error("Error en deleteDelito:", error);
    res.status(500).json({ success: false, message: "Error al borrar" });
  }
};
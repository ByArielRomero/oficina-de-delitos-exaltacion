import * as PersonaModel from "../models/personaModel.js";
import * as ZonaModel from "../models/zonaModel.js";

/**
 * Muestra el formulario para agregar persona.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 */
export const mostrarFormularioPersona = async (req, res) => {
  try {
    const zonas = await ZonaModel.getZonas();
    const personasRows = await PersonaModel.getPersonas();

    res.render("agregar-persona", {
      zonas,
      currentUser: res.locals.currentUser,
      personas: personasRows // Pasamos personas si la vista lo requiere (parece que sí para el modal)
    });
  } catch (error) {
    console.error("Error al obtener zonas/personas:", error);
    res.status(500).send("Error al cargar el formulario");
  }
};

/**
 * Crea una nueva persona.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 */
export const crearPersona = async (req, res) => {
  try {
    const { nombre, apellido, dni, telefono, calle, altura, sinNumero, zona, email, genero } = req.body;

    // Construir dirección
    let direccionFinal = "";
    if (sinNumero === "on" || sinNumero === true) {
      direccionFinal = `${calle} s/n`;
    } else {
      direccionFinal = `${calle} ${altura}`;
    }

    // Validar DNI: 7, 8 o 9 dígitos
    if (!/^\d{7,9}$/.test(dni)) {
      return res.status(400).json({ success: false, message: "DNI: utilizar 7, 8 o 9 dígitos" });
    }
    if (!/^\d{8,15}$/.test(telefono)) {
      return res.status(400).json({ success: false, message: "telefono: utilizar 8 a 15 digitos" });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Email inválido" });
    }

    // Verificar DNI único
    const existing = await PersonaModel.getPersonaByDni(dni);
    if (existing) {
      return res.status(400).json({ success: false, message: "Ya existe una persona con ese DNI" });
    }

    await PersonaModel.agregarPersona({
      nombre,
      apellido,
      dni,
      telefono,
      direccion: direccionFinal,
      calle,
      numero_o_sn: (sinNumero === "on" || sinNumero === true) ? "S/N" : altura,
      zona_id: Number(zona),
      email,
      genero,
    });

    res.json({ success: true, message: "Persona agregada correctamente" });
  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lista personas, opcionalmente filtrando por búsqueda.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 */
export const listarPersonas = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const personas = await PersonaModel.getPersonas(search);
    res.json({ success: true, personas });
  } catch (error) {
    console.error("Error en eliminarPersona:", error);
    res.status(500).json({ success: false, message: "Error al eliminar persona" });
  }
};

// === API: Restaurar Persona (Solo Admin) ===
export const restaurarPersona = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user || Number(req.user.rol) !== 1) {
      return res.status(403).json({ success: false, message: "Acceso denegado" });
    }
    await PersonaModel.restorePersona(id);
    res.json({ success: true, message: "Persona restaurada" });
  } catch (error) {
    console.error("Error en restaurarPersona:", error);
    res.status(500).json({ success: false, message: "Error al restaurar" });
  }
};

/**
 * Borra una persona.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 */
export const borrarPersona = async (req, res) => {
  const { id } = req.params;
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }
    const id_rol = Number(req.user.id_rol || req.user.idRol || req.user.rol || req.user.role || 0);
    if (id_rol !== 1) {
      return res.status(403).json({ success: false, message: "Acceso denegado: solo admin puede borrar" });
    }

    const existing = await PersonaModel.getPersonaById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Persona no encontrada" });
    }

    await PersonaModel.deletePersona(id);
    res.json({ success: true, message: "Persona borrada correctamente" });
  } catch (error) {
    console.error("Error al borrar persona:", error);
    // Soft delete should not trigger FK errors unless there is a specific constraint preventing update of deleted_at
    /*
    if (error.sqlState === '23000' || error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 1451) {
      return res.status(400).json({
        success: false,
        message: "No se puede borrar, tiene un caso asignado"
      });
    }
    */
    res.status(500).json({ success: false, message: "Error al borrar la persona." });
  }
};

/**
 * Actualiza una persona existente.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 */
export const actualizarPersona = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, telefono, calle, altura, sinNumero, zona, email, genero } = req.body;
  try {
    if (!/^\d{7,9}$/.test(dni)) {
      return res.status(400).json({ success: false, message: "DNI: utilizar 7, 8 o 9 dígitos" });
    }
    if (!/^\d{8,15}$/.test(telefono)) {
      return res.status(400).json({ success: false, message: "telefono: utilizar 8 a 15 digitos" });
    }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Email inválido" });
    }

    // Verificar DNI único (excluyendo la persona actual)
    const existingDni = await PersonaModel.getPersonaByDni(dni);
    if (existingDni && existingDni.id_persona != id) {
      return res.status(400).json({ success: false, message: "Ya existe otra persona con ese DNI" });
    }

    // Construir dirección
    let direccionFinal = "";
    if (sinNumero === "on" || sinNumero === true) {
      direccionFinal = `${calle} s/n`;
    } else {
      direccionFinal = `${calle} ${altura}`;
    }

    await PersonaModel.updatePersona(id, {
      nombre,
      apellido,
      dni,
      telefono,
      direccion: direccionFinal,
      calle,
      numero_o_sn: (sinNumero === "on" || sinNumero === true) ? "S/N" : altura,
      zona_id: Number(zona),
      email,
      genero
    });

    res.json({ success: true, message: "Persona actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar persona:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
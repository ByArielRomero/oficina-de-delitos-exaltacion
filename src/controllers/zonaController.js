import * as ZonaModel from "../models/zonaModel.js";

/**
 * Lista todas las zonas, opcionalmente filtrando por nombre.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 */
export const listarZonas = async (req, res) => {
  try {
    const { search = '' } = req.query;
    // La búsqueda por nombre no está implementada en el modelo básico,
    // pero podemos filtrar en memoria o agregar método al modelo.
    // Por simplicidad y dado que son pocas zonas, filtramos en memoria si hay search.
    
    let zonas = await ZonaModel.getZonas();
    
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      zonas = zonas.filter(z => z.nombre_zona.toLowerCase().includes(term));
    }

    res.json({ success: true, zonas });
  } catch (error) {
    console.error("Error al listar zonas:", error);
    res.status(500).json({ success: false, message: "Error al obtener zonas" });
  }
};

/**
 * Agrega una nueva zona.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 */
export const agregarZona = async (req, res) => {
  try {
    const { nombreZona } = req.body;
    if (!nombreZona || nombreZona.trim() === "") {
      return res.status(400).json({ success: false, message: "El nombre de la zona es obligatorio." });
    }

    const existing = await ZonaModel.getZonaByName(nombreZona.trim());
    if (existing) {
      return res.status(400).json({ success: false, message: "Ya existe una zona con ese nombre." });
    }

    const id = await ZonaModel.createZona(nombreZona.trim());
    
    res.json({
      success: true,
      message: "Zona agregada correctamente.",
      id: id,
      nombreZona: nombreZona.trim()
    });
  } catch (error) {
    console.error("Error al agregar zona:", error);
    res.status(500).json({ success: false, message: "Error al guardar la zona." });
  }
};

/**
 * Edita una zona existente.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 */
export const editarZona = async (req, res) => {
  const { id } = req.params;
  const { nombreZona } = req.body;
  try {
    if (!nombreZona || nombreZona.trim() === "") {
      return res.status(400).json({ success: false, message: "El nombre de la zona es obligatorio." });
    }

    const existing = await ZonaModel.getZonaById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Zona no encontrada" });
    }

    const duplicate = await ZonaModel.getZonaByName(nombreZona.trim());
    if (duplicate && duplicate.id_zona != id) {
      return res.status(400).json({ success: false, message: "Ya existe una zona con ese nombre." });
    }

    await ZonaModel.updateZona(id, nombreZona.trim());
    res.json({ success: true, message: "Zona actualizada correctamente" });
  } catch (error) {
    console.error("Error al editar zona:", error);
    res.status(500).json({ success: false, message: "Error al actualizar la zona." });
  }
};

/**
 * Borra una zona.
 * @param {Object} req - Request.
 * @param {Object} res - Response.
 */
export const borrarZona = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await ZonaModel.getZonaById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: "Zona no encontrada" });
    }
    
    await ZonaModel.deleteZona(id);
    res.json({ success: true, message: "Zona borrada correctamente" });
  } catch (error) {
    console.error("Error al borrar zona:", error);
    res.status(500).json({ success: false, message: "Error al borrar zona, esta asignada a un Caso" });
  }
};
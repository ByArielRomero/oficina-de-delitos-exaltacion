import pool from "../config/db.js";

// 🔹 Controlador para listar todas las zonas (por si necesitás renderizar en EJS)
export const listarZonas = async (req, res) => {
  try {
    const { search = '' } = req.query; // ← NUEVO: Soporte para búsqueda opcional
    let query = "SELECT * FROM zona WHERE 1=1";
    let params = [];
    if (search.trim()) {
      query += " AND nombre_zona LIKE ?";
      params = [`%${search.trim()}%`];
    }
    query += " ORDER BY nombre_zona ASC";
    const [zonas] = await pool.query(query, params);
    res.json({ success: true, zonas });  // ← CAMBIO: Envío { success, zonas } para consistencia con frontend
  } catch (error) {
    console.error("Error al listar zonas:", error);
    res.status(500).json({ success: false, message: "Error al obtener zonas" });
  }
};

// 🔹 Controlador para agregar una nueva zona (usado por el modal)
export const agregarZona = async (req, res) => {
  try {
    const { nombreZona } = req.body;
    // Validación simple
    if (!nombreZona || nombreZona.trim() === "") {
      return res.status(400).json({ success: false, message: "El nombre de la zona es obligatorio." });
    }
    // Insertar en la base de datos
    const [result] = await pool.query(
      "INSERT INTO zona (nombre_zona) VALUES (?)",  // ← CAMBIO: Asegurar que el campo sea 'nombre_zona' (ajusta si es 'nombre')
      [nombreZona.trim()]
    );
    // Responder al frontend con los datos del nuevo registro
    res.json({
      success: true,
      message: "Zona agregada correctamente.",
      id: result.insertId,
      nombreZona: nombreZona.trim()
    });
  } catch (error) {
    console.error("Error al agregar zona:", error);
    res.status(500).json({ success: false, message: "Error al guardar la zona." });
  }
};

// ← NUEVO: Controlador para editar una zona
export const editarZona = async (req, res) => {
  const { id } = req.params;
  const { nombreZona } = req.body;
  try {
    if (!nombreZona || nombreZona.trim() === "") {
      return res.status(400).json({ success: false, message: "El nombre de la zona es obligatorio." });
    }
    const [existing] = await pool.query("SELECT * FROM zona WHERE id_zona = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Zona no encontrada" });
    }
    await pool.query("UPDATE zona SET nombre_zona = ? WHERE id_zona = ?", [nombreZona.trim(), id]);
    res.json({ success: true, message: "Zona actualizada correctamente" });
  } catch (error) {
    console.error("Error al editar zona:", error);
    res.status(500).json({ success: false, message: "Error al actualizar la zona." });
  }
};

// ← NUEVO: Controlador para borrar una zona
export const borrarZona = async (req, res) => {
  const { id } = req.params;
  try {
    const [existing] = await pool.query("SELECT * FROM zona WHERE id_zona = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Zona no encontrada" });
    }
    await pool.query("DELETE FROM zona WHERE id_zona = ?", [id]);
    res.json({ success: true, message: "Zona borrada correctamente" });
  } catch (error) {
    console.error("Error al borrar zona:", error);
    res.status(500).json({ success: false, message: "Error al borrar zona,esta asignada a un Caso" });
  }
};
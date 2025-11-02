import pool from "../config/db.js";

// 🔹 Controlador para listar todas las zonas (por si necesitás renderizar en EJS)
export const listarZonas = async (req, res) => {
  try {
    const [zonas] = await pool.query("SELECT * FROM zona ORDER BY nombre_zona ASC");
    res.json(zonas);
  } catch (error) {
    console.error("Error al listar zonas:", error);
    res.status(500).json({ success: false, message: "Error al obtener zonas" });
  }
};

// 🔹 Controlador para agregar una nueva zona (usado por el modal)
export const agregarZona = async (req, res) => {
  try {
    const { nombreZona, nombreBarrio } = req.body;

    // Validación simple
    if (!nombreZona || nombreZona.trim() === "") {
      return res.status(400).json({ success: false, message: "El nombre de la zona es obligatorio." });
    }

    // Insertar en la base de datos
    const [result] = await pool.query(
      "INSERT INTO zona (nombre_zona, nombre_barrio) VALUES (?, ?)",
      [nombreZona.trim(), nombreBarrio || null]
    );

    // Responder al frontend con los datos del nuevo registro
    res.json({
      success: true,
      message: "Zona agregada correctamente.",
      id: result.insertId,
      nombreZona,
      nombreBarrio,
    });
  } catch (error) {
    console.error("Error al agregar zona:", error);
    res.status(500).json({ success: false, message: "Error al guardar la zona." });
  }
};

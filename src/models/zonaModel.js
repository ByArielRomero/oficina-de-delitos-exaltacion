import pool from "../config/db.js";

/**
 * Obtiene todas las zonas ordenadas por nombre.
 * @returns {Promise<Array>} Lista de zonas.
 */
export async function getZonas() {
  const [rows] = await pool.query("SELECT * FROM zona ORDER BY nombre_zona ASC");
  return rows;
}

/**
 * Obtiene una zona por su nombre.
 * @param {string} nombreZona - Nombre de la zona.
 * @returns {Promise<Object|null>} Zona encontrada o null.
 */
export async function getZonaByName(nombreZona) {
  const [rows] = await pool.query("SELECT * FROM zona WHERE nombre_zona = ?", [nombreZona]);
  return rows[0] || null;
}

/**
 * Obtiene una zona por su ID.
 * @param {number} id - ID de la zona.
 * @returns {Promise<Object|null>} Zona encontrada o null.
 */
export async function getZonaById(id) {
  const [rows] = await pool.query("SELECT * FROM zona WHERE id_zona = ?", [id]);
  return rows[0] || null;
}

/**
 * Crea una nueva zona.
 * @param {string} nombreZona - Nombre de la zona.
 * @returns {Promise<number>} ID de la zona creada.
 */
export async function createZona(nombreZona) {
  const [result] = await pool.query("INSERT INTO zona (nombre_zona) VALUES (?)", [nombreZona]);
  return result.insertId;
}

/**
 * Actualiza una zona existente.
 * @param {number} id - ID de la zona.
 * @param {string} nombreZona - Nuevo nombre de la zona.
 * @returns {Promise<boolean>} True si se actualizó.
 */
export async function updateZona(id, nombreZona) {
  const [result] = await pool.query("UPDATE zona SET nombre_zona = ? WHERE id_zona = ?", [nombreZona, id]);
  return result.affectedRows > 0;
}

/**
 * Elimina una zona por su ID.
 * @param {number} id - ID de la zona.
 * @returns {Promise<boolean>} True si se eliminó.
 */
export async function deleteZona(id) {
  const [result] = await pool.query("DELETE FROM zona WHERE id_zona = ?", [id]);
  return result.affectedRows > 0;
}
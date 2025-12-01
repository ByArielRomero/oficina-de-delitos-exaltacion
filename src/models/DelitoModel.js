import pool from "../config/db.js";

/**
 * Obtiene todos los delitos ordenados por tipo.
 * @returns {Promise<Array>} Lista de delitos.
 */
export async function getDelitos() {
  const [rows] = await pool.query(
    "SELECT id_delito, tipo_delito FROM delito ORDER BY tipo_delito"
  );
  return rows;
}

/**
 * Obtiene un delito por su ID.
 * @param {number} id - ID del delito.
 * @returns {Promise<Object|null>} El delito encontrado o null.
 */
export async function getDelitoById(id) {
  const [rows] = await pool.query("SELECT * FROM delito WHERE id_delito = ?", [id]);
  return rows[0] || null;
}

/**
 * Obtiene un delito por su nombre (tipo).
 * @param {string} tipoDelito - Nombre del tipo de delito.
 * @returns {Promise<Object|null>} El delito encontrado o null.
 */
export async function getDelitoByNombre(tipoDelito) {
  const [rows] = await pool.query("SELECT * FROM delito WHERE tipo_delito = ?", [tipoDelito]);
  return rows[0] || null;
}

/**
 * Crea un nuevo delito.
 * @param {string} tipoDelito - Nombre del nuevo tipo de delito.
 * @returns {Promise<Object>} El delito creado con su ID.
 */
export async function createDelito(tipoDelito) {
  const [result] = await pool.query(
    "INSERT INTO delito (tipo_delito) VALUES (?)",
    [tipoDelito]
  );
  return { id: result.insertId, tipo_delito: tipoDelito };
}

/**
 * Actualiza un delito existente.
 * @param {number} id - ID del delito.
 * @param {string} tipoDelito - Nuevo nombre del delito.
 * @returns {Promise<boolean>} True si se actualizó, False si no.
 */
export async function updateDelito(id, tipoDelito) {
  const [result] = await pool.query(
    "UPDATE delito SET tipo_delito = ? WHERE id_delito = ?",
    [tipoDelito, id]
  );
  return result.affectedRows > 0;
}

/**
 * Elimina un delito por su ID.
 * @param {number} id - ID del delito.
 * @returns {Promise<boolean>} True si se eliminó, False si no.
 */
export async function deleteDelito(id) {
  const [result] = await pool.query("DELETE FROM delito WHERE id_delito = ?", [id]);
  return result.affectedRows > 0;
}

/**
 * Verifica si un delito está siendo usado en algún caso.
 * @param {number} id - ID del delito.
 * @returns {Promise<boolean>} True si está en uso, False si no.
 */
export async function isDelitoInUse(id) {
  const [rows] = await pool.query("SELECT 1 FROM casos WHERE id_delito = ? LIMIT 1", [id]);
  return rows.length > 0;
}

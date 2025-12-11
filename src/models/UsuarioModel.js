import pool from "../config/db.js";

/**
 * Obtiene todos los usuarios (para listas desplegables, etc.).
 * @returns {Promise<Array>} Lista de usuarios (id, nombre).
 */
export async function getUsuarios() {
  const [rows] = await pool.query(
    "SELECT id_usuario, nombre_usuario FROM usuario ORDER BY nombre_usuario"
  );
  return rows;
}

/**
 * Obtiene todos los usuarios con su rol.
 * @returns {Promise<Array>} Lista de usuarios completa.
 */
export async function getAllUsers() {
  const [rows] = await pool.query(
    "SELECT id_usuario, nombre_usuario, id_rol FROM usuario ORDER BY id_usuario"
  );
  return rows;
}

/**
 * Busca un usuario por su nombre de usuario.
 * @param {string} username - Nombre de usuario.
 * @returns {Promise<Object|null>} El usuario encontrado o null.
 */
export async function getUserByUsername(username) {
  const [rows] = await pool.query(
    "SELECT * FROM usuario WHERE nombre_usuario = ?",
    [username]
  );
  return rows[0] || null;
}

/**
 * Crea un nuevo usuario.
 * @param {Object} data - Datos del usuario { nombre_usuario, password, id_rol }.
 * @returns {Promise<number>} ID del usuario creado.
 */
export async function createUser({ nombre_usuario, password, id_rol }) {
  const [result] = await pool.query(
    "INSERT INTO usuario (nombre_usuario, password, id_rol) VALUES (?, ?, ?)",
    [nombre_usuario, password, id_rol]
  );
  return result.insertId;
}

/**
 * Actualiza un usuario.
 * @param {number} id - ID del usuario.
 * @param {Object} data - Datos a actualizar { nombre_usuario, id_rol, password (opcional) }.
 * @returns {Promise<boolean>} True si se actualizó.
 */
export async function updateUser(id, { nombre_usuario, id_rol, password }) {
  let query = "UPDATE usuario SET nombre_usuario = ?, id_rol = ?";
  let params = [nombre_usuario, id_rol];

  if (password) {
    query += ", password = ?";
    params.push(password);
  }

  query += " WHERE id_usuario = ?";
  params.push(id);

  const [result] = await pool.query(query, params);
  return result.affectedRows > 0;
}

/**
 * Elimina un usuario por su ID.
 * @param {number} id - ID del usuario.
 * @returns {Promise<boolean>} True si se eliminó.
 */
export async function deleteUser(id) {
  const [result] = await pool.query("DELETE FROM usuario WHERE id_usuario = ?", [id]);
  return result.affectedRows > 0;
}

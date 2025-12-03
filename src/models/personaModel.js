import pool from "../config/db.js";

/**
 * Obtiene todas las personas registradas.
 * @returns {Promise<Array>} Lista de personas.
 */
/**
 * Obtiene todas las personas registradas (no eliminadas).
 * @returns {Promise<Array>} Lista de personas.
 */
export async function getPersonas(search = '') {
  let query = `
    SELECT p.*, z.nombre_zona as zona, CONCAT(p.nombre, ' ', p.apellido) AS nombre_completo
    FROM persona p
    LEFT JOIN zona z ON p.id_zona = z.id_zona
    WHERE p.deleted_at IS NULL
  `;
  const params = [];

  if (search) {
    query += ` AND (p.nombre LIKE ? OR p.apellido LIKE ? OR p.dni LIKE ?)`;
    const term = `%${search}%`;
    params.push(term, term, term);
  }

  query += ` ORDER BY p.apellido, p.nombre`;

  const [rows] = await pool.query(query, params);
  return rows;
}

/**
 * Agrega una nueva persona.
 */
export async function agregarPersona({ nombre, apellido, dni, telefono, direccion, calle, numero_o_sn, zona_id, email, genero }) {
  try {
    const [result] = await pool.query(
      `INSERT INTO persona (nombre, apellido, dni, telefono, direccion, calle, numero_o_sn, id_zona, email, genero)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, dni, telefono, direccion, calle, numero_o_sn, zona_id, email, genero]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error en agregarPersona (BD):", error);
    throw error;
  }
}

/**
 * Actualiza los datos de una persona.
 * @param {number} id - ID de la persona.
 * @param {Object} data - Datos a actualizar { nombre, apellido, dni, telefono }.
 * @returns {Promise<boolean>} True si se actualizó.
 */
export async function updatePersona(id, { nombre, apellido, dni, telefono }) {
  const [result] = await pool.query(
    `UPDATE persona SET nombre = ?, apellido = ?, dni = ?, telefono = ? WHERE id_persona = ?`,
    [nombre, apellido, dni, telefono, id]
  );
  return result.affectedRows > 0;
}

/**
 * Obtiene una persona por su ID.
 * @param {number} id - ID de la persona.
 * @returns {Promise<Object|null>} Persona encontrada o null.
 */
export async function getPersonaById(id) {
  const [rows] = await pool.query("SELECT * FROM persona WHERE id_persona = ? AND deleted_at IS NULL", [id]);
  return rows[0] || null;
}

/**
 * Obtiene una persona por su DNI.
 * @param {string} dni - DNI de la persona.
 * @returns {Promise<Object|null>} Persona encontrada o null.
 */
export async function getPersonaByDni(dni) {
  const [rows] = await pool.query("SELECT * FROM persona WHERE dni = ? AND deleted_at IS NULL", [dni]);
  return rows[0] || null;
}

/**
 * Elimina una persona por su ID (Soft Delete).
 * @param {number} id - ID de la persona.
 * @returns {Promise<boolean>} True si se eliminó.
 */
export async function deletePersona(id) {
  const [result] = await pool.query("UPDATE persona SET deleted_at = NOW() WHERE id_persona = ?", [id]);
  return result.affectedRows > 0;
}

/**
 * Obtiene personas eliminadas.
 */
export async function getPersonasEliminadas() {
  const [rows] = await pool.query(`
    SELECT p.*, z.nombre_zona as zona
    FROM persona p
    LEFT JOIN zona z ON p.id_zona = z.id_zona
    WHERE p.deleted_at IS NOT NULL
    ORDER BY p.deleted_at DESC
  `);
  return rows;
}

/**
 * Restaura una persona eliminada.
 */
export async function restorePersona(id) {
  const [result] = await pool.query("UPDATE persona SET deleted_at = NULL WHERE id_persona = ?", [id]);
  return result.affectedRows > 0;
}

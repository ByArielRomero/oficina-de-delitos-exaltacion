import pool from "../config/db.js";

/**
 * Crea un nuevo caso.
 * @param {Object} data - Datos del caso.
 * @returns {Promise<Object>} El caso creado.
 */
export async function createCaso(data) {
  const {
    observacion,
    id_persona,
    id_usuario,
    id_delito,
    id_zona,
    fecha_creada,
    fecha_actualizado,
    estado,
  } = data;

  const [result] = await pool.query(
    `
    INSERT INTO casos 
      (observacion, id_persona, id_usuario, id_delito, id_zona, fecha_creada, fecha_actualizado, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `,
    [
      observacion || null,
      id_persona,
      id_usuario || null,
      id_delito,
      id_zona,
      fecha_creada || new Date(),
      fecha_actualizado || new Date(),
      estado,
    ]
  );

  return {
    id: result.insertId,
    ...data,
    fecha_creada: fecha_creada || new Date(),
    fecha_actualizado: fecha_actualizado || new Date(),
  };
}

/**
 * Obtiene todos los casos con información relacionada (persona, delito, zona).
 * @returns {Promise<Array>} Lista de casos.
 */
export async function getCasos() {
  const [rows] = await pool.query(`
    SELECT
      c.id_casos AS id,
      p.nombre,
      p.apellido,
      p.dni,
      p.telefono,
      d.tipo_delito AS tipo_caso,
      z.nombre_zona AS zona,
      c.fecha_creada,
      c.estado AS estado
    FROM casos c
    JOIN persona p ON c.id_persona = p.id_persona
    JOIN delito d ON c.id_delito = d.id_delito
    JOIN zona z ON c.id_zona = z.id_zona
    WHERE c.deleted_at IS NULL
    ORDER BY c.fecha_creada DESC
  `);
  return rows;
}

/**
 * Obtiene un caso por su ID con información detallada.
 * @param {number} id - ID del caso.
 * @returns {Promise<Object|null>} El caso encontrado o null.
 */
export async function getCasoById(id) {
  const [rows] = await pool.query(
    `
    SELECT 
      c.id_casos AS id,
      c.observacion,
      c.estado,
      c.fecha_creada,
      c.fecha_actualizado,
      p.id_persona,
      p.nombre,
      p.apellido,
      p.dni,
      p.telefono,
      d.id_delito,
      d.tipo_delito,
      z.id_zona,
      z.nombre_zona
    FROM casos c
    JOIN persona p ON c.id_persona = p.id_persona
    JOIN delito d ON c.id_delito = d.id_delito
    JOIN zona z ON c.id_zona = z.id_zona
    WHERE c.id_casos = ? AND c.deleted_at IS NULL
  `,
    [id]
  );
  return rows[0] || null;
}

/**
 * Actualiza un caso existente.
 * @param {number} id - ID del caso.
 * @param {Object} data - Datos a actualizar { id_delito, id_zona, estado, observacion }.
 * @returns {Promise<boolean>} True si se actualizó.
 */
export async function updateCaso(id, { id_delito, id_zona, estado, observacion }) {
  const [result] = await pool.query(
    `UPDATE casos 
     SET id_delito = ?, id_zona = ?, estado = ?, observacion = ?, fecha_actualizado = NOW()
     WHERE id_casos = ?`,
    [id_delito, id_zona, estado, observacion, id]
  );
  return result.affectedRows > 0;
}

/**
 * Elimina un caso por su ID (Soft Delete).
 * @param {number} id - ID del caso.
 * @returns {Promise<boolean>} True si se eliminó.
 */
export async function deleteCaso(id) {
  const [result] = await pool.query("UPDATE casos SET deleted_at = NOW() WHERE id_casos = ?", [id]);
  return result.affectedRows > 0;
}

/**
 * Verifica si un caso existe.
 * @param {number} id - ID del caso.
 * @returns {Promise<boolean>} True si existe.
 */
export async function existsCaso(id) {
  const [rows] = await pool.query("SELECT 1 FROM casos WHERE id_casos = ?", [id]);
  return rows.length > 0;
}

/**
 * Obtiene todos los casos eliminados (Soft Deleted).
 * @returns {Promise<Array>} Lista de casos eliminados.
 */
export async function getCasosEliminados() {
  const [rows] = await pool.query(`
    SELECT
      c.id_casos AS id,
      p.nombre,
      p.apellido,
      p.dni,
      d.tipo_delito AS tipo_caso,
      z.nombre_zona AS zona,
      c.fecha_creada,
      c.deleted_at
    FROM casos c
    JOIN persona p ON c.id_persona = p.id_persona
    JOIN delito d ON c.id_delito = d.id_delito
    JOIN zona z ON c.id_zona = z.id_zona
    WHERE c.deleted_at IS NOT NULL
    ORDER BY c.deleted_at DESC
  `);
  return rows;
}

/**
 * Restaura un caso eliminado.
 * @param {number} id - ID del caso.
 * @returns {Promise<boolean>} True si se restauró.
 */
export async function restoreCaso(id) {
  const [result] = await pool.query("UPDATE casos SET deleted_at = NULL WHERE id_casos = ?", [id]);
  return result.affectedRows > 0;
}


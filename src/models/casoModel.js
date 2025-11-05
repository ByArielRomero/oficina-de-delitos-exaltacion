import pool from "../config/db.js";

export async function getPersonas() {
  const [rows] = await pool.query(`
    SELECT id_persona, CONCAT(nombre, ' ', apellido) AS nombre_completo, telefono, direccion
    FROM persona
    ORDER BY apellido, nombre
  `);
  return rows;
}

export async function getDelitos() {
  const [rows] = await pool.query('SELECT id_delito, tipo_delito FROM delito ORDER BY tipo_delito');
  return rows;
}

export async function createDelito(tipoDelito) {
  const [result] = await pool.query(
    'INSERT INTO delito (tipo_delito) VALUES (?)',
    [tipoDelito]
  );
  return { id: result.insertId, tipo_delito: tipoDelito };
}

export async function getUsuarios() {
  const [rows] = await pool.query(`
    SELECT id_usuario, nombre_usuario
    FROM usuario
    ORDER BY nombre_usuario
  `);
  return rows;
}

export async function getZonas() {
  const [rows] = await pool.query('SELECT id_zona, nombre_zona FROM zona ORDER BY nombre_zona');
  return rows;
}

export async function createCaso(data) {
  const { observacion, id_zona = 1, id_persona, id_usuario, id_delito, fecha_creada, fecha_actualizado } = data;  // Default zona=1
  const [result] = await pool.query(`
    INSERT INTO casos (observacion, id_zona, id_persona, id_usuario, id_delito, fecha_creada, fecha_actualizado)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [
    observacion || null,
    id_zona,
    id_persona,
    id_usuario || null,
    id_delito,
    fecha_creada ? new Date(fecha_creada) : null,
    fecha_actualizado ? new Date(fecha_actualizado) : null
  ]);
  return { id: result.insertId, ...data };
}
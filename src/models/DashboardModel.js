import pool from "../config/db.js";

/**
 * Modelo para manejar las consultas del Dashboard.
 * Centraliza todas las métricas y estadísticas.
 */

/**
 * Obtiene el total de casos registrados.
 * @returns {Promise<number>} Total de casos.
 */
export async function getTotalCasos() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM casos");
  return rows[0].total;
}

/**
 * Obtiene el total de personas registradas.
 * @returns {Promise<number>} Total de personas.
 */
export async function getTotalPersonas() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM persona");
  return rows[0].total;
}

/**
 * Obtiene el total de zonas registradas.
 * @returns {Promise<number>} Total de zonas.
 */
export async function getTotalZonas() {
  const [rows] = await pool.query("SELECT COUNT(*) AS total FROM zona");
  return rows[0].total;
}

/**
 * Obtiene la cantidad de casos creados en el mes actual.
 * @returns {Promise<number>} Total de casos del mes.
 */
export async function getCasosMesActual() {
  const [rows] = await pool.query(`
    SELECT COUNT(*) AS total
    FROM casos
    WHERE MONTH(fecha_creada) = MONTH(CURRENT_DATE())
    AND YEAR(fecha_creada) = YEAR(CURRENT_DATE());
  `);
  return rows[0].total;
}

/**
 * Obtiene estadísticas de delitos por mes para el año actual.
 * @returns {Promise<Array>} Lista de objetos { mes, total }.
 */
export async function getDelitosPorMes() {
  const [rows] = await pool.query(`
    SELECT MONTH(fecha_creada) AS mes, COUNT(*) AS total
    FROM casos
    WHERE YEAR(fecha_creada) = YEAR(CURRENT_DATE())
    GROUP BY MONTH(fecha_creada)
    ORDER BY mes
  `);
  return rows;
}

/**
 * Obtiene estadísticas de delitos agrupados por género.
 * @returns {Promise<Array>} Lista de objetos { genero, total }.
 */
export async function getDelitosPorGenero() {
  const [rows] = await pool.query(`
    SELECT p.genero, COUNT(*) AS total
    FROM casos c
    JOIN persona p ON c.id_persona = p.id_persona
    GROUP BY p.genero
  `);
  return rows;
}

/**
 * Obtiene estadísticas de cantidad de casos por tipo de delito.
 * @returns {Promise<Array>} Lista de objetos { tipo_delito, total }.
 */
export async function getTiposDeDelito() {
  const [rows] = await pool.query(`
    SELECT d.tipo_delito, COUNT(c.id_delito) AS total
    FROM delito d
    LEFT JOIN casos c ON c.id_delito = d.id_delito
    GROUP BY d.tipo_delito
  `);
  return rows;
}

import pool from "../config/db.js";

export async function obtenerZonas() {
  const [rows] = await pool.query("SELECT * FROM zona");
  return rows;
}

export async function agregarZona(nombreZona) {
  const [result] = await pool.query("INSERT INTO zona (nombre) VALUES (?)", [nombreZona]);
  return result.insertId;
}

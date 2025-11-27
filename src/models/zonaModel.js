import pool from "../config/db.js";

export async function obtenerZonas() {
  const [rows] = await pool.query("SELECT * FROM zona");
  return rows;
}

export async function agregarZona(nombreZona) {
  const [result] = await pool.query("INSERT INTO zona (nombre) VALUES (?)", [nombreZona]);
  return result.insertId;
}


export async function editarZona(id, nombreZona) {
  const [result] = await pool.query("UPDATE zona SET nombre_zona = ? WHERE id_zona = ?", [nombreZona, id]);
  return result.affectedRows > 0;
}


export async function borrarZona(id) {
  const [result] = await pool.query("DELETE FROM zona WHERE id_zona = ?", [id]);
  return result.affectedRows > 0;
}
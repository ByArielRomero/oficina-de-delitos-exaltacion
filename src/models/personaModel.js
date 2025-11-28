// src/models/personaModel.js
import pool from "../config/db.js";

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
    throw error; // Propaga el error al controller
  }
}

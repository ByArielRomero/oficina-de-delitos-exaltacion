import pool from "../config/db.js";

// === OBTENER PERSONAS ===
export async function getPersonas() {
  const [rows] = await pool.query(`
    SELECT id_persona, CONCAT(nombre, ' ', apellido) AS nombre_completo, telefono, direccion
    FROM persona ORDER BY apellido, nombre
  `);
  return rows;
}

// === OBTENER DELITOS ===
export async function getDelitos() {
  const [rows] = await pool.query(
    "SELECT id_delito, tipo_delito FROM delito ORDER BY tipo_delito"
  );
  return rows;
}

// === OBTENER USUARIOS ===
export async function getUsuarios() {
  const [rows] = await pool.query(
    "SELECT id_usuario, nombre_usuario FROM usuario ORDER BY nombre_usuario"
  );
  return rows;
}

// === OBTENER ZONAS ===
export async function getZonas() {
  const [rows] = await pool.query(
    "SELECT id_zona, nombre_zona FROM zona ORDER BY nombre_zona"
  );
  return rows;
}

// === CREAR DELITO ===
export async function createDelito(tipoDelito) {
  const [result] = await pool.query(
    "INSERT INTO delito (tipo_delito) VALUES (?)",
    [tipoDelito]
  );
  return { id: result.insertId, tipo_delito: tipoDelito };
}

// === CREAR CASO (FALTABA EL EXPORT) ===
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

// === LISTAR CASOS (PARA LA TABLA) ===
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
    ORDER BY c.fecha_creada DESC
  `);

  console.log("getCasos() → ESTADO SÍ LLEGA:", rows.map(r => ({ 
    id: r.id, 
    estado: r.estado 
  })));

  return rows;
}

// === OBTENER UN CASO POR ID (PARA EDITAR) ===
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
      d.tipo_delito,           -- ← para tipo_caso
      z.id_zona,
      z.nombre_zona            -- ← para zona
    FROM casos c
    JOIN persona p ON c.id_persona = p.id_persona
    JOIN delito d ON c.id_delito = d.id_delito
    JOIN zona z ON c.id_zona = z.id_zona
    WHERE c.id_casos = ?
  `,
    [id]
  );
  return rows[0] || null;
}

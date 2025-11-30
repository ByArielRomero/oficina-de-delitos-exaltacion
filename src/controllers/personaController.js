import { agregarPersona } from "../models/personaModel.js";
import pool from "../config/db.js"; // solo para obtener zonas

export const mostrarFormularioPersona = async (req, res) => {
  try {
    const [zonas] = await pool.query("SELECT * FROM zona");

    // OBTENER PERSONAS PARA EL MODAL
    const [personasRows] = await pool.query(`
      SELECT id_persona AS id, nombre, apellido, dni, telefono, email, genero, calle, numero_o_sn, z.nombre_zona AS zona
      FROM persona p
      LEFT JOIN zona z ON p.id_zona = z.id_zona
      ORDER BY apellido, nombre
    `);

    res.render("agregar-persona", {
      zonas,
      currentUser: res.locals.currentUser
      
    });
  } catch (error) {
    console.error("Error al obtener zonas/personas:", error);
    res.status(500).send("Error al cargar el formulario");
  }
};


/*-----------------_*/
export const crearPersona = async (req, res) => {
  try {
    // Primero destructuramos del body
    // AHORA: recibimos calle, altura, sinNumero en lugar de direccion directa
    const { nombre, apellido, dni, telefono, calle, altura, sinNumero, zona, email, genero } = req.body;

    // Construir dirección
    let direccionFinal = "";
    if (sinNumero === "on" || sinNumero === true) {
      direccionFinal = `${calle} s/n`;
    } else {
      direccionFinal = `${calle} ${altura}`;
    }

    // Validar DNI: 7, 8 o 9 dígitos
    if (!/^\d{7,9}$/.test(dni)) {
      return res.status(400).json({ success: false, message: "DNI: utilizar 7, 8 o 9 dígitos" });
    }
     if (!/^\d{8,15}$/.test(telefono)) {
      return res.status(400).json({ success: false, message: "telefono: utilizar 10 digitos" });
    }
        if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Email inválido: debe contener @ y un dominio (ej: nombre@ gmail.com)"
  });
}
    // Luego usamos dni
    const [existing] = await pool.query("SELECT * FROM persona WHERE dni = ?", [dni]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, message: "Ya existe una persona con ese DNI" });
    }

    const idPersona = await agregarPersona({
      nombre,
      apellido,
      dni,
      telefono,
      dni,
      telefono,
      direccion: direccionFinal,
      calle,
      numero_o_sn: (sinNumero === "on" || sinNumero === true) ? "S/N" : altura,
      zona_id: Number(zona),
      email,
      genero,
    });

    res.json({ success: true, message: "Persona agregada correctamente" });
  } catch (error) {
    console.error("Error completo:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const listarCasos = async (req, res) => {
  try {
    const [casos] = await pool.query(`
      SELECT
        c.id_casos AS id,
        p.nombre,
        p.apellido,
        p.dni,
        p.telefono,
        d.tipo_delito AS tipo_caso,
        z.nombre_zona AS zona,
        c.fecha_creada,
        c.estado
      FROM casos c
      JOIN persona p ON c.id_persona = p.id_persona
      JOIN delito d ON c.id_delito = d.id_delito
      JOIN zona z ON c.id_zona = z.id_zona
      ORDER BY c.id_casos DESC
    `);

    res.render("lista-casos", { 
      casos,
      currentUser: req.user || null  // ← ¡AQUÍ!
    });
  } catch (error) {
    console.error("Error al listar casos:", error);
    res.status(500).send("Error al listar casos");
  }
};
export const obtenerCaso = async (req, res) => {
  const { id } = req.params;

  try {
    const [casos] = await pool.query(
      `
      SELECT 
        c.id_casos AS id,
        p.id_persona,
        p.nombre,
        p.apellido,
        p.dni,
        p.telefono,
        d.id_delito,
        d.tipo_delito AS tipo_caso,
        z.id_zona,
        z.nombre_zona AS zona,
        c.observacion,
        c.fecha_creada,
        c.fecha_actualizado,
        c.id_usuario
      FROM casos c
      JOIN persona p ON c.id_persona = p.id_persona
      JOIN delito d ON c.id_delito = d.id_delito
      JOIN zona z ON c.id_zona = z.id_zona
      WHERE c.id_casos = ?
    `,
      [id]
    );

    if (casos.length === 0)
      return res.status(404).json({ message: "Caso no encontrado" });

    // Traer todas las opciones de delitos y zonas
    const [delitos] = await pool.query(
      `SELECT id_delito, tipo_delito FROM delito`
    );
    const [zonas] = await pool.query(`SELECT id_zona, nombre_zona FROM zona`);

    res.json({ caso: casos[0], delitos, zonas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Actualizar un caso
export const actualizarCaso = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, dni, telefono, tipo_caso, zona, observaciones } =
    req.body;

  try {
    // Actualizar datos de persona
    await pool.query(
      `
      UPDATE persona 
      SET nombre = ?, apellido = ?, dni = ?, telefono = ?
      WHERE id_persona = (SELECT id_persona FROM casos WHERE id_casos = ?)
    `,
      [nombre, apellido, dni, telefono, id]
    );

    // Actualizar datos del caso
    await pool.query(
      `
      UPDATE casos 
      SET id_delito = ?, id_zona = ?, observacion = ?, fecha_actualizado = NOW()
      WHERE id_casos = ?
    `,
      [tipo_caso, zona, observaciones, id]
    );

    res.json({ success: true, message: "Caso actualizado correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ← NUEVO: Listar personas (con búsqueda opcional)
export const listarPersonas = async (req, res) => {
  try {
    const { search = '' } = req.query; // Búsqueda por query param
    let query = `
      SELECT id_persona AS id, nombre, apellido, dni, telefono, direccion, calle, numero_o_sn, email, genero, z.id_zona AS zona_id, z.nombre_zona AS zona
      FROM persona p
      LEFT JOIN zona z ON p.id_zona = z.id_zona
      WHERE 1=1
    `;
    let params = [];
    if (search.trim()) {
      query += ` AND (nombre LIKE ? OR apellido LIKE ? OR dni LIKE ?)`;
      const searchTerm = `%${search.trim()}%`;
      params = [searchTerm, searchTerm, searchTerm];
    }
    query += ` ORDER BY apellido ASC, nombre ASC`;
    
    const [personas] = await pool.query(query, params);
    res.json({ success: true, personas });
  } catch (error) {
    console.error("Error al listar personas:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ← NUEVO: Borrar persona
export const borrarPersona = async (req, res) => {
  const { id } = req.params;
  try {
    // Verificar autenticación y rol
    if (!req.user) {
      return res.status(401).json({ success: false, message: "No autenticado" });
    }
    // Usar el campo numérico id_rol: admin = 1, operador = 2
    const id_rol = Number(req.user.id_rol || req.user.idRol || req.user.rol || req.user.role || 0);
    if (id_rol !== 1) {
      return res.status(403).json({ success: false, message: "Acceso denegado: solo admin puede borrar" });
    }

    // Verificar si existe (y opcional: si tiene casos asociados, no borrar o manejar)
    const [existing] = await pool.query("SELECT * FROM persona WHERE id_persona = ?", [id]);
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Persona no encontrada" });
    }

    // Borrar (asumimos que no hay FK restrictivas; si hay casos, considera soft-delete)
    await pool.query("DELETE FROM persona WHERE id_persona = ?", [id]);
    res.json({ success: true, message: "Persona borrada correctamente" });
  } catch (error) {
    console.error("Error al borrar persona:", error);
    if (error.sqlState === '23000' || error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 1451) {
      return res.status(400).json({
        success: false,
        message: "No se puede borrar, tiene un caso asignado"
      });
    }

    res.status(500).json({ success: false, message: "Error al borrar la persona." });
  }
};

// ← NUEVO: Eliminar caso (solo admin)



// ← NUEVO: Actualizar persona
export const actualizarPersona = async (req, res) => {
  const { id } = req.params;
  // AHORA: recibimos calle, altura, sinNumero
  const { nombre, apellido, dni, telefono, calle, altura, sinNumero, zona, email, genero } = req.body;
  try {

    // Validar DNI: 7, 8 o 9 dígitos
    if (!/^\d{7,9}$/.test(dni)) {
      return res.status(400).json({ success: false, message: "DNI: utilizar 7, 8 o 9 dígitos" });
    }
    
     if (!/^\d{8,15}$/.test(telefono)) {
      return res.status(400).json({ success: false, message: "telefono: utilizar 8 a 15 digitos" });
    }

    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ success: false, message: "Email inválido: debe contener @ y un dominio (ej: nombre@ gmail.com)"
  });
}

    // Verificar DNI único (excluyendo la persona actual)
    const [existingDni] = await pool.query("SELECT * FROM persona WHERE dni = ? AND id_persona != ?", [dni, id]);
    if (existingDni.length > 0) {
      return res.status(400).json({ success: false, message: "Ya existe otra persona con ese DNI" });
    }

    // Construir dirección
    let direccionFinal = "";
    if (sinNumero === "on" || sinNumero === true) {
      direccionFinal = `${calle} s/n`;
    } else {
      direccionFinal = `${calle} ${altura}`;
    }

    await pool.query(`
      UPDATE persona 
      SET nombre = ?, apellido = ?, dni = ?, telefono = ?, direccion = ?, calle = ?, numero_o_sn = ?, id_zona = ?, email = ?, genero = ?
      WHERE id_persona = ?
    `, [nombre, apellido, dni, telefono, direccionFinal, calle, (sinNumero === "on" || sinNumero === true) ? "S/N" : altura, Number(zona), email, genero, id]);

    res.json({ success: true, message: "Persona actualizada correctamente" });
  } catch (error) {
    console.error("Error al actualizar persona:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
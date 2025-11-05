import pool from "../config/db.js";

export async function getResumenGeneral(req, res) {
  try {
    // Total de casos
    const [totalCasos] = await pool.query(
      `SELECT COUNT(*) AS total FROM casos`
    );

    // Total de personas
    const [totalPersonas] = await pool.query(
      `SELECT COUNT(*) AS total FROM persona`
    );

    // Casos del mes actual
    const [casosMes] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM casos
      WHERE MONTH(fecha_creada) = MONTH(CURRENT_DATE())
      AND YEAR(fecha_creada) = YEAR(CURRENT_DATE());
    `);

    // Total de zonas
    const [totalZonas] = await pool.query(`SELECT COUNT(*) AS total FROM zona`);

    res.json({
      success: true,
      data: {
        totalCasos: totalCasos[0].total,
        totalPersonas: totalPersonas[0].total,
        casosEsteMes: casosMes[0].total,
        totalZonas: totalZonas[0].total,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen general:", error);
    res
      .status(500)
      .json({ success: false, message: "Error al obtener resumen" });
  }
}

export const getStatsCharts = async (req, res) => {
  try {
    // Delitos por año
    const [delitosAnio] = await pool.query(`
      SELECT YEAR(fecha_creada) AS anio, COUNT(*) AS total
      FROM casos
      GROUP BY YEAR(fecha_creada)
      ORDER BY anio
    `);

    // Delitos por género (antes estaba 'sexo')
    const [delitosGenero] = await pool.query(`
      SELECT p.genero, COUNT(*) AS total
      FROM casos c
      JOIN persona p ON c.id_persona = p.id_persona
      GROUP BY p.genero
    `);

    // Tipos de delitos
    const [tiposDelito] = await pool.query(`
      SELECT d.tipo_delito, COUNT(c.id_delito) AS total
FROM delito d
LEFT JOIN casos c ON c.id_delito = d.id_delito
GROUP BY d.tipo_delito

    `);

    res.json({
      success: true,
      data: { delitosAnio, delitosSexo: delitosGenero, tiposDelito },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Error al cargar estadísticas" });
  }
};



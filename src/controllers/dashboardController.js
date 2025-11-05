import pool from "../config/db.js";

export async function getResumenGeneral(req, res) {
  try {
    // Total de casos
    const [totalCasos] = await pool.query(`SELECT COUNT(*) AS total FROM casos`);

    // Total de personas
    const [totalPersonas] = await pool.query(`SELECT COUNT(*) AS total FROM persona`);

    // Casos del mes actual (reinicia cada mes)
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
        totalZonas: totalZonas[0].total
      }
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen general:", error);
    res.status(500).json({ success: false, message: "Error al obtener resumen" });
  }
}

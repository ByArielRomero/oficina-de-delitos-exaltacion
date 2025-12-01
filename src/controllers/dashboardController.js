import * as DashboardModel from "../models/DashboardModel.js";

/**
 * Obtiene el resumen general (contadores) y lo envía como JSON.
 * Usado por la API.
 */
export async function getResumenGeneral(req, res) {
  try {
    const [totalCasos, totalPersonas, casosEsteMes, totalZonas] = await Promise.all([
      DashboardModel.getTotalCasos(),
      DashboardModel.getTotalPersonas(),
      DashboardModel.getCasosMesActual(),
      DashboardModel.getTotalZonas(),
    ]);

    res.json({
      success: true,
      data: {
        totalCasos,
        totalPersonas,
        casosEsteMes,
        totalZonas,
      },
    });
  } catch (error) {
    console.error("❌ Error al obtener resumen general:", error);
    res.status(500).json({ success: false, message: "Error al obtener resumen" });
  }
}

/**
 * Obtiene las estadísticas para gráficos y las envía como JSON.
 * Usado por la API.
 */
export const getStatsCharts = async (req, res) => {
  try {
    const [delitosAnio, delitosGenero, tiposDelito] = await Promise.all([
      DashboardModel.getDelitosPorMes(),
      DashboardModel.getDelitosPorGenero(),
      DashboardModel.getTiposDeDelito(),
    ]);

    res.json({
      success: true,
      data: { delitosAnio, delitosSexo: delitosGenero, tiposDelito },
    });
  } catch (error) {
    console.error("❌ Error al cargar estadísticas:", error);
    res.status(500).json({ success: false, message: "Error al cargar estadísticas" });
  }
};

/**
 * Renderiza la vista del Dashboard con todos los datos necesarios.
 * GET /dashboard
 */
export const getDashboard = async (req, res) => {
  try {
    // Ejecutamos todas las consultas en paralelo para mayor eficiencia
    const [
      totalCasos,
      totalPersonas,
      casosEsteMes,
      totalZonas,
      delitosAnio,
      delitosGenero,
      tiposDelito
    ] = await Promise.all([
      DashboardModel.getTotalCasos(),
      DashboardModel.getTotalPersonas(),
      DashboardModel.getCasosMesActual(),
      DashboardModel.getTotalZonas(),
      DashboardModel.getDelitosPorMes(),
      DashboardModel.getDelitosPorGenero(),
      DashboardModel.getTiposDeDelito()
    ]);

    res.render('dashboard', {
      stats: {
        totalCasos,
        totalPersonas,
        casosEsteMes,
        totalZonas,
      },
      chartData: {
        delitosAnio,
        delitosSexo: delitosGenero,
        tiposDelito
      },
      currentUser: req.user || null,
      alert: req.session.alert || null
    });
    
    // Limpiar alerta de sesión si existe
    if (req.session.alert) {
      delete req.session.alert;
    }

  } catch (err) {
    console.error("❌ Error en getDashboard:", err);
    res.status(500).send('Error interno al cargar el dashboard');
  }
};
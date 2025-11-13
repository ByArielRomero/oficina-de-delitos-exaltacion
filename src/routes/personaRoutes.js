// src/routes/personaRoutes.js
import express from "express";

const router = express.Router();

import { 
  mostrarFormularioPersona , 
  crearPersona, 
  listarPersonas, 
  borrarPersona, 
  actualizarPersona 
} from "../controllers/personaController.js";
import { protect } from '../middlewares/authMiddleware.js';


// RUTA CORRECTA: usa el controlador + protect
router.get("/agregar-persona", protect, mostrarFormularioPersona);
router.post("/agregar-persona", protect, crearPersona);

// APIs para el modal
router.get("/personas", protect, listarPersonas);

router.put("/personas/:id", protect, actualizarPersona);










/*
router.get("/agregar-persona", mostrarFormularioPersona);
router.post("/agregar-persona", crearPersona);

router.get("/personas", listarPersonas);  // GET /personas?search=texto (lista con búsqueda)
router.delete("/personas/:id", borrarPersona);  // DELETE /personas/:id (borrar)
router.put("/personas/:id", actualizarPersona);  // PUT /personas/:id (editar)
*/

/*
// Ruta para mostrar formulario de agregar persona
router.get('/agregar-persona', protect, async (req, res) => {
  try {
    const personas = await obtenerPersonas(); // Función que trae datos desde DB
    res.render('agregar-persona', {
      user: req.user,       // Contiene id_rol, nombre, etc.
      personas: JSON.stringify(personas)// Lista para selects o tablas
    });
  } catch (error) {
    console.error('Error al cargar formulario:', error);
    res.status(500).render('error', { message: 'Error al cargar el formulario' });
  }
});*/

export default router;

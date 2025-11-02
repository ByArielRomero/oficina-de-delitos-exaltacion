import express from "express";
const router = express.Router();

// GET /agregar-caso
router.get("/agregar-caso", (req, res) => {
  res.render("agregar-casos");
});

// Página para listar casos
router.get("/lista-casos", (req, res) => {
  res.render("lista-casos"); // Nombre del archivo .ejs
});


export default router;

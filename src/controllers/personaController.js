/*ACA VA LA LOGICA*/

/*
EJEMPLO:
Mostrar todas las personas


 function mostrarPersonas(req, res) {
  Persona.getAll((err, personas) => {
    if (err) return res.status(500).send('Error en la base de datos');
    res.render('personas', { personas }); // pasa datos a la vista EJS
  });
}

*/
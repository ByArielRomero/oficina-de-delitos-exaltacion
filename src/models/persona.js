/* Se Define el modelo (estructura del documento o tabla)*/

/**
 EJEMPLO: 
// Traer todas las personas

function getAll(callback) {
  conexion.query('SELECT * FROM personas', (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

 */
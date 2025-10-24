import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const connection = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});



// Llamar a la función y manejar el resultado
testDatabaseConnection().then(success => {
  if (success) {
    console.log('--- Pool listo para operar ---');
    // Aquí puedes iniciar tu servidor web (Express, etc.)
  } else {
    // Si la conexión falla, la app no puede continuar
    console.log('--- Terminando la aplicación debido a error de DB ---');
    // process.exit(1); 
  }
});


//PRUEBA DE BD CORRIENDO
async function testDatabaseConnection() {
  let conn; // Variable para almacenar la conexión que obtendremos del pool
  
  try {
    // 1. Intentar obtener una conexión del pool (await la convierte en una promesa)
    conn = await connection.getConnection(); 
    
    // 2. Ejecutar una consulta de prueba simple
    // Esto es la prueba de fuego que asegura la comunicación real con el servidor
    await conn.query('SELECT 1 + 1 AS solution'); 
    
    console.log('✅ ¡Conexión a la base de datos establecida y probada con éxito!');
    return true; // Éxito
    
  } catch (error) {
    // 3. Capturar y mostrar cualquier error de conexión o consulta
    console.error('❌ ERROR CRÍTICO: No se pudo conectar a la base de datos.');
    console.error('Mensaje de error:', error.message);
    return false; // Fallo
    
  } finally {
    // 4. Liberar la conexión SIEMPRE, haya éxito o error
    if (conn) {
      conn.release(); 
      console.log('🔌 Conexión liberada de vuelta al pool.');
    }
  }
}

export default connection;

import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const seedUsers = async () => {
  try {
    console.log("🌱 Iniciando proceso de seeding...");

    // 1. Asegurar que existe el admin para reasignar casos
    const adminPass = await bcrypt.hash("admin1234", 10);
    const [adminRows] = await pool.query("SELECT id_usuario FROM usuario WHERE nombre_usuario = 'admin'");
    
    let adminId;
    if (adminRows.length === 0) {
      console.log("✨ Creando usuario 'admin'...");
      const [res] = await pool.query(
        "INSERT INTO usuario (nombre_usuario, password, id_rol) VALUES (?, ?, ?)",
        ["admin", adminPass, 1]
      );
      adminId = res.insertId;
    } else {
      console.log("🔄 Actualizando usuario 'admin'...");
      await pool.query(
        "UPDATE usuario SET password = ?, id_rol = 1 WHERE nombre_usuario = 'admin'",
        [adminPass]
      );
      adminId = adminRows[0].id_usuario;
    }

    // 2. Reasignar casos de 'maxi' y 'leon' al admin
    console.log("🔄 Reasignando casos de 'maxi' y 'leon' al admin...");
    const [usersToDelete] = await pool.query(
      "SELECT id_usuario FROM usuario WHERE nombre_usuario IN ('maxi', 'leon')"
    );
    
    if (usersToDelete.length > 0) {
      const ids = usersToDelete.map(u => u.id_usuario);
      await pool.query(
        `UPDATE casos SET id_usuario = ? WHERE id_usuario IN (${ids.join(',')})`,
        [adminId]
      );
      console.log(`✅ Casos reasignados.`);

      // 3. Eliminar usuarios
      console.log("🗑️  Eliminando usuarios 'maxi' y 'leon'...");
      const [deleteResult] = await pool.query(
        `DELETE FROM usuario WHERE id_usuario IN (${ids.join(',')})`
      );
      console.log(`✅ Eliminados ${deleteResult.affectedRows} usuarios.`);
    } else {
      console.log("ℹ️  No se encontraron los usuarios 'maxi' o 'leon'.");
    }

    // 4. Asegurar usuario operador
    const operPass = await bcrypt.hash("oper1234", 10);
    const [operRows] = await pool.query("SELECT id_usuario FROM usuario WHERE nombre_usuario = 'operador'");
    
    if (operRows.length === 0) {
      console.log("✨ Creando usuario 'operador'...");
      await pool.query(
        "INSERT INTO usuario (nombre_usuario, password, id_rol) VALUES (?, ?, ?)",
        ["operador", operPass, 2]
      );
    } else {
      console.log("🔄 Actualizando usuario 'operador'...");
      await pool.query(
        "UPDATE usuario SET password = ?, id_rol = 2 WHERE nombre_usuario = 'operador'",
        [operPass]
      );
    }

    console.log("✅ Seeding completado con éxito.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error durante el seeding:", error);
    process.exit(1);
  }
};

seedUsers();

import pool from "../config/db.js";

async function runMigration() {
    try {
        console.log("Iniciando migración...");

        // Verificar si la columna ya existe
        const [columns] = await pool.query("SHOW COLUMNS FROM casos LIKE 'deleted_at'");

        if (columns.length > 0) {
            console.log("La columna 'deleted_at' ya existe en la tabla 'casos'.");
        } else {
            await pool.query("ALTER TABLE casos ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL");
            console.log("Columna 'deleted_at' agregada correctamente a la tabla 'casos'.");
        }

        process.exit(0);
    } catch (error) {
        console.error("Error durante la migración:", error);
        process.exit(1);
    }
}

runMigration();

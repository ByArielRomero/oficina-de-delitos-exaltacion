import pool from "../config/db.js";

async function runMigration() {
    try {
        console.log("Iniciando migración masiva...");

        const tables = ['persona', 'zona', 'delito'];

        for (const table of tables) {
            // Verificar si la columna ya existe
            const [columns] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE 'deleted_at'`);

            if (columns.length > 0) {
                console.log(`La columna 'deleted_at' ya existe en la tabla '${table}'.`);
            } else {
                await pool.query(`ALTER TABLE ${table} ADD COLUMN deleted_at DATETIME NULL DEFAULT NULL`);
                console.log(`Columna 'deleted_at' agregada correctamente a la tabla '${table}'.`);
            }
        }

        console.log("Migración completada.");
        process.exit(0);
    } catch (error) {
        console.error("Error durante la migración:", error);
        process.exit(1);
    }
}

runMigration();

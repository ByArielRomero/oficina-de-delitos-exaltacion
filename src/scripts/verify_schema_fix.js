import pool from "../config/db.js";

async function verifySchema() {
    try {
        console.log("Verificando esquema de base de datos...");
        const tables = ['casos', 'persona', 'zona', 'delito'];
        let allGood = true;

        for (const table of tables) {
            const [columns] = await pool.query(`SHOW COLUMNS FROM ${table} LIKE 'deleted_at'`);
            if (columns.length > 0) {
                console.log(`✅ Tabla '${table}' tiene la columna 'deleted_at'.`);
            } else {
                console.error(`❌ Tabla '${table}' NO tiene la columna 'deleted_at'.`);
                allGood = false;
            }
        }

        if (allGood) {
            console.log("Todas las tablas verificadas correctamente.");
            process.exit(0);
        } else {
            console.error("Faltan columnas en algunas tablas.");
            process.exit(1);
        }
    } catch (error) {
        console.error("Error durante la verificación:", error);
        process.exit(1);
    }
}

verifySchema();

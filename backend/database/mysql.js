const mysql = require('mysql2/promise');

// Configuration
const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'supplier_monitor',
    waitForConnections: true,
    connectionLimit: 10
};

let pool = null;

const getDb = () => {
    if (!pool) {
        pool = mysql.createPool(config);
        console.log('✅ Base de données connectée');
    }
    return pool;
};

// Fonction utilitaire pour exécuter des requêtes
const query = async (sql, params = []) => {
    const db = getDb();
    const [rows] = await db.execute(sql, params);
    return rows;
};

module.exports = { getDb, query };
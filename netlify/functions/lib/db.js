const mysql = require('mysql2/promise');

let pool;

function getPool() {
    if (!pool) {
        pool = mysql.createPool({
            host:               process.env.DB_HOST     || 'localhost',
            port:               parseInt(process.env.DB_PORT || '3306', 10),
            user:               process.env.DB_USER,
            password:           process.env.DB_PASSWORD,
            database:           process.env.DB_NAME     || 'glucosa_bienestar',
            waitForConnections: true,
            connectionLimit:    5,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });
    }
    return pool;
}

module.exports = { getPool };

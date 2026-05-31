const { getPool } = require('./lib/db');

const CORS = {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Allow-Methods':'POST, OPTIONS'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
    if (event.httpMethod !== 'POST')
        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Método no permitido' }) };

    try {
        const { email, nombre } = JSON.parse(event.body || '{}');

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Email inválido.' }) };

        const pool = getPool();

        // INSERT IGNORE ignora el UNIQUE KEY — si ya existe, no falla
        await pool.query(
            'INSERT IGNORE INTO notificaciones_apk (email, nombre) VALUES (?, ?)',
            [email.toLowerCase().trim(), nombre ? nombre.trim() : null]
        );

        return {
            statusCode: 200,
            headers: CORS,
            body: JSON.stringify({ ok: true, message: '¡Listo! Te avisaremos por correo cuando el APK esté disponible.' })
        };

    } catch (err) {
        console.error('notify-apk error:', err);
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Error interno del servidor.' }) };
    }
};

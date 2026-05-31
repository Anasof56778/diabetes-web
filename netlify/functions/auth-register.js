const bcrypt  = require('bcryptjs');
const crypto  = require('crypto');
const { getPool }               = require('./lib/db');
const { sendVerificationEmail } = require('./lib/mailer');

const CORS = {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':'Content-Type',
    'Access-Control-Allow-Methods':'POST, OPTIONS'
};

function generateCode() {
    return String(Math.floor(100000 + crypto.randomInt(900000)));
}

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
    if (event.httpMethod !== 'POST')
        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Método no permitido' }) };

    try {
        const { nombre, email, password, telefono } = JSON.parse(event.body || '{}');

        // --- Validaciones de entrada ---
        if (!nombre || !email || !password)
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Nombre, email y contraseña son requeridos.' }) };

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Formato de email inválido.' }) };

        if (password.length < 8)
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'La contraseña debe tener mínimo 8 caracteres.' }) };

        if (nombre.trim().length < 2)
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Nombre demasiado corto.' }) };

        const pool       = getPool();
        const emailClean = email.toLowerCase().trim();

        // --- Verificar si el email ya existe ---
        const [existing] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [emailClean]);
        if (existing.length > 0)
            return { statusCode: 409, headers: CORS, body: JSON.stringify({ error: 'Este email ya está registrado.' }) };

        // --- Hash de contraseña (bcrypt 12 rondas) ---
        const passwordHash = await bcrypt.hash(password, 12);

        // --- Crear usuario ---
        const [result] = await pool.query(
            'INSERT INTO usuarios (nombre, email, password_hash, telefono) VALUES (?, ?, ?, ?)',
            [nombre.trim(), emailClean, passwordHash, telefono || null]
        );
        const userId = result.insertId;

        // --- Generar código de verificación de email ---
        const code     = generateCode();
        const codeHash = await bcrypt.hash(code, 10);
        const expiry   = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

        await pool.query(
            'INSERT INTO codigos_verificacion (usuario_id, codigo_hash, tipo, expira_en) VALUES (?, ?, "email_verificacion", ?)',
            [userId, codeHash, expiry]
        );

        // --- Enviar email (no bloquea si falla) ---
        try {
            await sendVerificationEmail(emailClean, nombre.trim(), code);
        } catch (mailErr) {
            console.error('Error enviando email de verificación:', mailErr.message);
        }

        return {
            statusCode: 201,
            headers: CORS,
            body: JSON.stringify({
                ok:      true,
                userId,
                message: 'Cuenta creada. Revisa tu correo para verificar tu cuenta.'
            })
        };

    } catch (err) {
        console.error('auth-register error:', err);
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Error interno del servidor.' }) };
    }
};

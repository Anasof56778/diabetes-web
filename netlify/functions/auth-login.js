const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { getPool }        = require('./lib/db');
const { send2FAEmail }   = require('./lib/mailer');

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
        const { email, password } = JSON.parse(event.body || '{}');

        if (!email || !password)
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Email y contraseña requeridos.' }) };

        const pool       = getPool();
        const emailClean = email.toLowerCase().trim();

        const [rows] = await pool.query(
            'SELECT id, nombre, email, password_hash, dos_pasos_activo, verificado, activo, rol FROM usuarios WHERE email = ?',
            [emailClean]
        );

        // Respuesta genérica para no revelar si el email existe
        if (rows.length === 0) {
            await bcrypt.hash('dummy_prevent_timing', 12); // timing-safe: evitar enumeración de usuarios
            return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Credenciales incorrectas.' }) };
        }

        const user = rows[0];

        if (!user.activo)
            return { statusCode: 403, headers: CORS, body: JSON.stringify({ error: 'Cuenta desactivada. Contacta al administrador.' }) };

        const passwordOk = await bcrypt.compare(password, user.password_hash);
        if (!passwordOk)
            return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Credenciales incorrectas.' }) };

        // Actualizar último acceso
        await pool.query('UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?', [user.id]);

        // --- Verificación en 2 pasos activa ---
        if (user.dos_pasos_activo) {
            const code     = generateCode();
            const codeHash = await bcrypt.hash(code, 10);
            const expiry   = new Date(Date.now() + 10 * 60 * 1000);

            // Invalidar códigos 2FA previos no usados
            await pool.query(
                'UPDATE codigos_verificacion SET usado = 1 WHERE usuario_id = ? AND tipo = "2fa" AND usado = 0',
                [user.id]
            );

            await pool.query(
                'INSERT INTO codigos_verificacion (usuario_id, codigo_hash, tipo, expira_en) VALUES (?, ?, "2fa", ?)',
                [user.id, codeHash, expiry]
            );

            try {
                await send2FAEmail(user.email, user.nombre, code);
            } catch (mailErr) {
                console.error('Error enviando código 2FA:', mailErr.message);
            }

            // Token temporal (solo para completar el paso 2FA, no da acceso)
            const tempToken = jwt.sign(
                { sub: user.id, step: '2fa' },
                process.env.JWT_SECRET,
                { expiresIn: '15m', jwtid: crypto.randomUUID() }
            );

            return {
                statusCode: 200,
                headers: CORS,
                body: JSON.stringify({
                    requires2fa: true,
                    tempToken,
                    emailHint: user.email.replace(/(.{2})[^@]+(@.+)/, '$1****$2'),
                    message:   'Código enviado a tu correo electrónico.'
                })
            };
        }

        // --- Sin 2FA: emitir JWT de sesión completo ---
        const jti   = crypto.randomUUID();
        const token = jwt.sign(
            { sub: user.id, email: user.email, rol: user.rol, jti },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Guardar sesión en BD
        const expiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await pool.query(
            'INSERT INTO sesiones (usuario_id, token_jti, ip, user_agent, expira_en) VALUES (?, ?, ?, ?, ?)',
            [user.id, jti, event.headers['x-forwarded-for'] || null, event.headers['user-agent'] || null, expiry]
        );

        return {
            statusCode: 200,
            headers: CORS,
            body: JSON.stringify({
                ok:    true,
                token,
                user:  { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol }
            })
        };

    } catch (err) {
        console.error('auth-login error:', err);
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Error interno del servidor.' }) };
    }
};

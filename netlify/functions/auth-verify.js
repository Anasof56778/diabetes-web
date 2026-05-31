const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { getPool }                    = require('./lib/db');
const { sendPasswordResetEmail }     = require('./lib/mailer');

const CORS = {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':'Content-Type, Authorization',
    'Access-Control-Allow-Methods':'POST, OPTIONS'
};

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers: CORS, body: '' };
    if (event.httpMethod !== 'POST')
        return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: 'Método no permitido' }) };

    try {
        const { code, tempToken, tipo } = JSON.parse(event.body || '{}');

        if (!code || !tempToken)
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Código y token requeridos.' }) };

        const tipoVerif = tipo || '2fa';
        if (!['2fa', 'email_verificacion', 'recuperacion_password'].includes(tipoVerif))
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Tipo de verificación inválido.' }) };

        // Verificar token temporal
        let payload;
        try {
            payload = jwt.verify(tempToken, process.env.JWT_SECRET);
        } catch {
            return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Token expirado o inválido. Vuelve a iniciar sesión.' }) };
        }

        if (payload.step !== '2fa' && tipoVerif === '2fa')
            return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: 'Token inválido para esta operación.' }) };

        const pool = getPool();

        // Obtener el código válido más reciente
        const [codes] = await pool.query(
            `SELECT id, codigo_hash, intentos
             FROM codigos_verificacion
             WHERE usuario_id = ? AND tipo = ? AND usado = 0 AND expira_en > NOW()
             ORDER BY created_at DESC LIMIT 1`,
            [payload.sub, tipoVerif]
        );

        if (codes.length === 0)
            return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: 'Código expirado o ya usado. Solicita uno nuevo.' }) };

        const record = codes[0];

        // Bloquear tras 5 intentos fallidos
        if (record.intentos >= 5) {
            await pool.query('UPDATE codigos_verificacion SET usado = 1 WHERE id = ?', [record.id]);
            return { statusCode: 429, headers: CORS, body: JSON.stringify({ error: 'Demasiados intentos. Solicita un nuevo código.' }) };
        }

        const codeOk = await bcrypt.compare(code.trim(), record.codigo_hash);

        if (!codeOk) {
            await pool.query('UPDATE codigos_verificacion SET intentos = intentos + 1 WHERE id = ?', [record.id]);
            const remaining = 4 - record.intentos;
            return {
                statusCode: 401,
                headers: CORS,
                body: JSON.stringify({ error: `Código incorrecto. ${remaining} intento(s) restante(s).` })
            };
        }

        // Código correcto — marcar como usado
        await pool.query('UPDATE codigos_verificacion SET usado = 1 WHERE id = ?', [record.id]);

        // --- Verificación de email ---
        if (tipoVerif === 'email_verificacion') {
            await pool.query('UPDATE usuarios SET verificado = 1 WHERE id = ?', [payload.sub]);
            return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, message: 'Email verificado correctamente. Ya puedes iniciar sesión.' }) };
        }

        // --- Recuperación de contraseña: emitir token de reset ---
        if (tipoVerif === 'recuperacion_password') {
            const resetToken = jwt.sign(
                { sub: payload.sub, step: 'reset_password' },
                process.env.JWT_SECRET,
                { expiresIn: '15m', jwtid: crypto.randomUUID() }
            );
            return { statusCode: 200, headers: CORS, body: JSON.stringify({ ok: true, resetToken, message: 'Código válido. Ahora puedes cambiar tu contraseña.' }) };
        }

        // --- 2FA verificado: emitir JWT de sesión completo ---
        const [users] = await pool.query(
            'SELECT id, nombre, email, rol FROM usuarios WHERE id = ?',
            [payload.sub]
        );
        const user = users[0];

        const jti   = crypto.randomUUID();
        const token = jwt.sign(
            { sub: user.id, email: user.email, rol: user.rol, jti },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Guardar sesión
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
        console.error('auth-verify error:', err);
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: 'Error interno del servidor.' }) };
    }
};

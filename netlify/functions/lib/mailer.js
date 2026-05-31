const nodemailer = require('nodemailer');

function getTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS  // Contraseña de aplicación de Google
        }
    });
}

const BASE_STYLE = `
  font-family: 'Segoe UI', Arial, sans-serif;
  max-width: 480px;
  margin: auto;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e8eaf0;
`;
const HEADER_STYLE = `
  background: linear-gradient(135deg,#2751A3,#4FC0C5);
  padding: 24px 32px;
  text-align: center;
`;
const BODY_STYLE  = 'padding: 28px 32px; color: #333;';
const CODE_STYLE  = `
  font-size: 2rem;
  font-weight: bold;
  letter-spacing: 10px;
  color: #2751A3;
  background: #f0f4ff;
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
`;
const FOOTER_STYLE = `
  background: #f8f9fa;
  padding: 14px 32px;
  text-align: center;
  font-size: .78rem;
  color: #999;
`;

function buildEmail(title, bodyHtml) {
    return `
    <div style="${BASE_STYLE}">
      <div style="${HEADER_STYLE}">
        <img src="https://gbsmart.netlify.app/img/Logo.png" alt="GB SMART"
             style="height:40px;filter:brightness(0) invert(1);margin-bottom:8px;" onerror="this.style.display='none'">
        <h2 style="color:#fff;margin:0;font-size:1.1rem;">${title}</h2>
      </div>
      <div style="${BODY_STYLE}">${bodyHtml}</div>
      <div style="${FOOTER_STYLE}">
        GB SMART · Proyecto Universitario ITTLA 2026<br>
        Este mensaje fue generado automáticamente, no respondas a este correo.
      </div>
    </div>`;
}

async function sendVerificationEmail(email, nombre, code) {
    const html = buildEmail('Verifica tu cuenta', `
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Gracias por registrarte en <strong>GB SMART</strong>. Tu código de verificación es:</p>
      <div style="${CODE_STYLE}">${code}</div>
      <p style="color:#666;font-size:.9rem;">
        Este código expira en <strong>10 minutos</strong>.<br>
        Si no creaste esta cuenta, ignora este mensaje.
      </p>`);

    return getTransporter().sendMail({
        from:    `"GB SMART" <${process.env.SMTP_USER}>`,
        to:      email,
        subject: 'Verifica tu cuenta – GB SMART',
        html
    });
}

async function send2FAEmail(email, nombre, code) {
    const html = buildEmail('Código de acceso', `
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Tu código de verificación en <strong>2 pasos</strong> es:</p>
      <div style="${CODE_STYLE}">${code}</div>
      <p style="color:#666;font-size:.9rem;">
        Expira en <strong>10 minutos</strong>.<br>
        Si no fuiste tú, cambia tu contraseña de inmediato.
      </p>`);

    return getTransporter().sendMail({
        from:    `"GB SMART" <${process.env.SMTP_USER}>`,
        to:      email,
        subject: 'Tu código de acceso – GB SMART',
        html
    });
}

async function sendPasswordResetEmail(email, nombre, code) {
    const html = buildEmail('Recuperar contraseña', `
      <p>Hola <strong>${nombre}</strong>,</p>
      <p>Recibimos una solicitud para restablecer tu contraseña. Tu código es:</p>
      <div style="${CODE_STYLE}">${code}</div>
      <p style="color:#666;font-size:.9rem;">
        Expira en <strong>10 minutos</strong>.<br>
        Si no solicitaste esto, ignora este mensaje.
      </p>`);

    return getTransporter().sendMail({
        from:    `"GB SMART" <${process.env.SMTP_USER}>`,
        to:      email,
        subject: 'Recuperar contraseña – GB SMART',
        html
    });
}

module.exports = { sendVerificationEmail, send2FAEmail, sendPasswordResetEmail };

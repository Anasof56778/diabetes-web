/* ============================================================
   GB SMART — script.js
   Módulos: Navbar · AOS · Chart.js · Chat IA · Modal Recetas · Scroll Top
============================================================ */

/* ── NAVBAR: scroll effect + hamburger menu ── */
(function initNavbar() {
    const navbar    = document.getElementById('navbar');
    const hamburger = document.getElementById('hamburger');
    const navMenu   = document.getElementById('navMenu');
    const navLinks  = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
        updateActiveLink();
        toggleBackToTop();
    }, { passive: true });

    hamburger.addEventListener('click', () => {
        const open = navMenu.classList.toggle('open');
        hamburger.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open);
    });

    /* Cierra el menú al hacer clic en cualquier enlace */
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    /* Marca el enlace activo según la sección visible */
    function updateActiveLink() {
        const sections = document.querySelectorAll('section[id]');
        let currentId = '';
        sections.forEach(s => {
            if (window.scrollY >= s.offsetTop - 100) currentId = s.id;
        });
        navLinks.forEach(l => {
            l.classList.toggle('active', l.getAttribute('href') === '#' + currentId);
        });
    }
})();

/* ── BACK TO TOP ── */
function toggleBackToTop() {
    const btn = document.getElementById('backToTop');
    if (btn) btn.classList.toggle('visible', window.scrollY > 400);
}
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── AOS (Animate On Scroll) — implementación ligera ── */
(function initAOS() {
    const elements = document.querySelectorAll('[data-aos]');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));
})();

/* ── GRÁFICA DE DIABETES (Chart.js) ── */
(function initChart() {
    const canvas = document.getElementById('diabetesChart');
    if (!canvas) return;

    const years            = ['2015','2016','2017','2018','2019','2020','2021','2022','2023','2024','2025'];
    const diagnosticados   = [9.2, 9.6, 10.1, 10.5, 11.0, 11.3, 11.8, 12.4, 12.9, 13.3, 13.7];
    const nodiagnosticados = [8.5, 9.0, 9.4, 9.8, 10.2, 10.5, 11.0, 11.5, 12.0, 12.4, 12.8];

    new Chart(canvas, {
        type: 'line',
        data: {
            labels: years,
            datasets: [
                {
                    label: 'Casos diagnosticados (millones)',
                    data: diagnosticados,
                    borderColor: '#2751A3',
                    backgroundColor: 'rgba(39,81,163,.08)',
                    borderWidth: 3,
                    pointBackgroundColor: '#2751A3',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true,
                },
                {
                    label: 'Estimado no diagnosticado (millones)',
                    data: nodiagnosticados,
                    borderColor: '#FFC30B',
                    backgroundColor: 'rgba(255,195,11,.07)',
                    borderWidth: 3,
                    borderDash: [6, 4],
                    pointBackgroundColor: '#FFC30B',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.4,
                    fill: true,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#0d1a35',
                    titleColor: '#FFC30B',
                    bodyColor: 'rgba(255,255,255,.85)',
                    padding: 12,
                    cornerRadius: 10,
                    callbacks: {
                        label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}M`
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(39,81,163,.06)' },
                    ticks: { color: '#6b7280', font: { size: 11 } }
                },
                y: {
                    grid: { color: 'rgba(39,81,163,.06)' },
                    ticks: {
                        color: '#6b7280',
                        font: { size: 11 },
                        callback: v => v + 'M'
                    },
                    min: 7,
                    max: 16,
                }
            }
        }
    });
})();

/* ── CHAT IA — CLAUDE API (via Netlify Function) ── */

/* Estado */
let chatHistory = [];
let isBotTyping = false;

/* Llama a la Netlify Function — la API key nunca sale del servidor */
async function callChatAPI(userText) {
    chatHistory.push({ role: 'user', content: userText });

    const res = await fetch('/.netlify/functions/chat', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ messages: chatHistory })
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Error ${res.status}`);
    }

    const data  = await res.json();
    const reply = data.content;
    chatHistory.push({ role: 'assistant', content: reply });
    return reply;
}

/* Markdown basico a HTML seguro contra XSS */
function markdownToHtml(rawText) {
    let s = rawText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '<em>$1</em>')
        .replace(/`([^`\n]+)`/g, '<code>$1</code>')
        .replace(/^[-•*]\s+(.+)$/gm, '<li>$1</li>');

    const lines = s.split('\n');
    const out   = [];
    let inList  = false;
    for (const line of lines) {
        if (line.startsWith('<li>')) {
            if (!inList) { out.push('<ul>'); inList = true; }
            out.push(line);
        } else {
            if (inList) { out.push('</ul>'); inList = false; }
            out.push(line);
        }
    }
    if (inList) out.push('</ul>');
    s = out.join('\n');

    return s.split(/\n{2,}/)
        .map(b => b.trim())
        .filter(Boolean)
        .map(b => /^<[uol]/.test(b) ? b : `<p>${b.replace(/\n/g, '<br>')}</p>`)
        .join('');
}

/* Respuestas predefinidas — fallback si falla la API */
const botResponses = {
    '¿qué es la diabetes tipo 2?': `
        <p>La <strong>Diabetes Tipo 2</strong> es una enfermedad crónica en la que el cuerpo no utiliza correctamente la insulina, lo que provoca niveles elevados de glucosa en sangre.</p>
        <p>A diferencia de la Tipo 1, en la Tipo 2 el páncreas sí produce insulina, pero las células del cuerpo desarrollan <strong>resistencia a ella</strong>.</p>
        <p>Los factores de riesgo incluyen: sobrepeso, vida sedentaria, antecedentes familiares y edad mayor de 30 años. ¡La buena noticia es que es prevenible! 💪</p>
    `,
    '¿cómo registro mi glucosa?': `
        <p>Registrar tu glucosa en GB SMART es muy sencillo:</p>
        <p>1️⃣ Abre la app y toca el botón <strong>"Registrar"</strong> en la pantalla principal.</p>
        <p>2️⃣ Ingresa el valor de tu glucemia (en mg/dL) obtenido con tu glucómetro.</p>
        <p>3️⃣ Selecciona el momento del día (ayunas, posprandial, etc.).</p>
        <p>4️⃣ La app clasificará automáticamente tu valor y te dará retroalimentación inmediata. ✅</p>
    `,
    '¿qué alimentos debo evitar?': `
        <p>Para mantener niveles de glucosa estables, se recomienda <strong>limitar o evitar</strong>:</p>
        <p>🚫 Azúcares refinados: refrescos, jugos industriales, dulces y pasteles.</p>
        <p>🚫 Harinas blancas: pan blanco, arroz blanco, tortillas de harina refinada.</p>
        <p>🚫 Alimentos ultra-procesados: frituras, embutidos, comida rápida.</p>
        <p>✅ Prefiere frutas enteras, verduras, legumbres, granos integrales y proteína magra.</p>
    `,
    '¿cómo funciona la app?': `
        <p><strong>GB SMART</strong> funciona en tres pasos principales:</p>
        <p>📊 <strong>Monitoreo:</strong> Registra tu glucosa, peso y actividad física diariamente.</p>
        <p>🤖 <strong>Análisis IA:</strong> La app analiza tus datos y detecta patrones o tendencias.</p>
        <p>💡 <strong>Recomendaciones:</strong> Recibe sugerencias personalizadas de nutrición, ejercicio y bienestar.</p>
        <p>También puedes compartir reportes con tu médico con un solo clic. ¡Todo en tu celular! 📱</p>
    `,
    '¿cuáles son los síntomas de la diabetes?': `
        <p>Los síntomas más comunes de la Diabetes Tipo 2 incluyen:</p>
        <p>🔸 Sed excesiva (polidipsia) y aumento en las ganas de orinar.</p>
        <p>🔸 Cansancio y fatiga sin causa aparente.</p>
        <p>🔸 Visión borrosa y heridas que tardan en sanar.</p>
        <p>🔸 Hormigueo o entumecimiento en manos y pies.</p>
        <p>⚠️ Muchos casos son <strong>asintomáticos al inicio</strong>. Por eso el monitoreo preventivo con GB SMART es clave.</p>
    `,
    '¿qué ejercicio es recomendable?': `
        <p>El ejercicio es uno de los mejores aliados para controlar la glucosa. Se recomienda:</p>
        <p>🏃 <strong>Aeróbico:</strong> Caminar, nadar o andar en bicicleta 30 minutos, 5 días a la semana.</p>
        <p>💪 <strong>Fuerza:</strong> Ejercicios de resistencia 2-3 veces por semana para mejorar la sensibilidad a la insulina.</p>
        <p>🧘 <strong>Flexibilidad:</strong> Yoga o estiramientos para reducir el estrés y mejorar el bienestar general.</p>
        <p>Consulta con tu médico antes de iniciar cualquier rutina nueva. GB SMART puede ayudarte a llevar el registro.</p>
    `,
    'default': `
        <p>Gracias por tu pregunta. Como <strong>DiabetBot</strong>, puedo ayudarte con temas de:</p>
        <p>• Diabetes tipo 2 y su prevención<br>• Registro y monitoreo de glucosa<br>• Nutrición y alimentos recomendados<br>• Ejercicio y hábitos saludables<br>• Uso de la aplicación GB SMART</p>
        <p>¿Puedes reformular tu pregunta? Estoy aquí para ayudarte. 😊</p>
    `
};

function getBotResponse(userText) {
    const key = userText.toLowerCase().trim();
    for (const pattern in botResponses) {
        if (pattern !== 'default' && key.includes(pattern.replace('¿', '').replace('?', ''))) {
            return botResponses[pattern];
        }
    }
    if (/síntoma|symptom|señal/.test(key))             return botResponses['¿cuáles son los síntomas de la diabetes?'];
    if (/ejercicio|actividad|deporte/.test(key))        return botResponses['¿qué ejercicio es recomendable?'];
    if (/alimento|comida|dieta|comer|evitar/.test(key)) return botResponses['¿qué alimentos debo evitar?'];
    if (/registr|glucosa|medir|medición/.test(key))     return botResponses['¿cómo registro mi glucosa?'];
    if (/app|aplicación|funciona|usar/.test(key))       return botResponses['¿cómo funciona la app?'];
    if (/diabetes|tipo 2|enfermedad/.test(key))         return botResponses['¿qué es la diabetes tipo 2?'];
    return botResponses['default'];
}

function getNow() {
    return new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(html, sender) {
    const container = document.getElementById('chatMessages');
    if (!container) return;
    const wrap = document.createElement('div');
    wrap.className = `cmsg cmsg-${sender}`;
    if (sender === 'bot') {
        wrap.innerHTML = `
            <div class="cmsg-avatar"><i class="fas fa-robot"></i></div>
            <div class="cmsg-bubble">${html}<span class="cmsg-time">${getNow()}</span></div>
        `;
    } else {
        wrap.innerHTML = `
            <div class="cmsg-bubble">${html}<span class="cmsg-time">${getNow()}</span></div>
        `;
    }
    container.appendChild(wrap);
    container.scrollTop = container.scrollHeight;
}

function showTyping() {
    const container = document.getElementById('chatMessages');
    if (!container) return null;
    const typing = document.createElement('div');
    typing.className = 'cmsg cmsg-bot typing-indicator';
    typing.id = 'typingIndicator';
    typing.innerHTML = `
        <div class="cmsg-avatar"><i class="fas fa-robot"></i></div>
        <div class="cmsg-bubble">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
    return typing;
}

function removeTyping() {
    const t = document.getElementById('typingIndicator');
    if (t) t.remove();
}

function hideQuickReplies() {
    const qr = document.getElementById('quickReplies');
    if (qr) qr.style.display = 'none';
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    if (!input || isBotTyping) return;
    const text = input.value.trim();
    if (!text) return;

    hideQuickReplies();
    appendMessage(`<p>${escapeHtml(text)}</p>`, 'user');
    input.value = '';
    input.disabled = true;
    isBotTyping = true;

    showTyping();

    try {
        const reply = await callChatAPI(text);
        removeTyping();
        appendMessage(markdownToHtml(reply), 'bot');
    } catch (err) {
        removeTyping();
        console.error('DiabetBot error:', err);
        appendMessage(
            `<p>⚠️ Sin conexión con el asistente IA. Mostrando respuesta de ejemplo...</p>`,
            'bot'
        );
        await new Promise(r => setTimeout(r, 600));
        appendMessage(getBotResponse(text), 'bot');
    } finally {
        input.disabled = false;
        input.focus();
        isBotTyping = false;
    }
}

function sendQuickReply(text) {
    const input = document.getElementById('chatInput');
    if (input) input.value = text;
    sendMessage();
}

function handleEnter(event) {
    if (event.key === 'Enter') sendMessage();
}

function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── MODAL RECETAS ── */
const recetaData = {
    mediterranea: {
        title: 'Ensalada Mediterránea con Quinoa',
        img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=560&h=220&fit=crop',
        tiempo: '15 min',
        calorias: '280 kcal',
        porciones: '2 porciones',
        ingredientes: [
            '1 taza de quinoa cocida',
            '2 tazas de espinacas baby',
            '1 taza de tomates cherry partidos a la mitad',
            '1/2 pepino en rodajas',
            '1/4 de cebolla morada en juliana',
            '2 cdas de aceite de oliva extra virgen',
            'Jugo de 1 limón',
            'Sal, pimienta y orégano al gusto',
            '30 g de queso feta (opcional)'
        ],
        pasos: [
            'Cocina la quinoa según las instrucciones del empaque y deja enfriar.',
            'Lava y seca bien las espinacas, tomates, pepino y cebolla.',
            'En un tazón grande, mezcla la quinoa fría con las verduras.',
            'Prepara el aderezo con aceite de oliva, jugo de limón, sal, pimienta y orégano.',
            'Vierte el aderezo sobre la ensalada y mezcla suavemente.',
            'Refrigera 10 minutos antes de servir. Agrega el queso feta justo al servir.'
        ],
        beneficio: 'La quinoa tiene un bajo índice glucémico y es rica en fibra y proteína completa, lo que ayuda a mantener niveles de glucosa estables por más tiempo.'
    },
    avena: {
        title: 'Avena con Frutos Rojos y Chía',
        img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=560&h=220&fit=crop',
        tiempo: '10 min',
        calorias: '320 kcal',
        porciones: '1 porción',
        ingredientes: [
            '1/2 taza de avena integral en hojuelas',
            '1 taza de leche descremada o bebida vegetal',
            '1/2 taza de arándanos frescos o congelados',
            '1/2 taza de frambuesas',
            '1 cda de semillas de chía',
            '1/2 cdita de canela en polvo',
            'Endulzante natural al gusto (stevia o miel de agave)',
            'Nueces picadas al gusto (opcional)'
        ],
        pasos: [
            'Calienta la leche a fuego medio en una cacerola pequeña.',
            'Agrega la avena y la canela. Revuelve constantemente.',
            'Cocina 4-5 minutos hasta obtener la consistencia deseada.',
            'Retira del fuego y agrega el endulzante natural.',
            'Sirve en un tazón y cubre con los frutos rojos.',
            'Espolvorea las semillas de chía encima y sirve de inmediato.'
        ],
        beneficio: 'La avena integral es rica en betaglucanos, un tipo de fibra soluble que reduce la absorción de glucosa y ayuda a controlar el colesterol. La canela también favorece la sensibilidad a la insulina.'
    },
    salmon: {
        title: 'Salmón al Vapor con Verduras',
        img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=560&h=220&fit=crop',
        tiempo: '25 min',
        calorias: '420 kcal',
        porciones: '2 porciones',
        ingredientes: [
            '2 filetes de salmón fresco (150 g c/u)',
            '1 taza de floretes de brócoli',
            '2 zanahorias medianas en bastones',
            '10 espárragos limpios',
            'Jugo de 1 limón',
            '2 cdas de aceite de oliva',
            'Sal, pimienta negra y eneldo fresco',
            '2 dientes de ajo laminados',
            'Hojas de laurel'
        ],
        pasos: [
            'Prepara la vaporera con agua, hojas de laurel y un chorrito de limón.',
            'Sazona los filetes de salmón con sal, pimienta, eneldo y ajo.',
            'Coloca el salmón en la vaporera y cocina 12-15 minutos.',
            'En la mitad de la cocción, agrega las verduras: brócoli, zanahoria y espárragos.',
            'Prepara una vinagreta ligera con aceite de oliva, limón, sal y pimienta.',
            'Sirve el salmón sobre las verduras y bañar con la vinagreta.'
        ],
        beneficio: 'El salmón es una fuente excepcional de Omega-3, que reduce la inflamación y mejora la sensibilidad a la insulina. El vapor conserva todos los nutrientes sin agregar grasas adicionales.'
    },
    wrap: {
        title: 'Wrap de Pollo con Aguacate',
        img: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=560&h=220&fit=crop',
        tiempo: '20 min',
        calorias: '380 kcal',
        porciones: '2 porciones',
        ingredientes: [
            '200 g de pechuga de pollo a la plancha',
            '2 tortillas integrales de tamaño grande',
            '1 aguacate maduro en rebanadas',
            '1 taza de lechuga romana en tiras',
            '1 tomate mediano en cubos',
            '3 cdas de yogur griego natural sin azúcar',
            'Jugo de 1 limón',
            'Sal, pimienta, comino y cilantro al gusto',
            '1/4 de cebolla morada en julianas finas'
        ],
        pasos: [
            'Sazona y cocina la pechuga de pollo a la plancha. Deja reposar 5 min y corta en tiras.',
            'Mezcla el yogur griego con jugo de limón, sal, pimienta y comino para la salsa.',
            'Calienta las tortillas integrales en un comal sin aceite, 30 segundos por lado.',
            'Extiende la salsa de yogur sobre la tortilla.',
            'Coloca la lechuga, el pollo, el aguacate, el tomate y la cebolla.',
            'Enrolla firmemente el wrap y corta a la mitad. Sirve de inmediato.'
        ],
        beneficio: 'La tortilla integral tiene mayor contenido de fibra que la de harina blanca, lo que ralentiza la absorción de carbohidratos. El aguacate aporta grasas monoinsaturadas que mejoran la sensibilidad a la insulina.'
    }
};

function openReceta(id) {
    const data = recetaData[id];
    if (!data) return;

    const content = document.getElementById('modalContent');
    if (!content) return;

    content.innerHTML = `
        <h2 class="modal-recipe-title">${data.title}</h2>
        <div class="modal-recipe-meta">
            <span><i class="fas fa-clock"></i> ${data.tiempo}</span>
            <span><i class="fas fa-fire-alt"></i> ${data.calorias}</span>
            <span><i class="fas fa-users"></i> ${data.porciones}</span>
        </div>
        <img class="modal-recipe-img" src="${data.img}" alt="${data.title}" loading="lazy">

        <p class="modal-section-title"><i class="fas fa-shopping-basket"></i> Ingredientes</p>
        <ul class="modal-ingredient-list">
            ${data.ingredientes.map(i => `<li>${i}</li>`).join('')}
        </ul>

        <p class="modal-section-title"><i class="fas fa-list-ol"></i> Preparación</p>
        <ol class="modal-steps">
            ${data.pasos.map((p, idx) => `
                <li>
                    <span class="step-num">${idx + 1}</span>
                    <span>${p}</span>
                </li>
            `).join('')}
        </ol>

        <div class="modal-benefit">
            <i class="fas fa-heartbeat"></i>
            <p><strong>Beneficio glucémico:</strong> ${data.beneficio}</p>
        </div>
    `;

    document.getElementById('recetaModal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('recetaModal').classList.remove('active');
    document.body.style.overflow = '';
}

/* Cerrar modal al clic en el overlay */
document.getElementById('recetaModal').addEventListener('click', function (e) {
    if (e.target === this) closeModal();
});

/* Cerrar modal con tecla Escape */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
});

/* ── SMOOTH SCROLL para todos los enlaces del nav ── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        const offset = 75;
        window.scrollTo({
            top: target.offsetTop - offset,
            behavior: 'smooth'
        });
    });
});

/* ── ANIMACIÓN DE BARRAS DEL MOCK DE APP (hero) ── */
(function animateBars() {
    const bars = document.querySelectorAll('.amock-bar');
    bars.forEach(bar => {
        const target = bar.style.getPropertyValue('--h');
        bar.style.setProperty('--h', '0%');
        setTimeout(() => {
            bar.style.transition = 'height .8s cubic-bezier(.4,0,.2,1)';
            bar.style.setProperty('--h', target);
        }, 800);
    });
})();

/* ── COUNTER ANIMATION para estadísticas del hero ── */
(function initCounters() {
    const counters = document.querySelectorAll('.hstat-num');
    const seen = new Set();

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting || seen.has(entry.target)) return;
            seen.add(entry.target);
            const el = entry.target;

            if ('noCounter' in el.dataset) return;
            const text = el.textContent.trim();
            if (!/^\d[\d.]*/.test(text)) return;
            const match = text.match(/^(\d[\d.]*)(.*)/);
            if (!match) return;
            const end    = parseFloat(match[1]);
            const suffix = match[2];
            if (isNaN(end)) return;

            const duration = 1400;
            const start = performance.now();
            function step(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                const value = Number.isInteger(end)
                    ? Math.floor(eased * end)
                    : (eased * end).toFixed(1);
                el.textContent = value + suffix;
                if (progress < 1) requestAnimationFrame(step);
            }
            requestAnimationFrame(step);
        });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
})();

/* ── QR CODE ──
   Cambia SITE_URL a tu URL de Netlify una vez que publiques.
------------------------------------------------------------------ */
const SITE_URL = window.location.href.startsWith('file://')
    ? 'https://gbsmart.netlify.app'
    : window.location.origin + window.location.pathname.replace('index.html', '');

(function initQR() {
    const container = document.getElementById('qrCode');
    const urlText   = document.getElementById('qrUrlText');
    const dlBtn     = document.getElementById('qrDownloadBtn');
    if (!container || typeof QRCode === 'undefined') return;

    if (urlText) urlText.textContent = SITE_URL;

    QRCode.toCanvas(document.createElement('canvas'), SITE_URL, {
        width: 180,
        margin: 1,
        color: { dark: '#2751A3', light: '#FFFFFF' }
    }, function (err, canvas) {
        if (err) return;
        container.appendChild(canvas);

        if (dlBtn) {
            dlBtn.addEventListener('click', () => {
                dlBtn.href = canvas.toDataURL('image/png');
            });
        }
    });
})();

/* ── INICIALIZACIÓN ── */
document.addEventListener('DOMContentLoaded', () => {
    toggleBackToTop();
});

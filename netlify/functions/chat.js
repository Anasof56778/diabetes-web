const Groq = require('groq-sdk');

const SYSTEM_PROMPT = `Eres DiabetBot, el asistente virtual de GB SMART — plataforma universitaria del ITTLA para la prevención de Diabetes Tipo 2 en adultos de 30 a 59 años del Estado de México.

Puedes ayudar con:
- Diabetes tipo 2: qué es, síntomas, factores de riesgo y prevención
- Control glucémico y cómo interpretar valores de glucosa
- Nutrición y alimentos que estabilizan o elevan la glucosa
- Ejercicio y hábitos saludables para personas en riesgo o con diabetes
- Cómo usar la aplicación GB SMART
- Estadísticas e impacto de la diabetes en México

Reglas de comportamiento:
- Responde SIEMPRE en español, con empatía y lenguaje claro
- Sé conciso: máximo 3-4 párrafos cortos por respuesta
- Nunca emitas diagnósticos médicos individuales ni prescribas medicamentos
- Si el tema está fuera de salud o diabetes, redirige amablemente
- Al dar información médica, recuerda que no sustituyes la consulta con un profesional de la salud`;

exports.handler = async (event) => {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    if (event.httpMethod !== 'POST') {
        return { statusCode: 405, body: 'Method Not Allowed' };
    }

    try {
        const { messages } = JSON.parse(event.body);

        const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

        const response = await client.chat.completions.create({
            model   : 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                ...messages
            ],
            max_tokens: 1024
        });

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ content: response.choices[0].message.content })
        };
    } catch (err) {
        console.error('DiabetBot error:', err);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ error: err.message })
        };
    }
};

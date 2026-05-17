/**
 * API Endpoint Híbrido: DeepSeek + Claude Haiku
 * Ubicación en Vercel: vercel/api/hybrid.js
 * 
 * Flujo:
 * 1. Recibe: deepseekKey, claudeKey, paecBase64, prompt
 * 2. Paso 1 (DeepSeek): Extrae nombre, objetivo y distribución de sesiones (rápido)
 * 3. Paso 2 (Claude Haiku): Genera JSON estructurado con actividades (preciso)
 * 4. Devuelve: { result: {...JSON completo...} }
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { deepseekKey, claudeKey, paecBase64, prompt } = req.body;

  // DEBUG: Log para verificar qué se recibe
  console.log('=== HYBRID DEBUG ===');
  console.log('DeepSeek Key recibida:', deepseekKey ? `${deepseekKey.substring(0, 10)}...` : 'FALTA');
  console.log('Claude Key recibida:', claudeKey ? `${claudeKey.substring(0, 15)}...` : 'FALTA');
  console.log('PAEC Base64 recibido:', paecBase64 ? `${paecBase64.substring(0, 20)}...` : 'FALTA');
  console.log('Prompt recibido:', prompt ? `${prompt.substring(0, 50)}...` : 'FALTA');
  console.log('==================');

  if (!deepseekKey || !claudeKey || !paecBase64 || !prompt) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // PASO 1: DeepSeek extrae info básica del PAEC
    // ─────────────────────────────────────────────────────────────
    const deepseekPrompt = `Eres un asistente experto en educación media superior.

Un docente ha cargado su PAEC (Proyecto de Aula Educativo Comunitario).

TAREA: Extrae SOLO estos datos (responde SOLO con JSON, sin texto adicional):
{
  "nombre_proyecto": "nombre exacto del proyecto",
  "objetivo_principal": "objetivo central en 1-2 líneas",
  "numero_sesiones_totales": número entero,
  "sesiones_por_progresion": {
    "progresion_1": número de sesiones,
    "progresion_2": número de sesiones
  },
  "observaciones_breves": "cualquier detalle relevante"
}

Si no puedes inferir algo, usa null.`;

    const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${deepseekKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: deepseekPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
        response_format: { type: 'json_object' }
      })
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json();
      throw new Error(`DeepSeek error: ${deepseekResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const deepseekData = await deepseekResponse.json();
    let deepseekExtraction = {};
    
    try {
      const content = deepseekData.choices?.[0]?.message?.content || '{}';
      deepseekExtraction = JSON.parse(content);
    } catch (parseErr) {
      console.error('DeepSeek parse error:', parseErr);
      deepseekExtraction = {
        nombre_proyecto: 'Proyecto (sin nombre)',
        objetivo_principal: 'Objetivo general de aprendizaje',
        numero_sesiones_totales: 0,
        sesiones_por_progresion: {}
      };
    }

    // ─────────────────────────────────────────────────────────────
    // PASO 2: Claude Haiku genera la secuencia completa
    // ─────────────────────────────────────────────────────────────
    
    // Enriquecer el prompt original con la información extraída
    const enrichedPrompt = `${prompt}

[INFORMACIÓN EXTRAÍDA POR DEEPSEEK]
Nombre del Proyecto: ${deepseekExtraction.nombre_proyecto || '(no identificado)'}
Objetivo Principal: ${deepseekExtraction.objetivo_principal || '(no identificado)'}
Sesiones Totales: ${deepseekExtraction.numero_sesiones_totales || 0}
Distribución sugerida: ${JSON.stringify(deepseekExtraction.sesiones_por_progresion || {})}

INSTRUCCIÓN CRÍTICA DE LENGUAJE:
- Escribe como un docente de Telebachillerato Comunitario, no como un académico
- Usa lenguaje coloquial y cercano a adolescentes de comunidades rurales mayas
- Incluye ejemplos concretos de la vida cotidiana local
- Las actividades de inicio deben despertar curiosidad (ej: preguntas provocadoras)
- Las de desarrollo deben ser prácticas y contextualizadas
- Las de cierre deben promover reflexión y síntesis
- Evita vocabulario altamente técnico sin explicación
- Personaliza referencias a la realidad maya, agricultura, naturaleza local, etc.

RESPONDE SOLO CON JSON (sin markdown, sin código blocks, sin explicación adicional).
La estructura debe ser idéntica a la que ya conoces.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Claude Haiku 3.0 (más estable)
        max_tokens: 12000,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'document',
                source: {
                  type: 'base64',
                  media_type: 'application/pdf',
                  data: paecBase64
                },
                title: 'PAEC del docente'
              },
              {
                type: 'text',
                text: enrichedPrompt
              }
            ]
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json();
      console.error('Claude Response Error:', {
        status: claudeResponse.status,
        error: errorData
      });
      throw new Error(`Claude error ${claudeResponse.status}: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const claudeData = await claudeResponse.json();
    let jsonText = claudeData.content.map(b => b.text || '').join('');

    // Limpiar markdown si lo hay
    jsonText = jsonText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let result;
    try {
      result = JSON.parse(jsonText);
    } catch (parseErr) {
      console.error('Claude parse error:', parseErr);
      throw new Error(`No se pudo parsear la respuesta de Claude como JSON. Respuesta: ${jsonText.substring(0, 200)}...`);
    }

    // ─────────────────────────────────────────────────────────────
    // Devolver resultado
    // ─────────────────────────────────────────────────────────────
    return res.status(200).json({
      result,
      metadata: {
        deepseek_extraction: deepseekExtraction,
        model_used: 'claude-3-haiku-20240307',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Hybrid API Error:', error);
    return res.status(500).json({
      error: error.message || 'Error en el procesamiento híbrido',
      details: error.toString()
    });
  }
}

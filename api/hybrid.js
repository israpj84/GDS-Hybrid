/**
 * API Endpoint Híbrido: DeepSeek + Claude Haiku
 * VERSIÓN 2: Extrae texto del PDF, no envía documento
 * 
 * Flujo:
 * 1. DeepSeek: Extrae texto del PDF base64 + metadatos
 * 2. Claude Haiku: Genera secuencia basada en texto extraído
 * 3. Devuelve: JSON estructurado
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { deepseekKey, claudeKey, paecBase64, prompt } = req.body;

  console.log('=== HYBRID HANDLER INICIADO ===');
  console.log('DeepSeek Key:', deepseekKey ? '✓ Recibida' : '✗ Falta');
  console.log('Claude Key:', claudeKey ? '✓ Recibida' : '✗ Falta');
  console.log('PAEC Base64:', paecBase64 ? `✓ Recibido (${paecBase64.length} chars)` : '✗ Falta');

  if (!deepseekKey || !claudeKey || !paecBase64 || !prompt) {
    return res.status(400).json({ error: 'Faltan parámetros requeridos' });
  }

  try {
    // ─────────────────────────────────────────────────────────────
    // PASO 1: DeepSeek extrae TEXTO del PDF (no metadatos solamente)
    // ─────────────────────────────────────────────────────────────

    console.log('\n📝 PASO 1: DeepSeek extrayendo texto del PDF...');

    const deepseekExtractPrompt = `Analiza este PAEC educativo (archivo PDF en base64) y extrae:

1. El texto completo y legible del documento
2. Los metadatos principales (nombre del proyecto, objetivo principal, número de sesiones)

Base64 del PDF (primeros 6000 caracteres):
${paecBase64.substring(0, 6000)}

Responde SOLO con JSON válido, sin markdown:
{
  "texto_completo": "texto completo extraído del PAEC aquí...",
  "nombre_proyecto": "nombre exacto del proyecto",
  "objetivo_principal": "objetivo educativo en 1-2 líneas",
  "numero_sesiones_totales": número,
  "observaciones": "cualquier detalle importante"
}`;

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
            content: deepseekExtractPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 4000
      })
    });

    if (!deepseekResponse.ok) {
      const errorData = await deepseekResponse.json();
      throw new Error(`DeepSeek error: ${deepseekResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const deepseekData = await deepseekResponse.json();
    const deepseekContent = deepseekData.choices?.[0]?.message?.content || '{}';

    console.log('DeepSeek respondió:', deepseekContent.substring(0, 100) + '...');

    let paecExtraction = {};
    try {
      paecExtraction = JSON.parse(deepseekContent);
    } catch (e) {
      console.error('Error parseando respuesta de DeepSeek:', e);
      paecExtraction = {
        texto_completo: 'PAEC (contenido no extraído correctamente)',
        nombre_proyecto: 'Proyecto sin nombre',
        objetivo_principal: 'Objetivo general',
        numero_sesiones_totales: 0
      };
    }

    // ─────────────────────────────────────────────────────────────
    // PASO 2: Claude Haiku genera la secuencia basada en TEXTO
    // ─────────────────────────────────────────────────────────────

    console.log('\n🤖 PASO 2: Claude Haiku generando secuencia...');

    const claudePrompt = `CONTEXTO: Proyecto Educativo (PAEC)
────────────────────────────────────────

Texto del PAEC:
${paecExtraction.texto_completo}

Nombre: ${paecExtraction.nombre_proyecto}
Objetivo: ${paecExtraction.objetivo_principal}
Sesiones: ${paecExtraction.numero_sesiones_totales}

────────────────────────────────────────
INSTRUCCIONES DEL DOCENTE:
${prompt}

────────────────────────────────────────
REQUISITOS CRÍTICOS:

1. Responde SOLO con JSON válido (sin markdown, sin código blocks)
2. Genera actividades prácticas para comunidades rurales mayas de Yucatán
3. Lenguaje coloquial y cercano a estudiantes (no académico)
4. Incluye ejemplos locales (milpa, cenotes, flora/fauna, tradiciones)
5. Actividades deben ser ejecutables sin tecnología avanzada

ESTRUCTURA JSON EXACTA (OBLIGATORIA):

{
  "secuenciaDidactica": [
    {
      "progresiónId": "prog1",
      "progresiónNombre": "Nombre de progresión",
      "sesiones": [
        {
          "numero": 1,
          "titulo": "Título de la sesión",
          "duracion": "50 minutos",
          "actividadInicio": {
            "titulo": "Inicio",
            "descripcion": "Descripción detallada de la actividad",
            "recursos": ["recurso1", "recurso2"],
            "tiempo_minutos": 10
          },
          "actividadDesarrollo": {
            "titulo": "Desarrollo",
            "descripcion": "Descripción detallada",
            "recursos": ["recurso1"],
            "tiempo_minutos": 25
          },
          "actividadCierre": {
            "titulo": "Cierre",
            "descripcion": "Reflexión y síntesis",
            "recursos": [],
            "tiempo_minutos": 15
          },
          "producto": "Producto esperado de la sesión",
          "instrumento": "Instrumento de evaluación"
        }
      ]
    }
  ],
  "paecIntegrado": {
    "nombre": "${paecExtraction.nombre_proyecto}",
    "objetivo": "${paecExtraction.objetivo_principal}",
    "actividadesIntegradas": 0
  }
}

Ahora genera la secuencia didáctica completa en JSON.`;

    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: claudePrompt
          }
        ]
      })
    });

    if (!claudeResponse.ok) {
      const errorData = await claudeResponse.json();
      console.error('Claude Response Error:', errorData);
      throw new Error(`Claude error: ${claudeResponse.status} - ${JSON.stringify(errorData)}`);
    }

    const claudeData = await claudeResponse.json();

    if (!claudeData.content || !Array.isArray(claudeData.content) || claudeData.content.length === 0) {
      throw new Error('Claude devolvió una respuesta vacía');
    }

    let jsonText = claudeData.content.map(b => b.text || '').join('');

    if (!jsonText || jsonText.trim() === '') {
      throw new Error('Claude devolvió contenido vacío');
    }

    console.log('Claude respondió:', jsonText.substring(0, 100) + '...');

    // Limpiar markdown si lo hay
    jsonText = jsonText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    let result;
    try {
      result = JSON.parse(jsonText);
      console.log('✓ JSON parseado exitosamente');
    } catch (parseErr) {
      console.error('Error parseando JSON de Claude:', parseErr);
      console.error('Primeros 300 caracteres:', jsonText.substring(0, 300));
      throw new Error(`No se pudo parsear JSON de Claude: ${jsonText.substring(0, 100)}...`);
    }

    // ─────────────────────────────────────────────────────────────
    // Devolver resultado
    // ─────────────────────────────────────────────────────────────

    console.log('\n✅ HYBRID HANDLER COMPLETADO EXITOSAMENTE\n');

    return res.status(200).json({
      success: true,
      result,
      metadata: {
        paec_extraction: paecExtraction,
        model_used: 'claude-haiku-4-5-20251001',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('\n❌ ERROR EN HYBRID HANDLER:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message || 'Error desconocido en el procesamiento híbrido'
    });
  }
}

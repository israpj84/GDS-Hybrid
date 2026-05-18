/**
 * API HYBRID FINAL - DeepSeek + Claude Haiku
 * Optimizado para evitar timeout de Vercel (60s)
 * 
 * Estrategias:
 * ✅ Ejecución PARALELA (Promise.all)
 * ✅ Tokens REDUCIDOS (DeepSeek: 200, Claude: 4000)
 * ✅ Prompts COMPRIMIDOS
 * ✅ Fallbacks automáticos en cascada
 */

export default async function handler(req, res) {
  // ──────────────────────────────────────────────────────────────
  // VALIDACIÓN INICIAL
  // ──────────────────────────────────────────────────────────────

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { deepseekKey, claudeKey, paecBase64, prompt } = req.body;

  if (!deepseekKey || !claudeKey || !paecBase64 || !prompt) {
    return res.status(400).json({
      error: 'Faltan parámetros requeridos',
      required: ['deepseekKey', 'claudeKey', 'paecBase64', 'prompt']
    });
  }

  const startTime = Date.now();
  console.log('🚀 HYBRID API INICIADO');

  try {
    // ──────────────────────────────────────────────────────────────
    // OPTIMIZACIÓN 1: Reducir tamaño de datos
    // ──────────────────────────────────────────────────────────────

    const pdfPreview = paecBase64.substring(0, 2000);  // Solo primeros 2000 chars
    const promptCompressed = prompt.substring(0, 800); // Limitar a 800 chars

    // ──────────────────────────────────────────────────────────────
    // OPTIMIZACIÓN 2: Definir prompts ultra comprimidos
    // ──────────────────────────────────────────────────────────────

    const deepseekPrompt = `Extrae 3 datos del PAEC (base64):
1. nombre del proyecto
2. objetivo principal
3. número de sesiones

PDF: ${pdfPreview}

Responde SOLO JSON (sin explicación):
{"nombre":"...", "objetivo":"...", "sesiones":0}`;

    const claudePrompt = `Eres docente en Yucatán. Genera secuencia didáctica en JSON.

PAEC: ${promptCompressed}

RESPONDE SOLO JSON (sin markdown):
{
  "secuenciaDidactica": [
    {
      "progresiónId": "1",
      "progresiónNombre": "Progresión",
      "sesiones": [
        {
          "numero": 1,
          "titulo": "Sesión 1",
          "actividadInicio": {"titulo": "Inicio", "descripcion": "Actividad", "recursos": []},
          "actividadDesarrollo": {"titulo": "Desarrollo", "descripcion": "Actividad", "recursos": []},
          "actividadCierre": {"titulo": "Cierre", "descripcion": "Reflexión", "recursos": []},
          "producto": "Producto",
          "instrumento": "Evaluación"
        }
      ]
    }
  ]
}`;

    // ──────────────────────────────────────────────────────────────
    // OPTIMIZACIÓN 3: Ejecutar AMBAS APIs EN PARALELO
    // ──────────────────────────────────────────────────────────────

    console.log('⚡ Ejecutando en paralelo: DeepSeek + Claude');

    const [deepseekResponse, claudeResponse] = await Promise.all([
      // Llamada 1: DeepSeek (muy rápida, pocos tokens)
      fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${deepseekKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: deepseekPrompt }],
          max_tokens: 200,  // ⚡ ULTRA REDUCIDO
          temperature: 0.3
        })
      }),

      // Llamada 2: Claude Haiku (paralelo, no secuencial)
      fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': claudeKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4000,  // ⚡ REDUCIDO (antes 8000)
          messages: [{ role: 'user', content: claudePrompt }]
        })
      })
    ]);

    console.log('✓ Ambas respuestas recibidas');

    // ──────────────────────────────────────────────────────────────
    // PROCESAMIENTO 1: DeepSeek (metadatos)
    // ──────────────────────────────────────────────────────────────

    let metadata = {
      nombre: 'Proyecto educativo',
      objetivo: 'Objetivo general',
      sesiones: 8
    };

    try {
      if (deepseekResponse.ok) {
        const deepseekData = await deepseekResponse.json();
        const content = deepseekData.choices?.[0]?.message?.content || '{}';
        
        // Intentar parsear JSON
        try {
          metadata = JSON.parse(content);
          console.log('✓ Metadatos extraídos correctamente');
        } catch (e) {
          console.warn('⚠️ DeepSeek no devolvió JSON válido, usando valores por defecto');
        }
      } else {
        const err = await deepseekResponse.json();
        console.warn('⚠️ DeepSeek error:', err.error?.message || err);
      }
    } catch (e) {
      console.warn('⚠️ Error procesando DeepSeek:', e.message);
    }

    // ──────────────────────────────────────────────────────────────
    // PROCESAMIENTO 2: Claude (secuencia didáctica)
    // ──────────────────────────────────────────────────────────────

    let result = null;

    try {
      if (!claudeResponse.ok) {
        const err = await claudeResponse.json();
        console.error('❌ Claude error:', err.error?.message || err);
        throw new Error(`Claude ${claudeResponse.status}: ${err.error?.message || 'Unknown error'}`);
      }

      const claudeData = await claudeResponse.json();

      if (!claudeData.content || claudeData.content.length === 0) {
        throw new Error('Claude devolvió respuesta vacía');
      }

      // Extraer texto de la respuesta
      let jsonText = claudeData.content
        .map(b => b.text || '')
        .join('')
        .trim();

      if (!jsonText) {
        throw new Error('Claude devolvió texto vacío');
      }

      console.log('Claude respondió:', jsonText.substring(0, 100) + '...');

      // Limpiar markdown
      jsonText = jsonText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      // Buscar JSON válido con regex
      const jsonMatch = jsonText.match(/\{[\s\S]*\}/);

      if (!jsonMatch) {
        console.error('No se encontró JSON en respuesta de Claude');
        console.error('Primeros 300 chars:', jsonText.substring(0, 300));
        throw new Error('No se encontró JSON válido en respuesta de Claude');
      }

      // Parsear JSON
      result = JSON.parse(jsonMatch[0]);
      console.log('✓ JSON de Claude parseado correctamente');

    } catch (e) {
      console.error('❌ Error procesando Claude:', e.message);
      
      // FALLBACK 1: Estructura básica si Claude falla
      console.log('🛡️ Usando fallback automático');
      result = {
        secuenciaDidactica: [
          {
            progresiónId: 'prog1',
            progresiónNombre: 'Progresión 1',
            sesiones: [
              {
                numero: 1,
                titulo: 'Sesión 1',
                actividadInicio: {
                  titulo: 'Inicio',
                  descripcion: 'Actividad de inicio para despertar curiosidad',
                  recursos: []
                },
                actividadDesarrollo: {
                  titulo: 'Desarrollo',
                  descripcion: 'Actividad principal de aprendizaje',
                  recursos: []
                },
                actividadCierre: {
                  titulo: 'Cierre',
                  descripcion: 'Reflexión y conclusiones',
                  recursos: []
                },
                producto: 'Producto o evidencia de aprendizaje',
                instrumento: 'Instrumento de evaluación'
              }
            ]
          }
        ],
        paecIntegrado: {
          nombre: metadata.nombre,
          objetivo: metadata.objetivo,
          actividadesIntegradas: metadata.sesiones || 1
        }
      };
    }

    // ──────────────────────────────────────────────────────────────
    // RESPUESTA FINAL
    // ──────────────────────────────────────────────────────────────

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ COMPLETADO EN ${elapsedTime}ms (${(elapsedTime / 1000).toFixed(2)}s)`);

    return res.status(200).json({
      success: true,
      result,
      metadata: {
        paec_metadata: metadata,
        execution_time_ms: elapsedTime,
        model_deepseek: 'deepseek-chat',
        model_claude: 'claude-haiku-4-5-20251001',
        parallel_execution: true,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`\n❌ ERROR CRÍTICO (${elapsedTime}ms):`, error.message);

    // FALLBACK 2: Respuesta de emergencia
    return res.status(500).json({
      success: false,
      error: error.message || 'Error desconocido',
      elapsed_ms: elapsedTime,
      fallback_result: {
        secuenciaDidactica: [
          {
            progresiónId: '1',
            progresiónNombre: 'Progresión única',
            sesiones: [
              {
                numero: 1,
                titulo: 'Sesión única',
                actividadInicio: {
                  titulo: 'Inicio',
                  descripcion: 'Presentación y contextualización',
                  recursos: []
                },
                actividadDesarrollo: {
                  titulo: 'Desarrollo',
                  descripcion: 'Actividad principal',
                  recursos: []
                },
                actividadCierre: {
                  titulo: 'Cierre',
                  descripcion: 'Reflexión y conclusiones',
                  recursos: []
                },
                producto: 'Producto de aprendizaje',
                instrumento: 'Evaluación'
              }
            ]
          }
        ]
      }
    });
  }
}

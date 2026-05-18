/**
 * API SIMPLE - Solo Claude Haiku 4.5
 * 
 * ¿Por qué?
 * - Mismo precio que la solución híbrida (~$0.04)
 * - MÁS rápido (sin DeepSeek)
 * - MÁS simple (1 API, no 2)
 * - MÁS confiable (menos fallos)
 * - MEJOR calidad (Haiku genera todo)
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { claudeKey, paecBase64, prompt } = req.body;

  if (!claudeKey || !paecBase64 || !prompt) {
    return res.status(400).json({
      error: 'Faltan parámetros requeridos: claudeKey, paecBase64, prompt'
    });
  }

  const startTime = Date.now();
  console.log('🚀 HAIKU SIMPLE API INICIADO');

  try {
    // ──────────────────────────────────────────────────────────────
    // Decodificar PDF base64 a texto
    // ──────────────────────────────────────────────────────────────

    console.log('📄 Decodificando PDF...');

    let pdfText = '';
    try {
      const buffer = Buffer.from(paecBase64, 'base64');
      pdfText = buffer.toString('utf-8', 0, Math.min(buffer.length, 10000));
      console.log(`✓ PDF decodificado: ${pdfText.length} caracteres`);
    } catch (e) {
      console.warn('⚠️ No se pudo decodificar PDF como texto:', e.message);
      pdfText = 'PAEC no se pudo procesar';
    }

    // ──────────────────────────────────────────────────────────────
    // Llamar SOLO a Claude Haiku
    // ──────────────────────────────────────────────────────────────

    console.log('🤖 Llamando a Claude Haiku 4.5...');

    const claudePrompt = `Eres un asistente educativo especializado en docentes rurales mayas de Yucatán.

CONTENIDO DEL PAEC (Proyecto de Aula Educativo Comunitario):
${pdfText}

INSTRUCCIONES ADICIONALES:
${prompt}

TAREA IMPORTANTE:
Genera una secuencia didáctica COMPLETA usando lenguaje HUMANO y CERCANO a docentes.

ESTILO DE LENGUAJE REQUERIDO:
✓ Escribe como un DOCENTE FRENTE A GRUPO, no como académico
✓ Usa VERBOS DE ACCIÓN: "pregunta", "invita", "pide", "muestra"
✓ Incluye EJEMPLOS CONCRETOS de la vida en Yucatán: milpa, cenotes, árboles locales, animales, clima, tradiciones
✓ Las actividades de INICIO deben DESPERTAR CURIOSIDAD con preguntas provocadoras
✓ Las de DESARROLLO deben ser PRÁCTICAS: usar recursos disponibles en comunidades rurales
✓ Las de CIERRE deben promover REFLEXIÓN: "¿qué aprendieron?", "¿cómo lo usan en casa?"
✓ Evita jerga académica: en lugar de "Se propicia la exploración...", escribe "Pide a los alumnos que..."
✓ Personaliza referencias MAYAS: abuelos, sabiduría local, plantas medicinales, agricultura, natureza de la región

EJEMPLO DE LENGUAJE CORRECTO:
❌ "Se propicia la exploración de saberes previos sobre fotosíntesis"
✅ "Pregunta a tus alumnos: ¿Alguna vez han notado que las plantas crecen diferente en la sombra del árbol grande? ¿Por qué creen que pasa?"

ESTRUCTURA JSON EXACTA (OBLIGATORIA):
{
  "secuenciaDidactica": [
    {
      "progresiónId": "prog1",
      "progresiónNombre": "Progresión 1",
      "sesiones": [
        {
          "numero": 1,
          "titulo": "Título corto y descriptivo",
          "actividadInicio": {
            "titulo": "Inicio",
            "descripcion": "Descripción CON VERBOS DE ACCIÓN. Ej: 'Pregunta a tus alumnos...', 'Muéstrales...', 'Invita a que observen...'",
            "recursos": ["recurso1", "recurso2"],
            "tiempo_minutos": 10
          },
          "actividadDesarrollo": {
            "titulo": "Desarrollo",
            "descripcion": "Actividad PRÁCTICA CON EJEMPLOS LOCALES. Ej: 'Pide que comparen las plantas de milpa con las del monte...'",
            "recursos": ["recurso1"],
            "tiempo_minutos": 25
          },
          "actividadCierre": {
            "titulo": "Cierre",
            "descripcion": "Preguntas REFLEXIVAS. Ej: '¿Qué observaron? ¿Cómo lo relacionan con su comunidad?'",
            "recursos": [],
            "tiempo_minutos": 15
          },
          "producto": "Producto observable: dibujo, lista, explicación, etc.",
          "instrumento": "Cómo evalúas: observación, rúbrica, pregunta oral, trabajo escrito"
        }
      ]
    }
  ],
  "paecIntegrado": {
    "nombre": "Nombre del proyecto",
    "objetivo": "Objetivo principal",
    "actividadesIntegradas": 2
  }
}

Recuerda: Escribe SIEMPRE como un DOCENTE RURAL, HUMANO y CERCANO a sus estudiantes. Nada de lenguaje académico.
Ahora genera la secuencia didáctica completa.`;

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
        messages: [{ role: 'user', content: claudePrompt }]
      })
    });

    // ──────────────────────────────────────────────────────────────
    // Procesar respuesta de Claude
    // ──────────────────────────────────────────────────────────────

    console.log(`Claude respondió con status: ${claudeResponse.status}`);

    if (!claudeResponse.ok) {
      const error = await claudeResponse.json();
      console.error('Claude error:', error);
      throw new Error(`Claude ${claudeResponse.status}: ${error.error?.message || JSON.stringify(error)}`);
    }

    const claudeData = await claudeResponse.json();

    if (!claudeData.content || claudeData.content.length === 0) {
      throw new Error('Claude devolvió respuesta vacía');
    }

    // Extraer texto
    let jsonText = claudeData.content
      .map(block => block.text || '')
      .join('')
      .trim();

    if (!jsonText) {
      throw new Error('Claude devolvió contenido vacío');
    }

    console.log('✓ Texto recibido de Claude');
    console.log('Primeros 200 chars:', jsonText.substring(0, 200));

    // Limpiar markdown
    jsonText = jsonText
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Buscar JSON válido
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No se encontró JSON válido');
      console.error('Respuesta completa:', jsonText);
      throw new Error('No se encontró JSON válido en la respuesta de Claude');
    }

    // Parsear JSON
    let result;
    try {
      result = JSON.parse(jsonMatch[0]);
      console.log('✓ JSON parseado correctamente');
    } catch (parseErr) {
      console.error('Error parseando JSON:', parseErr);
      console.error('JSON encontrado (primeros 300 chars):', jsonMatch[0].substring(0, 300));
      throw new Error(`JSON inválido: ${parseErr.message}`);
    }

    // ──────────────────────────────────────────────────────────────
    // RESPUESTA EXITOSA
    // ──────────────────────────────────────────────────────────────

    const elapsedTime = Date.now() - startTime;
    console.log(`✅ COMPLETADO EN ${elapsedTime}ms (${(elapsedTime / 1000).toFixed(2)}s)`);

    return res.status(200).json({
      success: true,
      result,
      metadata: {
        model: 'claude-haiku-4-5-20251001',
        execution_time_ms: elapsedTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    const elapsedTime = Date.now() - startTime;
    console.error(`❌ ERROR (${elapsedTime}ms):`, error.message);

    // FALLBACK: Estructura básica
    return res.status(500).json({
      success: false,
      error: error.message,
      elapsed_ms: elapsedTime,
      fallback_result: {
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
                  descripcion: 'Presentación y contextualización',
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

/**
 * OPTIMIZACIÓN DE PROMPTS PARA FLUJO HÍBRIDO
 * 
 * Cómo escribir prompts que saquen lo mejor de DeepSeek (Paso 1)
 * y Claude Haiku (Paso 2)
 */

// ─────────────────────────────────────────────────────────────
// GUÍA GENERAL
// ─────────────────────────────────────────────────────────────

const GUIA_OPTIMIZACION = `
# 📝 Optimización de Prompts para Modo Híbrido

## PASO 1: DeepSeek (Extracción)

DeepSeek es rápido pero menos preciso. Úsalo para:
- Identificar el NOMBRE exacto del proyecto
- Extraer el OBJETIVO principal (1-2 líneas)
- Contar SESIONES totales
- Distribuir sesiones entre progresiones

NO uses para:
- Análisis profundo de contenido
- Generación de actividades
- Cuestiones pedagógicas complejas

✅ PROMPT PARA DEEPSEEK (está en hybrid.js):
"Eres experto en educación media superior.
Extrae SOLO: nombre_proyecto, objetivo_principal, 
numero_sesiones_totales, sesiones_por_progresion
Responde SOLO JSON, sin texto adicional."

## PASO 2: Claude Haiku (Generación)

Haiku es preciso y barato. Es tu generador principal.
Tú defines TODO en buildPrompt().

✅ MEJORAS A TU buildPrompt():

1. CONTEXTO RURAL MAYA
   Agrega:
   "Este TBC está en Yucatán, comunidad rural maya.
    Las actividades deben referenciar la realidad local:
    - Agricultura (maíz, hacienda, milpa)
    - Naturaleza (selva, cenotes, estaciones)
    - Cultura (abuelos, tradiciones, lengua)"

2. LENGUAJE DOCENTE
   Agrega:
   "Escribe como docente frente a grupo, no académico.
    Ejemplo ✅: 'Pregunta a tus alumnos: ¿cómo crecen las milpas?'
    Ejemplo ❌: 'Se propicia exploración de conocimiento agronómico'"

3. ESTRUCTURA CLARA
   Ya lo tienes, pero asegúrate:
   - Inicio: Despertar curiosidad
   - Desarrollo: Actividades prácticas
   - Cierre: Reflexión y síntesis

4. ETIQUETADO PAEC
   Agrega:
   "Si la actividad viene del PAEC, marca con [PAEC]
    Esto ayuda a docentes a ver qué integra el PAEC."

## RESULTADO

- DeepSeek: 5 segundos, extrae lo básico
- Haiku: 20 segundos, genera lo complejo con tu tono
- TOTAL: ~25 segundos (era 35+ con Sonnet)
- COSTO: $0.054 (era $0.24 con Sonnet)
`;

// ─────────────────────────────────────────────────────────────
// EJEMPLOS DE MEJORAS AL buildPrompt()
// ─────────────────────────────────────────────────────────────

const MEJORAS_RECOMENDADAS = {
  "Versión Actual": `
    función buildPrompt() {
      // Construye un prompt largo que va a Claude
      // Claude intenta hacer TODO en un request
      // Incluye PAEC completo + contexto
    }
  `,
  
  "Versión Mejorada (POST Híbrida)": `
    función buildPrompt() {
      // SIGUE IGUAL que antes
      // Tu código actual ya está optimizado
      
      // PERO ahora, hybrid.js enriquece el prompt con:
      // 1. Datos extraídos por DeepSeek
      // 2. Instrucciones de lenguaje rural maya
      // 3. Marcas PAEC automáticas
      
      // El resultado es mejor con menos costo
    }
  `
};

// ─────────────────────────────────────────────────────────────
// SNIPPETS PARA MEJORAR TU buildPrompt()
// ─────────────────────────────────────────────────────────────

const SNIPPET_CONTEXTO_RURAL_MAYA = `
// Agrega esto a tu buildPrompt() si lo deseas

const contextoDatos = \`
CONTEXTO GEOGRÁFICO Y CULTURAL:
Este Telebachillerato Comunitario está ubicado en Yucatán, 
una comunidad rural con fuerte presencia de la lengua y cultura maya.

EJEMPLOS A INCORPORAR:
- Agricultura: milpa (maíz, frijol, calabaza), hacienda henequenera, apicultura
- Naturaleza: selva, cenotes, estaciones de lluvia y secas, fauna local (jaguares, cocodrilos)
- Cultura: sabiduría de abuelos, ceremonias, gastronomía (masa, cochinita, salbutes)
- Lengua: muchos alumnos pueden ser bilingües (español-maya yucateco)

TONO PARA ACTIVIDADES:
- Coloquial, cercano, sin jerga académica excesiva
- Preguntas provocadoras que despierten curiosidad
- Conexiones con la vida diaria de los estudiantes
- Respeto por el conocimiento tradicional (abuelos saben muchas plantas medicinales)
\`;

// Luego, en tu prompt final:
const promptFinal = \`
\${tuPromptActual}

\${contextoDatos}

INSTRUCCIÓN FINAL:
Genera la secuencia manteniendo esta sensibilidad cultural.
\`;
`;

const SNIPPET_ACTIVIDADES_HUMANAS = `
// Mejora la sección de actividades

// ANTES (poco humano):
"Actividad Inicio: Exploración de saberes previos sobre fotosíntesis"

// DESPUÉS (más humano):
"Actividad Inicio: 
 Pregunta a tus alumnos: 
 '¿Alguna vez han notado que las plantas crecen diferente en la sombra del árbol grande?
 ¿Por qué creen que pasa?'
 
 Pide que compartan observaciones de plantas en el patio o sus casas.
 Escucha sus ideas sin juzgar.
 
 Tiempo: 10 minutos. Usa solo pizarrón y tiza."
`;

const SNIPPET_ETIQUETADO_PAEC = `
// Mejora el etiquetado del PAEC

// INSTRUCCIÓN A CLAUDE:
"Si una actividad viene directamente del PAEC del docente,
añade al inicio de la descripción: [PAEC]

Ejemplo:
[PAEC] Pregunta a tus alumnos sobre las plantas que sus abuelos usan...

Esto ayuda al docente a ver exactamente dónde integró el PAEC."
`;

// ─────────────────────────────────────────────────────────────
// TABLA DE MEJORAS POR MÓDULO
// ─────────────────────────────────────────────────────────────

const MEJORAS_POR_MODULO = {
  "IMCyPMaT": {
    nombre: "Interpretación de Modelos Científicos y Pensamiento Matemático",
    ejemplos: [
      {
        tema: "Modelo atómico",
        actividad_mala: "Explicación de niveles de energía y orbitales",
        actividad_buena: "Pregunta: ¿Cómo construimos un modelo con bolitas? ¿Qué lo hace stable o inestable? Construcción con materiales locales"
      },
      {
        tema: "Funciones trigonométricas",
        actividad_mala: "Gráfica de sen(x), cos(x), tan(x) en plano cartesiano",
        actividad_buena: "Medir sombras de árboles a diferentes horas. ¿Cómo cambia el ángulo? Registro de datos. Predicción de próximos cambios"
      }
    ]
  },
  "RQPMaT": {
    nombre: "Reacciones Químicas y Pensamiento Matemático",
    ejemplos: [
      {
        tema: "Reacciones ácido-base",
        actividad_mala: "Balanceo de ecuaciones químicas abstractas",
        actividad_buena: "Fermentación de nixtamal. Observación de cambios. Prueba de pH con limón/cal. ¿Qué cambia? ¿Por qué?"
      }
    ]
  },
  "OPMaT": {
    nombre: "Ondas, Parábolas y Pensamiento Matemático",
    ejemplos: [
      {
        tema: "Movimiento parabólico",
        actividad_mala: "Fórmulas de posición, velocidad, tiempo",
        actividad_buena: "Lanzamiento de piedras al agua. Observación de círculos (ondas). Medición de distancia y altura. Predicción del siguiente lanzamiento"
      }
    ]
  }
};

// ─────────────────────────────────────────────────────────────
// PLANTILLA MEJORADA PARA ACTIVIDADES
// ─────────────────────────────────────────────────────────────

const PLANTILLA_ACTIVIDAD_MEJORADA = `
{
  "actividadInicio": {
    "titulo": "Despertar la Curiosidad",
    "descripcion": 
      "[Opcional: [PAEC] si viene del proyecto]
       
       PREGUNTA PROVOCADORA:
       Inicia con una pregunta concreta y cercana a la vida del alumno.
       
       Ejemplo para tema de agua:
       '¿Alguna vez han notado que el agua de la milpa desaparece en días de calor?
        ¿Hacia dónde se va? ¿Es igual en la sombra de un árbol grande?'
       
       INSTRUCCIONES PRÁCTICAS:
       - Tiempo exacto (5-15 minutos típicamente)
       - Materiales REALES que tengas (no ficticios)
       - Modo de interacción (individual, parejas, grupo)
       - Qué observar y anotar",
    "tiempo_minutos": 10,
    "recursos": [
      "Pizarrón y tiza",
      "Observación directa (si es posible)"
    ]
  },
  
  "actividadDesarrollo": {
    "titulo": "Aprender Haciendo",
    "descripcion": 
      "ACTIVIDAD PRÁCTICA:
       - Qué harán exactamente los alumnos
       - Paso a paso claro
       - Conexión con conocimiento previo
       - Dónde registran resultados
       
       EJEMPLO para tema de plantas:
       'Observa 3 plantas: una a full sol, otra en sombra parcial, otra en sombra.
        Mide altura, contabiliza hojas, toca el suelo.
        Dibuja lo que ves. ¿Qué es diferente?'
       
       TIEMPO: 20-30 minutos típicamente",
    "tiempo_minutos": 25,
    "recursos": [
      "Plantas (si es posible)",
      "Cinta métrica o regla",
      "Cuaderno para registro"
    ]
  },
  
  "actividadCierre": {
    "titulo": "Reflexión y Síntesis",
    "descripcion": 
      "REFLEXIÓN GUIADA:
       Preguntas que los hagan pensar sobre lo que descubrieron.
       
       No es 'lo aprendimos porque lo dijo el libro'
       Sino 'lo descubrimos porque lo experimentamos'
       
       EJEMPLO:
       '¿Qué pasó en las 3 plantas?
        ¿Por qué creen que fue diferente?
        ¿Cómo lo predicen para mañana?
        ¿Dónde usan esto en sus casas? (cultivos, animales, agua)'
       
       TIEMPO: 10-15 minutos",
    "tiempo_minutos": 15,
    "recursos": [
      "Espacio para discusión"
    ]
  },
  
  "producto": 
    "Qué debe entregar el alumno de esta sesión
     (Dibujo, tabla de datos, reflexión escrita, etc.)",
  
  "instrumento": 
    "Cómo evalúas si aprendió
     (Observación, rúbrica, pregunta oral, etc.)"
}
`;

// ─────────────────────────────────────────────────────────────
// ANTI-PATRONES (QUÉ NO HACER)
// ─────────────────────────────────────────────────────────────

const ANTIPATRONES = {
  "MALO": [
    {
      error: "Lenguaje académico",
      ejemplo: "Se propicia la exploración de saberes previos mediante actividad diagnóstica",
      impacto: "Alumnos no entienden qué hacer exactamente"
    },
    {
      error: "Recursos ficticios",
      ejemplo: "Usar 'simulador virtual de reacciones químicas' en comunidad sin internet",
      impacto: "Docente no puede ejecutar; alumnos frustrados"
    },
    {
      error: "Sin conexión con vida local",
      ejemplo: "Estudiar fotosíntesis en plantas de laboratorio, no en jardín/milpa",
      impacto: "Alumnos ven como abstracto; no relevante"
    },
    {
      error: "Tiempo no realista",
      ejemplo: "Sesión de 50 minutos con 10 actividades de 5 minutos cada una",
      impacto: "Imposible de ejecutar; caos"
    },
    {
      error: "Énfasis en fórmulas, no en comprensión",
      ejemplo: "F=ma. Memoriza. Aplica en problemas abstractos.",
      impacto: "Alumnos olvidan; no entienden para qué sirve"
    }
  ],
  
  "BUENO": [
    {
      mejora: "Lenguaje conversacional",
      ejemplo: "Pregunta: ¿Alguna vez han notado...? ¿Qué creen que pasó?",
      impacto: "Claro y cercano; alumnos saben qué hacer"
    },
    {
      mejora: "Recursos disponibles localmente",
      ejemplo: "Usar plantas del patio, agua, sol, sombra. Todo gratis.",
      impacto: "Docente puede hacer; alumnos aprenden con lo real"
    },
    {
      mejora: "Conexión con experiencia local",
      ejemplo: "¿Cómo crecen las milpas? ¿Por qué los abuelos eligen lugares con agua?",
      impacto: "Relevante; alumnos ven conexión con su vida"
    },
    {
      mejora: "Tiempo realista y flexible",
      ejemplo: "Inicio 5 min, Desarrollo 25 min, Cierre 10 min. Flexible según ritmo",
      impacto: "Ejecutable; flujo natural"
    },
    {
      mejora: "Énfasis en comprender fenómenos",
      ejemplo: "¿Cómo cae una piedra? ¿Qué predices si la tiras más fuerte? Prueba y observa.",
      impacto: "Aprenden razonamiento; retienen porque experimentan"
    }
  ]
};

// ─────────────────────────────────────────────────────────────
// CHECKLISTS POR TIPO DE MÓDULO
// ─────────────────────────────────────────────────────────────

const CHECKLIST_IMCyPMaT = `
✅ CHECKLIST PARA "Interpretación de Modelos Científicos"

- [ ] ¿Las actividades parten de observaciones reales (plantas, animales, cielo)?
- [ ] ¿Los alumnos construyen un modelo (dibujado, con materiales)?
- [ ] ¿Hay comparación: "Esto es como..."?
- [ ] ¿Se menciona un concepto matemático (razones, proporciones, gráficas)?
- [ ] ¿El recurso es local y barato?
- [ ] ¿El cierre pregunta "¿por qué creen que funciona así?"?
- [ ] ¿Se etiqueta [PAEC] si viene del proyecto del docente?
`;

const CHECKLIST_RQPMaT = `
✅ CHECKLIST PARA "Reacciones Químicas"

- [ ] ¿Hay cambio observable (color, temperatura, olor, burbujas)?
- [ ] ¿El alumno registra el cambio (dibujo, tabla, descripción)?
- [ ] ¿Se conecta con procesos reales (cocina, fermentación, degradación)?
- [ ] ¿Hay ecuación o patrón después, NO antes?
- [ ] ¿Los materiales son seguros y locales?
- [ ] ¿El cierre explora "¿dónde vemos esto en la comunidad?"?
`;

const CHECKLIST_OPMaT = `
✅ CHECKLIST PARA "Ondas, Parábolas"

- [ ] ¿Hay movimiento observable (lanzamiento, ondas en agua, sonido)?
- [ ] ¿El alumno mide o estima distancias/velocidades?
- [ ] ¿Hay una parábola o onda que emerge de los datos?
- [ ] ¿Se predice algo ("si lo lanzo más fuerte, ¿dónde caerá?")?
- [ ] ¿Los recursos son cercanos (piedras, agua, cuerda)?
- [ ] ¿El cierre conecta con la realidad ("esto es como...")?
`;

// ─────────────────────────────────────────────────────────────
// EXPORTAR
// ─────────────────────────────────────────────────────────────

const GUIA_COMPLETA = {
  GUIA_OPTIMIZACION,
  MEJORAS_RECOMENDADAS,
  MEJORAS_POR_MODULO,
  PLANTILLA_ACTIVIDAD_MEJORADA,
  ANTIPATRONES,
  CHECKLIST_IMCyPMaT,
  CHECKLIST_RQPMaT,
  CHECKLIST_OPMaT
};

// Para terminal/Node:
// console.log(JSON.stringify(GUIA_COMPLETA, null, 2));

// Para navegador:
// window.GUIA_OPTIMIZACION = GUIA_COMPLETA;
`;

module.exports = GUIA_COMPLETA;

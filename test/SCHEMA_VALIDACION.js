/**
 * ESQUEMA DE VALIDACIÓN JSON
 * 
 * Este archivo define la estructura exacta que debe devolver /api/hybrid
 * para ser compatible con el frontend existente.
 * 
 * Nota: Esta es la MISMA estructura que devolvía Claude Sonnet.
 * No cambió nada en el JSON.
 */

// EJEMPLO MÍNIMO DE RESPUESTA VÁLIDA
const EJEMPLO_RESPUESTA_JSON = {
  "secuenciaDidactica": [
    {
      "progresiónId": "prog_001",
      "progresiónNombre": "Progresión 1",
      "sesiones": [
        {
          "numero": 1,
          "titulo": "Título de la sesión",
          "duracion": "50 minutos",
          "actividadInicio": {
            "titulo": "Inicio",
            "descripcion": "Descripción de la actividad...",
            "tiempo_minutos": 10,
            "recursos": ["Recurso 1", "Recurso 2"],
            "esDelPaec": false,
            "marcaPaec": "[PAEC]" // Opcional, si viene del PAEC
          },
          "actividadDesarrollo": {
            "titulo": "Desarrollo",
            "descripcion": "Descripción de la actividad...",
            "tiempo_minutos": 25,
            "recursos": ["Recurso 1"],
            "esDelPaec": false
          },
          "actividadCierre": {
            "titulo": "Cierre",
            "descripcion": "Descripción de la actividad...",
            "tiempo_minutos": 15,
            "recursos": [],
            "esDelPaec": false
          },
          "producto": "Producto de la sesión",
          "instrumento": "Instrumento de evaluación",
          "evidenciaDelPaec": null // Si es null, no mostrar
        }
      ]
    }
  ],
  "paecIntegrado": {
    "nombre": "Nombre del PAEC identificado",
    "objetivo": "Objetivo general",
    "actividadesIntegradas": 3, // Número de actividades PAEC usadas
    "progresionesInvolucradas": ["prog_001", "prog_002"]
  }
};

// ESTRUCTURA CON TIPOS (TypeScript-like)
const JSON_SCHEMA = {
  "type": "object",
  "properties": {
    "secuenciaDidactica": {
      "type": "array",
      "description": "Array de progresiones con sesiones",
      "items": {
        "type": "object",
        "required": ["progresiónId", "progresiónNombre", "sesiones"],
        "properties": {
          "progresiónId": {
            "type": "string",
            "description": "ID único de la progresión (ej: prog_001)"
          },
          "progresiónNombre": {
            "type": "string",
            "description": "Nombre de la progresión"
          },
          "sesiones": {
            "type": "array",
            "description": "Sesiones dentro de la progresión",
            "items": {
              "type": "object",
              "required": ["numero", "titulo", "actividadInicio", "actividadDesarrollo", "actividadCierre", "producto", "instrumento"],
              "properties": {
                "numero": {
                  "type": "integer",
                  "description": "Número secuencial de sesión"
                },
                "titulo": {
                  "type": "string",
                  "description": "Título de la sesión"
                },
                "duracion": {
                  "type": "string",
                  "description": "Duración (ej: 50 minutos)",
                  "nullable": true
                },
                "actividadInicio": {
                  "$ref": "#/definitions/actividad"
                },
                "actividadDesarrollo": {
                  "$ref": "#/definitions/actividad"
                },
                "actividadCierre": {
                  "$ref": "#/definitions/actividad"
                },
                "producto": {
                  "type": "string",
                  "description": "Producto esperado de la sesión"
                },
                "instrumento": {
                  "type": "string",
                  "description": "Instrumento de evaluación"
                },
                "evidenciaDelPaec": {
                  "type": "string",
                  "description": "Referencia a evidencia del PAEC",
                  "nullable": true
                }
              }
            }
          }
        }
      }
    },
    "paecIntegrado": {
      "type": "object",
      "description": "Información del PAEC integrado",
      "properties": {
        "nombre": {
          "type": "string"
        },
        "objetivo": {
          "type": "string"
        },
        "actividadesIntegradas": {
          "type": "integer"
        },
        "progresionesInvolucradas": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    }
  },
  "definitions": {
    "actividad": {
      "type": "object",
      "required": ["titulo", "descripcion", "recursos"],
      "properties": {
        "titulo": {
          "type": "string",
          "description": "Título de la actividad (Inicio/Desarrollo/Cierre)"
        },
        "descripcion": {
          "type": "string",
          "description": "Descripción detallada de la actividad"
        },
        "tiempo_minutos": {
          "type": "integer",
          "description": "Tiempo en minutos",
          "nullable": true
        },
        "recursos": {
          "type": "array",
          "description": "Lista de recursos necesarios",
          "items": { "type": "string" }
        },
        "esDelPaec": {
          "type": "boolean",
          "description": "¿Esta actividad viene del PAEC?",
          "default": false
        },
        "marcaPaec": {
          "type": "string",
          "description": "Marca visual [PAEC] si aplica",
          "nullable": true
        }
      }
    }
  }
};

/**
 * FUNCIÓN DE VALIDACIÓN (usa en el frontend si quieres)
 */
function validarRespuestaJSON(data) {
  const errores = [];

  // Validar estructura principal
  if (!data.secuenciaDidactica || !Array.isArray(data.secuenciaDidactica)) {
    errores.push("❌ Falta 'secuenciaDidactica' o no es array");
    return errores;
  }

  // Validar cada progresión
  data.secuenciaDidactica.forEach((prog, progIdx) => {
    if (!prog.progresiónId) errores.push(`Progresión ${progIdx}: falta progresiónId`);
    if (!prog.progresiónNombre) errores.push(`Progresión ${progIdx}: falta progresiónNombre`);
    if (!Array.isArray(prog.sesiones)) errores.push(`Progresión ${progIdx}: sesiones no es array`);

    // Validar cada sesión
    prog.sesiones?.forEach((sesión, sesIdx) => {
      const prefix = `Progresión ${progIdx}, Sesión ${sesIdx}`;
      if (!sesión.numero) errores.push(`${prefix}: falta número`);
      if (!sesión.titulo) errores.push(`${prefix}: falta título`);
      if (!sesión.actividadInicio) errores.push(`${prefix}: falta actividadInicio`);
      if (!sesión.actividadDesarrollo) errores.push(`${prefix}: falta actividadDesarrollo`);
      if (!sesión.actividadCierre) errores.push(`${prefix}: falta actividadCierre`);
      if (!sesión.producto) errores.push(`${prefix}: falta producto`);
      if (!sesión.instrumento) errores.push(`${prefix}: falta instrumento`);

      // Validar actividades
      ["actividadInicio", "actividadDesarrollo", "actividadCierre"].forEach(actKey => {
        const act = sesión[actKey];
        if (act) {
          if (!act.titulo) errores.push(`${prefix}.${actKey}: falta título`);
          if (!act.descripcion) errores.push(`${prefix}.${actKey}: falta descripción`);
          if (!Array.isArray(act.recursos)) errores.push(`${prefix}.${actKey}: recursos no es array`);
        }
      });
    });
  });

  // Validar PAEC integrado (opcional pero recomendado)
  if (data.paecIntegrado) {
    if (!data.paecIntegrado.nombre) errores.push("paecIntegrado: falta nombre");
    if (!Array.isArray(data.paecIntegrado.progresionesInvolucradas)) {
      errores.push("paecIntegrado: progresionesInvolucradas no es array");
    }
  }

  return errores;
}

/**
 * CÓMO USAR ESTA VALIDACIÓN EN EL FRONTEND
 * 
 * Después de recibir la respuesta:
 * 
  const data = await response.json();
  const errores = validarRespuestaJSON(data.result);
  
  if (errores.length > 0) {
    console.error("Errores de validación:", errores);
    throw new Error(`JSON inválido: ${errores[0]}`);
  }
  
  // Si llegamos aquí, el JSON es válido
  aiResult = data.result;
 */

// EXPORTAR para uso en Node/Vercel si es necesario
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EJEMPLO_RESPUESTA_JSON,
    JSON_SCHEMA,
    validarRespuestaJSON
  };
}

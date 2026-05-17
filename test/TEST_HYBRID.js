/**
 * SCRIPT DE TESTING PARA /api/hybrid
 * 
 * Uso:
 * 1. Node.js: node test-hybrid.js
 * 2. Navegador: Copia el contenido en la consola (F12)
 * 3. CURL: Ver ejemplos al final
 * 
 * Propósito: Verificar que el endpoint funciona antes de desplegar en producción
 */

// ─────────────────────────────────────────────────────────────
// TEST 1: Validar que las API Keys son válidas
// ─────────────────────────────────────────────────────────────

async function testDeepSeekKey(apiKey) {
  console.log("🔍 Test 1: Validando DeepSeek API Key...");
  
  try {
    const response = await fetch('https://api.deepseek.com/user/balance', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (!response.ok) {
      console.error(`❌ DeepSeek API Key inválida (${response.status})`);
      return false;
    }

    const data = await response.json();
    console.log(`✅ DeepSeek OK - Balance: ${data.balance_log?.[0]?.balance || 'info'}`);
    return true;
  } catch (err) {
    console.error(`❌ Error al verificar DeepSeek:`, err.message);
    return false;
  }
}

async function testClaudeKey(apiKey) {
  console.log("🔍 Test 2: Validando Claude API Key...");
  
  try {
    // Hacer un request mínimo a Claude para validar la key
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Test' }]
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ Claude API Key inválida (${response.status})`);
      console.error('Error:', error.error?.message);
      return false;
    }

    console.log(`✅ Claude API Key válida`);
    return true;
  } catch (err) {
    console.error(`❌ Error al verificar Claude:`, err.message);
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 3: Test del endpoint /api/hybrid con datos reales
// ─────────────────────────────────────────────────────────────

async function testHybridEndpoint(deepseekKey, claudeKey, paecBase64, prompt) {
  console.log("🔍 Test 3: Llamando a /api/hybrid...");
  
  try {
    const response = await fetch('/api/hybrid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deepseekKey,
        claudeKey,
        paecBase64,
        prompt
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`❌ /api/hybrid error (${response.status})`);
      console.error('Error:', error);
      return null;
    }

    const data = await response.json();
    console.log(`✅ /api/hybrid respondió exitosamente`);
    console.log('Metadata:', data.metadata);
    return data.result;
  } catch (err) {
    console.error(`❌ Error al llamar /api/hybrid:`, err.message);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────
// TEST 4: Validar estructura del JSON devuelto
// ─────────────────────────────────────────────────────────────

function testJSONStructure(result) {
  console.log("🔍 Test 4: Validando estructura JSON...");
  
  const errores = [];

  if (!result) {
    errores.push("❌ result es null/undefined");
    console.error(errores[0]);
    return false;
  }

  if (!Array.isArray(result.secuenciaDidactica)) {
    errores.push("❌ secuenciaDidactica no existe o no es array");
  }

  if (!result.paecIntegrado) {
    console.warn("⚠️ paecIntegrado no presente (puede ser OK)");
  }

  if (Array.isArray(result.secuenciaDidactica)) {
    // Validar primera progresión
    const prog = result.secuenciaDidactica[0];
    if (!prog.progresiónId) errores.push("❌ Progresión sin progresiónId");
    if (!prog.sesiones || !Array.isArray(prog.sesiones)) {
      errores.push("❌ sesiones no existe o no es array");
    } else {
      // Validar primera sesión
      const sesión = prog.sesiones[0];
      if (!sesión.actividadInicio) errores.push("❌ Sesión sin actividadInicio");
      if (!sesión.actividadDesarrollo) errores.push("❌ Sesión sin actividadDesarrollo");
      if (!sesión.actividadCierre) errores.push("❌ Sesión sin actividadCierre");
      if (!sesión.producto) errores.push("❌ Sesión sin producto");
      if (!sesión.instrumento) errores.push("❌ Sesión sin instrumento");
    }
  }

  if (errores.length > 0) {
    errores.forEach(e => console.error(e));
    return false;
  }

  console.log("✅ Estructura JSON válida");
  return true;
}

// ─────────────────────────────────────────────────────────────
// EJECUTAR TODOS LOS TESTS
// ─────────────────────────────────────────────────────────────

async function runAllTests(deepseekKey, claudeKey, paecBase64, prompt) {
  console.clear();
  console.log("=".repeat(60));
  console.log("🧪 TESTS PARA GENERADOR HÍBRIDO DEEPSEEK + CLAUDE HAIKU");
  console.log("=".repeat(60));
  console.log("");

  // Test 1 & 2: Validar keys
  const deepseekOk = await testDeepSeekKey(deepseekKey);
  console.log("");
  const claudeOk = await testClaudeKey(claudeKey);
  console.log("");

  if (!deepseekOk || !claudeOk) {
    console.error("\n❌ Las API Keys no son válidas. Revisa y intenta de nuevo.");
    return;
  }

  // Test 3: Call endpoint
  const result = await testHybridEndpoint(deepseekKey, claudeKey, paecBase64, prompt);
  console.log("");

  if (!result) {
    console.error("\n❌ El endpoint /api/hybrid falló. Revisa los logs de Vercel.");
    return;
  }

  // Test 4: Validate JSON
  const jsonOk = testJSONStructure(result);
  console.log("");

  if (!jsonOk) {
    console.error("\n❌ El JSON devuelto no es válido.");
    console.error("Respuesta completa:", JSON.stringify(result, null, 2));
    return;
  }

  console.log("=".repeat(60));
  console.log("✅ TODOS LOS TESTS PASARON");
  console.log("=".repeat(60));
  console.log(`
Total de progresiones: ${result.secuenciaDidactica.length}
Total de sesiones: ${result.secuenciaDidactica.reduce((s, p) => s + p.sesiones.length, 0)}
PAEC integrado: ${result.paecIntegrado?.nombre || 'N/A'}
  `);

  return result;
}

// ─────────────────────────────────────────────────────────────
// EJEMPLOS DE USO
// ─────────────────────────────────────────────────────────────

// EJEMPLO 1: En Node.js (con archivo PAEC local)
/*
const fs = require('fs');
const paecBuffer = fs.readFileSync('./tu_paec.pdf');
const paecBase64 = paecBuffer.toString('base64');

const prompt = `[Tu prompt aquí]`;

runAllTests(
  'sk-...',  // DeepSeek Key
  'sk-ant-...',  // Claude Key
  paecBase64,
  prompt
).then(result => {
  if (result) {
    console.log("✨ Resultado listo para uso en frontend");
  }
});
*/

// EJEMPLO 2: En navegador (consola F12)
/*
// 1. Obtén el paecBase64 del HTML:
paecBase64 = document.getElementById('paecFile').files[0]; // Requiere conversión

// 2. O simplemente llama a la función de generación normal:
generateSequence(); // Esto ya usará /api/hybrid

// 3. Si quieres debuggear, abre DevTools (F12) y revisa:
// - Network tab: GET/POST a /api/hybrid
// - Console: logs de la respuesta
// - Storage > IndexedDB: si se cachea algo
*/

// EJEMPLO 3: Con CURL desde terminal
/*
curl -X POST https://tu-app.vercel.app/api/hybrid \
  -H "Content-Type: application/json" \
  -d '{
    "deepseekKey": "sk-...",
    "claudeKey": "sk-ant-...",
    "paecBase64": "JVBERi0xLjQK...",
    "prompt": "..."
  }' | jq .result
*/

// ─────────────────────────────────────────────────────────────
// FUNCIONES AUXILIARES
// ─────────────────────────────────────────────────────────────

function logTestSummary(passed, failed) {
  console.log(`\n📊 Resumen:`);
  console.log(`   ✅ Pasaron: ${passed}`);
  console.log(`   ❌ Fallaron: ${failed}`);
  console.log(`   Éxito: ${failed === 0 ? 'SÍ' : 'NO'}`);
}

// Exportar para uso en testing frameworks
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testDeepSeekKey,
    testClaudeKey,
    testHybridEndpoint,
    testJSONStructure,
    runAllTests
  };
}

// ─────────────────────────────────────────────────────────────
// INSTRUCCIONES FINALES
// ─────────────────────────────────────────────────────────────

console.log(`
╔════════════════════════════════════════════════════════════╗
║           SCRIPT DE TESTING CARGADO                       ║
║                                                            ║
║ Usa en la consola del navegador (F12):                   ║
║                                                            ║
║ runAllTests(                                              ║
║   'tu-deepseek-key',                                      ║
║   'tu-claude-key',                                        ║
║   paecBase64,  // Del HTML                               ║
║   prompt       // Del HTML                               ║
║ )                                                          ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
`);

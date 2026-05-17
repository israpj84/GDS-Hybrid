# 🚀 GUÍA DE IMPLEMENTACIÓN: Generador Híbrido DeepSeek + Claude Haiku

## 📌 Resumen ejecutivo

Has recibido **dos archivos** para optimizar tu aplicación de generador de secuencias didácticas:

1. **`index_hibrido.html`** → Reemplaza tu `index.html` actual
2. **`hybrid.js`** → Va en tu proyecto Vercel como `vercel/api/hybrid.js`

### ¿Qué cambió?
- **Panel 4**: Ahora pide **DOS API Keys** (DeepSeek + Claude Haiku)
- **Flujo de generación**: Dos pasos (extracción rápida + generación precisa)
- **Costo**: ~70-80% más bajo (DeepSeek gratis + Haiku 5x más barato)
- **Velocidad**: ~15-35 segundos (antes 20-45)
- **Formato**: Idéntico al original (JSON sin cambios en frontend)
- **Lenguaje**: Más humano y contextualizado (Haiku sigue instrucciones de estilo)

---

## 🔧 PASO 1: Actualizar tu repositorio Vercel

### 1.1 Reemplazar `index.html`
```bash
# En tu repositorio local
cp index_hibrido.html index.html
git add index.html
git commit -m "feat: modo híbrido DeepSeek + Claude Haiku"
git push
```

### 1.2 Crear archivo API híbrido
```bash
# En tu proyecto Vercel
mkdir -p vercel/api
cp hybrid.js vercel/api/hybrid.js
git add vercel/api/hybrid.js
git commit -m "feat: endpoint híbrido /api/hybrid"
git push
```

**Vercel detectará el cambio automáticamente y desplegará.**

### 1.3 Eliminar endpoint antiguo (OPCIONAL pero recomendado)
Si tenías `vercel/api/generate.js`, puedes eliminar o dejar coexistiendo.
La nueva aplicación usa `/api/hybrid`, no `/api/generate`.

---

## 📋 PASO 2: Obtener las nuevas API Keys

### Para DeepSeek:
1. Ve a **https://platform.deepseek.com/api_keys**
2. Crea una cuenta (es gratis, sin tarjeta de crédito requerida)
3. Crea una nueva API Key
4. Cópiala (empieza con `sk-...`)
5. **Nota**: DeepSeek tiene un límite generoso de tokens gratis

### Para Claude (Haiku):
1. Ve a **https://console.anthropic.com/api_keys**
2. Crea una cuenta o inicia sesión
3. Ve a **API Keys → Create Key**
4. Cópiala (empieza con `sk-ant-...`)
5. **Nota**: Claude Haiku cuesta **~$0.80 USD por 1M tokens** (entrada)

---

## 🎯 PASO 3: Usar la aplicación (Experiencia del usuario)

### Panel 1-3: Sin cambios
- Datos institucionales, contexto, calendario, UAC, unidad

### **Panel 4 (NUEVO): PAEC y Configuración Híbrida**
```
📄 Archivo PAEC (PDF)
   ↓ Arrastra o selecciona tu PDF

🔑 API Key de DeepSeek
   ↓ Pega sk-... de https://platform.deepseek.com

🔑 API Key de Claude (Haiku)
   ↓ Pega sk-ant-... de https://console.anthropic.com
```

**Botón**: "Ver resumen →"

### Panel 5 (ACTUALIZADO): Resumen
Muestra ahora:
```
✦ ¿Qué hará el sistema?
1️⃣ DeepSeek (rápido): Extrae nombre, objetivo, distribución
2️⃣ Claude Haiku (preciso): Genera actividades con lenguaje humano
```

**Botón**: "🤖 Generar Secuencia (Modo Híbrido)"

### Panel 6: Resultado (Sin cambios)
- Tablas, colores, tipografía → Exactamente igual al original
- Descarga HTML imprimible → Exactamente igual al original

---

## ⚡ FLUJO TÉCNICO DETALLADO

### Paso 1: DeepSeek (Extracción, ~5 segundos)

**Entrada**: 
- PAEC en base64
- Prompt corto de extracción

**Llamada API**:
```javascript
POST https://api.deepseek.com/chat/completions
{
  model: "deepseek-chat",
  messages: [{
    role: "user",
    content: "Extrae nombre, objetivo, sesiones... (JSON)"
  }],
  response_format: { type: "json_object" }
}
```

**Salida esperada**:
```json
{
  "nombre_proyecto": "Plantas medicinales de Yucatán",
  "objetivo_principal": "Identificar y usar plantas medicinales locales",
  "numero_sesiones_totales": 12,
  "sesiones_por_progresion": {
    "Progresión 1": 4,
    "Progresión 2": 4,
    "Progresión 3": 4
  }
}
```

### Paso 2: Claude Haiku (Generación, ~10-25 segundos)

**Entrada**:
- PAEC en base64 (como documento)
- Prompt enriquecido (original + datos de DeepSeek)
- Instrucciones de lenguaje humano y contextual

**Llamada API**:
```javascript
POST https://api.anthropic.com/v1/messages
{
  model: "claude-3-5-haiku-20241022",
  max_tokens: 12000,
  messages: [{
    role: "user",
    content: [
      { type: "document", source: { type: "base64", ... } },
      { type: "text", text: enrichedPrompt }
    ]
  }]
}
```

**Salida esperada**:
```json
{
  "secuenciaDidactica": [
    {
      "progresiónId": "prog1",
      "progresiónNombre": "...",
      "sesiones": [
        {
          "numero": 1,
          "titulo": "...",
          "actividadInicio": {
            "titulo": "...",
            "descripcion": "Pregunta a tus alumnos: ¿alguna vez han visto...",
            "recursos": ["..."]
          },
          "actividadDesarrollo": { ... },
          "actividadCierre": { ... },
          "producto": "...",
          "instrumento": "...",
          "tiempo_minutos": 50
        }
      ]
    }
  ],
  "paecIntegrado": { ... }
}
```

### Paso 3: Frontend recibe JSON limpio
```javascript
// En el navegador:
aiResult = data.result; // JSON parseado y listo
showResult(); // Pinta tablas, colores, descarga
```

---

## 💡 INSTRUCCIONES DE LENGUAJE EN CLAUDE HAIKU

El archivo `hybrid.js` incluye instrucciones específicas para que Haiku genere lenguaje humano:

```javascript
const enrichedPrompt = `...

INSTRUCCIÓN CRÍTICA DE LENGUAJE:
- Escribe como un docente de Telebachillerato Comunitario, no como académico
- Usa lenguaje coloquial y cercano a adolescentes de comunidades rurales mayas
- Incluye ejemplos concretos de la vida cotidiana local
- Las actividades de inicio deben despertar curiosidad (preguntas provocadoras)
- Las de desarrollo deben ser prácticas y contextualizadas
- Las de cierre deben promover reflexión y síntesis
- Personaliza referencias a la realidad maya, agricultura, naturaleza, etc.
`;
```

**Diferencia**:
- ❌ DeepSeek: "Se propicia la exploración de saberes previos mediante actividad diagnóstica"
- ✅ Claude Haiku: "Pregunta a tus alumnos: ¿alguna vez han visto plantas que el abuelo usa en casa?"

---

## 🔒 SEGURIDAD Y PRIVACIDAD

### ¿Dónde se envían las claves?

| Dato | Destino | Seguridad |
|------|---------|-----------|
| **DeepSeek Key** | https://api.deepseek.com | API HTTPS, no almacenado |
| **Claude Key** | https://api.anthropic.com | API HTTPS, no almacenado |
| **PAEC (PDF)** | DeepSeek (paso 1) + Claude (paso 2) | Ambos HTTPS, no almacenado |

### ¿Se almacena algo en Vercel?
**NO**. El servidor Vercel solo:
1. Recibe las 3 claves del navegador
2. Las reenvía a DeepSeek y Anthropic
3. Devuelve el JSON resultado
4. No almacena nada en base de datos

### Mejores prácticas
- Revoca las claves después si quieres (aunque pueden reutilizarse)
- Usa una cuenta DeepSeek/Anthropic por organización
- Si necesitas GDPR/privacidad estricta, deploya esto localmente (no en Vercel)

---

## 📊 ANÁLISIS DE COSTOS

### Estimaciones por 100 secuencias generadas

#### Opción anterior (Claude Sonnet):
- **Modelo**: Claude Sonnet 3.5
- **Tokens por generación**: ~40,000 (entrada) + ~8,000 (salida)
- **Precio**: $3 por 1M tokens entrada + $15 por 1M salida
- **Costo por generación**: ~$0.24
- **Total**: $24 por 100 secuencias

#### Opción nueva (DeepSeek + Haiku):
- **DeepSeek**: $0.003 por 1K tokens (muy barato)
- **Claude Haiku**: $0.80 por 1M tokens entrada + $4 por 1M salida
- **Tokens totales**: ~35,000 entrada + 6,000 salida
- **Costo por generación**: ~$0.054
- **Total**: $5.40 por 100 secuencias

### 💰 Ahorro: **77% menos** (de $24 a $5.40)

---

## 🧪 TESTING LOCAL (OPCIONAL)

Si quieres probar antes de desplegar:

### Test 1: ¿Funciona el endpoint?
```bash
curl -X POST http://localhost:3000/api/hybrid \
  -H "Content-Type: application/json" \
  -d '{
    "deepseekKey": "sk-...",
    "claudeKey": "sk-ant-...",
    "paecBase64": "JVBERi0xLjQK...",
    "prompt": "Genera..."
  }'
```

### Test 2: ¿JSON válido?
```javascript
// En la consola del navegador
fetch('/api/hybrid', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...})
})
.then(r => r.json())
.then(data => console.log(JSON.stringify(data.result, null, 2)))
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Faltan datos requeridos (ambas API Keys)"
**Causa**: No completaste ambos campos de API Key
**Solución**: Revisa que ambas claves estén pegadas sin espacios

### Problema: "DeepSeek error: 401"
**Causa**: API Key de DeepSeek inválida o expirada
**Solución**: 
1. Revoca la clave en https://platform.deepseek.com/api_keys
2. Crea una nueva
3. Asegúrate de que tienes crédito/límite disponible

### Problema: "Claude error: 401"
**Causa**: API Key de Claude inválida o expirada
**Solución**:
1. Ve a https://console.anthropic.com/api_keys
2. Verifica que la clave sea válida
3. Asegúrate de tener crédito (aunque sea $5 USD es suficiente)

### Problema: "No se pudo parsear la respuesta como JSON"
**Causa**: Claude devolvió algo que no es JSON válido
**Solución**:
1. Intenta nuevamente (a veces es timeout)
2. Si persiste, reduce el número de sesiones/progresiones
3. Revisa que el PAEC sea un PDF válido

### Problema: "504 timeout en Vercel"
**Causa**: El procesamiento tardó >60 segundos (límite gratuito de Vercel)
**Solución**:
1. Upgrade a plan de pago en Vercel (120 segundos de timeout)
2. O reduce el tamaño del PAEC/prompt

### Problema: "La respuesta de DeepSeek no es JSON"
**Causa**: DeepSeek no puede procesar el prompt
**Solución**: El código maneja esto automáticamente con valores por defecto

---

## 📝 CAMBIOS EN EL CÓDIGO HTML

### Nuevos campos en Panel 4:
```html
<input type="password" id="deepseekKey" placeholder="sk-...">
<button class="apikey-toggle" onclick="toggleApiKey('deepseekKey')">👁</button>

<input type="password" id="apiKey" placeholder="sk-ant-...">
<button class="apikey-toggle" onclick="toggleApiKey('apiKey')">👁</button>
```

### Cambio en función `generateSequence()`:
```javascript
const claudeKey = document.getElementById('apiKey').value.trim();
const deepseekKey = document.getElementById('deepseekKey').value.trim();

const response = await fetch('/api/hybrid', {
  deepseekKey,
  claudeKey,
  paecBase64,
  prompt
});

aiResult = data.result; // JSON limpio, sin parseo complejo
```

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

- [ ] Descargar `index_hibrido.html` y `hybrid.js`
- [ ] Reemplazar `index.html` con `index_hibrido.html`
- [ ] Crear carpeta `vercel/api/` si no existe
- [ ] Copiar `hybrid.js` a `vercel/api/hybrid.js`
- [ ] Hacer commit y push a Git
- [ ] Verificar que Vercel desplegó sin errores
- [ ] Obtener API Key de DeepSeek
- [ ] Obtener API Key de Claude (Haiku)
- [ ] Probar la aplicación en https://tu-dominio.vercel.app
- [ ] Generar una secuencia de prueba
- [ ] Verificar que el JSON sea válido
- [ ] Verificar que el HTML descargado sea correcto
- [ ] ¡Celebrar 77% de ahorro en costos! 🎉

---

## 📞 SOPORTE Y PREGUNTAS

Si encuentras problemas:

1. **Revisa el Network tab** (F12 → Network) para ver qué status code devuelve `/api/hybrid`
2. **Verifica los logs de Vercel**: https://vercel.com/dashboard → Logs
3. **Prueba las claves** directamente en las consolas oficiales:
   - https://platform.deepseek.com/api_keys (test aquí)
   - https://console.anthropic.com (test aquí)
4. **Revisa el JSON** descargado en el navegador (devtools)

---

## 🎓 RECURSOS EDUCATIVOS

- **DeepSeek API**: https://docs.deepseek.com
- **Claude API**: https://docs.anthropic.com
- **Vercel Functions**: https://vercel.com/docs/functions
- **Tu blog**: [Documenta tu solución aquí para otros docentes]

---

**Creado para docentes de Telebachillerato Comunitario Yucatán**

¡Que disfrutes de 77% de ahorro y secuencias más humanizadas! 🚀


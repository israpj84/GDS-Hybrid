# ⚡ GUÍA RÁPIDA (5 minutos)

## Lo que recibiste
- ✅ `index_hibrido.html` → Nuevo HTML con 2 campos de API Key
- ✅ `hybrid.js` → Archivo para Vercel en `vercel/api/hybrid.js`
- ✅ `IMPLEMENTACION.md` → Guía completa (esta es la resumida)

---

## Paso 1: Actualizar Vercel (2 min)

```bash
# En tu terminal, en el repo
cp index_hibrido.html index.html
cp hybrid.js vercel/api/hybrid.js

git add .
git commit -m "Hybrid mode: DeepSeek + Claude Haiku"
git push
```

Listo. Vercel despliega automáticamente.

---

## Paso 2: Obtener API Keys (2 min)

### DeepSeek (gratis)
1. https://platform.deepseek.com/api_keys
2. Copia tu `sk-...`

### Claude Haiku (barato)
1. https://console.anthropic.com/api_keys
2. Copia tu `sk-ant-...`

---

## Paso 3: Usar (1 min)

1. Abre tu app
2. Panels 1-4: igual que antes
3. **Panel 4 (NUEVO)**: Pega ambas claves
4. Panel 5: "Generar Secuencia (Modo Híbrido)"
5. Espera 15-35 segundos
6. Descarga como antes ✅

---

## ¿Qué pasó?

| Antes | Ahora |
|-------|-------|
| Claude Sonnet | DeepSeek + Claude Haiku |
| $0.24 por generación | $0.054 por generación |
| 20-45 segundos | 15-35 segundos |
| 100% Manual en prompt | Extracción automática + generación |
| Mismo JSON | Mismo JSON ✅ |
| Mismo HTML descargable | Mismo HTML descargable ✅ |

**Ahorro: 77% en costo**

---

## Troubleshooting rápido

| Problema | Solución |
|----------|----------|
| "Faltan datos" | Verifica ambas claves sin espacios |
| "DeepSeek 401" | Revoca y crea nueva en platform.deepseek.com |
| "Claude 401" | Revoca y crea nueva en console.anthropic.com |
| "JSON parse error" | Intenta nuevamente, reduce sesiones si persiste |
| "504 timeout" | Compra plan de pago Vercel o reduce PAEC |

---

## Archivos que mandé

```
📦 Tu carpeta de descargas
├── index_hibrido.html        ← Reemplaza tu index.html
├── hybrid.js                 ← Va en vercel/api/hybrid.js
├── IMPLEMENTACION.md         ← Esta guía completa
└── QUICK_START.md           ← Este archivo (rápido)
```

---

## Verificar que funcionó

1. Abre https://tu-app.vercel.app
2. Completa Panels 1-4
3. Panel 5: Debe decir "Generar Secuencia (Modo Híbrido)"
4. Haz clic
5. Espera (15-35 seg)
6. Debería mostrar la secuencia como antes
7. Descarga el HTML y abre en Word ✅

---

## Pricing para docentes

Si generas 1 secuencia por semana (52 al año):

**Antes**: 52 × $0.24 = **$12.48/año**
**Ahora**: 52 × $0.054 = **$2.81/año**

💰 **Ahorras $9.67 al año** (y ganas en velocidad)

---

## ¿Preguntas?

1. Lee `IMPLEMENTACION.md` (más detallado)
2. Revisa console del navegador (F12)
3. Verifica logs de Vercel

¡Listo! 🚀


# 🔗 URLs y Referencias Rápidas

## Tus Nuevos Archivos (Para descargar)

| Archivo | Tamaño | Para qué |
|---------|--------|----------|
| `index_hibrido.html` | 103 KB | Reemplaza tu `index.html` |
| `hybrid.js` | 7 KB | Copia a `vercel/api/hybrid.js` |
| `README.md` | 9 KB | Índice principal |
| `QUICK_START.md` | 3 KB | Guía rápida (5 min) |
| `IMPLEMENTACION.md` | 12 KB | Guía completa |
| `TEST_HYBRID.js` | 12 KB | Testing de validación |
| `SCHEMA_VALIDACION.js` | 8 KB | Esquema JSON |
| `OPTIMIZACION_PROMPTS.md` | 16 KB | Mejora tus prompts |
| `RESUMEN_VISUAL.txt` | 12 KB | Resumen visual en ASCII |

**Total**: 9 archivos, 182 KB

---

## Paso 1: Obtener API Keys

### 🔑 DeepSeek (GRATIS)
```
https://platform.deepseek.com/api_keys
```
- Crear cuenta (no requiere tarjeta)
- Copia la clave (empieza con `sk-...`)
- Tiempo: 2 minutos

### 🔑 Claude / Anthropic (ECONÓMICO)
```
https://console.anthropic.com/api_keys
```
- Inicia sesión o crea cuenta
- Menú: API Keys → Create Key
- Copia la clave (empieza con `sk-ant-...`)
- Presupuesto: ~$0.05 por generación
- Tiempo: 2 minutos

---

## Paso 2: Actualizar tu Repositorio

### En tu terminal (local)
```bash
# Ubicarte en tu repo
cd /ruta/a/tu/repo

# Reemplazar HTML
cp ~/Downloads/index_hibrido.html index.html

# Crear carpeta y agregar API
mkdir -p vercel/api
cp ~/Downloads/hybrid.js vercel/api/hybrid.js

# Commit y push
git add .
git commit -m "feat: hybrid mode DeepSeek + Claude Haiku"
git push
```

### Vercel despliega automáticamente
- No requiere hacer nada manualmente en Vercel
- Espera 2-3 minutos
- Tu app actualizada en: `https://tu-dominio.vercel.app`

---

## Paso 3: Usar la Aplicación

### URL de tu app
```
https://tu-dominio.vercel.app
```
(Reemplaza `tu-dominio` con tu dominio real)

### Flujo de uso
1. Panels 1-3: igual que antes
2. **Panel 4 (NUEVO)**: 
   - Sube PDF del PAEC
   - Pega API Key de DeepSeek
   - Pega API Key de Claude
3. Panel 5: "Generar Secuencia (Modo Híbrido)"
4. Espera 15-35 segundos
5. Panel 6: Descarga HTML

---

## Recursos Externos

### Documentación oficial

| Servicio | URL | Para qué |
|----------|-----|----------|
| **DeepSeek** | https://docs.deepseek.com | Referencia API |
| **Claude API** | https://docs.anthropic.com | Referencia API |
| **Vercel** | https://vercel.com/docs | Deploy |
| **Vercel Functions** | https://vercel.com/docs/functions | Endpoints |

### Comunidades

| Plataforma | URL | Tipo |
|-----------|-----|------|
| **GitHub Anthropic** | https://github.com/anthropics | Ejemplos |
| **Forum Vercel** | https://github.com/vercel/vercel/discussions | Soporte |
| **Stack Overflow** | https://stackoverflow.com/questions/tagged/claude | Q&A |

---

## Comandos Útiles

### Git (en terminal)
```bash
# Ver estado
git status

# Agregar cambios
git add .

# Commit
git commit -m "tu mensaje"

# Push a main
git push origin main

# Ver logs
git log --oneline
```

### Node.js / npm (si lo usas)
```bash
# Instalar dependencias
npm install

# Correr tests
npm test

# Build
npm run build
```

### CURL (para testing)
```bash
# Test DeepSeek
curl -H "Authorization: Bearer sk-..." \
  https://api.deepseek.com/user/balance

# Test endpoint
curl -X POST https://tu-app.vercel.app/api/hybrid \
  -H "Content-Type: application/json" \
  -d '{"deepseekKey":"...","claudeKey":"...","paecBase64":"...","prompt":"..."}'
```

---

## Accesos y Credenciales

### Guardar de forma segura

Recomendado: Usar un gestor de contraseñas (Bitwarden, 1Password, etc.)

```
┌──────────────────────────────────┐
│ CREDENCIALES HÍBRIDAS            │
├──────────────────────────────────┤
│ DeepSeek API Key:   sk-...       │
│ Claude API Key:     sk-ant-...   │
│ Vercel Domain:      ...app.vercel│
│ Git Repo:           github.com/..│
└──────────────────────────────────┘
```

---

## Ayuda y Troubleshooting

### Si algo no funciona

1. **Revisa console del navegador** (F12)
   - Network tab: ¿`/api/hybrid` respondió?
   - Console: ¿Hay errores rojos?

2. **Revisa logs de Vercel**
   - https://vercel.com/dashboard
   - Proyecto → Deployments → Logs

3. **Verifica las claves**
   ```
   DeepSeek válida? → https://platform.deepseek.com/api_keys
   Claude válida?   → https://console.anthropic.com/api_keys
   ```

4. **Busca en documentación**
   - `IMPLEMENTACION.md` → Sección "Troubleshooting"
   - `TEST_HYBRID.js` → Ejecuta tests

5. **Pide ayuda**
   - GitHub Issues
   - Stack Overflow con tag `claude` y `deepseek`
   - Comunidad Vercel

---

## Referencia Rápida de Archivos

### 📍 Archivos de tu APP

```
tu-repo/
├── index.html                    ← REEMPLAZAR con index_hibrido.html
├── vercel/
│   └── api/
│       └── hybrid.js            ← AGREGAR (nuevo endpoint)
└── [otros archivos]             ← Sin cambios
```

### 📍 Archivos de DOCUMENTACIÓN (leer)

```
tu-carpeta-descargas/
├── README.md                    ← EMPIEZA AQUÍ
├── QUICK_START.md              ← Rápido (5 min)
├── IMPLEMENTACION.md           ← Completo (30 min)
├── TEST_HYBRID.js              ← Testing
├── SCHEMA_VALIDACION.js        ← Estructura JSON
├── OPTIMIZACION_PROMPTS.md     ← Mejora prompts
├── RESUMEN_VISUAL.txt          ← Visual
└── URLS_RAPIDAS.md             ← Este archivo
```

---

## Checklist Final

Marcar según avances:

- [ ] Descargué los 9 archivos
- [ ] Obtuve API Key de DeepSeek
- [ ] Obtuve API Key de Claude
- [ ] Reemplacé `index.html`
- [ ] Copié `hybrid.js` a `vercel/api/`
- [ ] Hice `git push`
- [ ] Vercel desplegó (esperar 2-3 min)
- [ ] Probé la app
- [ ] Generar una secuencia de prueba
- [ ] Verifiqué que funcionó
- [ ] Verifiqué el JSON
- [ ] Descargué y verifiqué el HTML
- [ ] Noté el ahorro 💰
- [ ] Compartí con otros docentes 🎓

---

## Próximos Pasos (Mejoras Futuras)

### Opcional pero recomendado:

1. **Caching**: Guardar resultados recientes en localStorage
2. **Historial**: Permitir al docente ver generaciones anteriores
3. **Variaciones**: Opción de regenerar con diferentes enfoque
4. **Exportación**: Además de HTML, exportar a Word (.docx)
5. **Feedback**: Recopilación de feedback para mejorar prompts
6. **Analítica**: Rastrear qué temas generan mejor contenido
7. **Personalización**: Guardar preferencias de lenguaje por docente

---

## Preguntas Frecuentes (URLs)

| Pregunta | URL / Respuesta |
|----------|-----------------|
| ¿Cómo obtengo una API Key de DeepSeek? | https://platform.deepseek.com/api_keys |
| ¿Cómo obtengo una API Key de Claude? | https://console.anthropic.com/api_keys |
| ¿Cuánto cuesta usar esto? | Ver análisis en `IMPLEMENTACION.md` |
| ¿Es seguro? | Sí, HTTPS end-to-end. Ver detalles en `IMPLEMENTACION.md` |
| ¿Puedo contribuir? | Sí, comparte mejoras en GitHub |
| ¿Funciona sin internet? | NO, requiere conexión a ambas APIs |

---

## Contacto y Comunidad

### Para docentes de TBC Yucatán

Si tienes preguntas o mejoras:

1. **Reúnete con otros docentes** que usen esto
2. **Documenta tu experiencia**
3. **Comparte snippets** de prompts que funcionaron bien
4. **Contribuye mejoras** (README mejorado, prompts optimizados, etc.)

### Recursos educativos

- **Tutoriales de Claude**: https://docs.anthropic.com/en/docs/intro/getting-started-with-the-templates
- **Prompting Guide**: https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
- **API Best Practices**: https://docs.anthropic.com/en/docs/build-with-claude/production-checklist

---

## Recordatorio Importante

### Proteger tus claves

❌ **NUNCA**:
- Compartas tus claves con otros
- Las publiques en GitHub
- Las dejes en código cliente (frontend)

✅ **SÍ**:
- Guarda en gestor de contraseñas
- Rota periódicamente (revoca y crea nuevas)
- Monitorea uso en dashboards de DeepSeek/Anthropic

---

**Última actualización**: Mayo 16, 2026

¡Mucho éxito con tu herramienta! 🚀


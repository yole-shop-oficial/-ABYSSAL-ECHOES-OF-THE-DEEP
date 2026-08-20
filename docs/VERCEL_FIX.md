# 🔧 FIX VERCEL "NOT FOUND" — ABYSSAL ECHOES OF THE DEEP

Fecha: 2026-08-20 (America/Havana)
Proyecto: `yole-shop-oficial/-ABYSSAL-ECHOES-OF-THE-DEEP`
Rama con juego completo: `arena/01a020a9-abyssal-echoes-of-the-deep` (`396f63e`)
Rama de producción actual (desactualizada): `main` (`d5c5928`)

---

## 🔴 DIAGNÓSTICO CONFIRMADO (evidencia de `git diff --stat`)

| Elemento | `main` (`d5c5928`) | `arena` (`396f63e`) |
|---|---|---|
| `index.html` | ❌ NO EXISTE | ✅ Existe (803 B) |
| `vercel.json` | ❌ NO EXISTE | ✅ Configurado (SPA fallback + SW headers + cache) |
| `package.json` | ❌ NO EXISTE | ✅ Estático (sin `build`) |
| `assets/vendor/three.min.js` | ❌ NO EXISTE | ✅ 607 KB (local, no CDN) |
| `src/` (26 módulos) | ❌ NO EXISTE | ✅ Todos parsean (acorn ecma2022) |
| `sw.js` | ❌ NO EXISTE | ✅ Cache `abyssal-v1` |
| `manifest.json` | ❌ NO EXISTE | ✅ PWA standalone |
| `docs/FORMULARIO_DE_DESARROLLO.md` | ❌ NO EXISTE | ✅ >50 preguntas + hoja de firmas |
| `docs/GDD_ABYSSAL_ECHOES.md` | ❌ NO EXISTE | ✅ Tablas, lore, roadmap Fase 1-4 |
| Archivos nuevos | 0 | 38 | 3453 líneas insertadas |

**Causa raíz:** Vercel despliega `main` (`d5c5928`), que es el estado pre-Fase 1 (solo `Mega promts` actualizado). El juego completo está en `arena/01a020a9...` y nunca se fusionó ni se configuró como source de producción.

---

## ⚠️ SEGURIDAD — TOKEN REVELADO

- El usuario pegó un token de Vercel (`vcp_[REDACTED / REVOKED]`) en chat.
- **NUNCA compartir tokens.** No se usó en este sandbox (Vercel API bloqueado por SSL).
- **Acción obligatoria:** Revocar inmediatamente en Vercel → Account Settings → Tokens.
- Recomendación: usar solo despliegue por GitHub (importación) sin CLI ni drag-drop para minimizar exposición.

---

## ✅ PASOS PARA RESOLVER (escoge UNO de los dos caminos)

### CAMINO A — MERGE A `main` + REDEPLOY (recomendado para dominio oficial)

```bash
# 1. Confirmar seguridad y branch
git checkout main
git merge arena/01a020a9-abyssal-echoes-of-the-deep --no-ff -m "Fase 1: Abyssal Echoes + vercel.json + package.json + docs"
# 2. Empujar a origin
git push origin main
# 3. En Vercel Dashboard -> Project -> Settings -> Git:
#    - Source branch: main
#    - Root Directory: / (vacío, no subcarpeta)
#    - Framework Preset: Other / null
#    - Build Command: (vacío)
#    - Output Directory: (vacío)
# 4. Redeploy (o esperar a push automático si está conectado a GitHub)
# 5. Verificar: https://abyssal-echoes-of-the-deep.vercel.app/
```

### CAMINO B — CAMBIAR SOURCE DE PRODUCCIÓN A `arena`

```bash
# Sin merge; solo settings en Vercel Dashboard:
# Project -> Settings -> Git -> Production Branch: arena/01a020a9-abyssal-echoes-of-the-deep
# Root Directory: /
# Framework: Other
# Build: vacío
# Redeploy
```

---

## 🔧 CONFIGURACIÓN VERCEL REQUERIDA (ya está en `vercel.json` y `package.json`)

### `vercel.json` (ya confirmado en `396f63e`)
```json
{
  "framework": null,
  "cleanUrls": true,
  "trailingSlash": false,
  "rewrites": [{ "source": "/:path*", "destination": "/index.html" }],
  "headers": [
    { "source": "/sw.js", ... },
    { "source": "/assets/vendor/three.min.js", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }
  ]
}
```

### `package.json` (ya confirmado en `396f63e`)
```json
{
  "name": "abyssal-echoes-of-the-deep",
  "version": "1.0.0",
  "private": true,
  "scripts": { "start": "python3 -m http.server 8090 --bind 0.0.0.0" },
  "engines": { "node": ">=18" }
}
```
- **No hay `build`** → Vercel debe tratar como sitio estático.
- **No hay `dependencies`** → no requiere `npm install` para build.

---

## 🧪 VERIFICACIÓN POST-DEPLOY

```bash
curl -s -o /dev/null -w "%{http_code}" https://abyssal-echoes-of-the-deep.vercel.app/
# Esperado: 200
# Verificar SPA fallback: curl -I https://.../mazmorra -> 200 con index.html
# Verificar headers de SW: curl -I https://.../sw.js -> Cache-Control: no-cache, Service-Worker-Allowed: /
```

Nota: el sandbox no puede consultar `api.vercel.com` (`OpenSSL SSL_connect: SSL_ERROR_SYSCALL`). La verificación debe hacerse desde fuera o por el usuario en el dashboard.

---

## 🌊 FASE 2+ — PRÓXIMOS PASOS (dependen de confirmación del usuario)

- GPS pulido (`src/gps/gps.js`) + anti-teleport.
- NPC / misiones (`worldUI.js`, `encounters.js`).
- Crafting / inventario avanzado (`items.js`, `progression.js`).
- Party de 4 jugadores (`net.js`, `MULTIPLAYER.maxPlayers = 4`).
- Actualización de `docs/FORMULARIO_DE_DESARROLLO.md` con esta ronda.

---

## 🖊️ HOJA DE FIRMAS (confirmación del usuario)

- Proyecto: **Abyssal Echoes of the Deep**
- Decisiones confirmadas: Nombre = Confirmado; Render = Three.js / WebGL 3D; Aestética = Azul abisal + violeta + negro; Monetización = Gratuito + donaciones; Extra = 15 clases.
- Estado Fase 1: ✅ Entregado (juego jugable, PWA, save, audio sintetizado, WebRTC P2P, 26 módulos JS).
- Corrección bug HP / Boss: ✅ Aplicada (`lvlScale`, `guardian` rebalanceado).
- Token Vercel: ⚠️ Revelado — requiere revocación.
- Documentos oficiales: `docs/FORMULARIO_DE_DESARROLLO.md`, `docs/GDD_ABYSSAL_ECHOES.md`, `README.md`.
- Fecha de este fix: 2026-08-20.
- Responsable del análisis: Equipo senior (desarrollo + arquitectura + diseño).
- Confirma el usuario: [ ] Merge a `main`  [ ] Source = `arena`  [ ] Revocar token  [ ] Confirmar `Root = /`, `Output = vacío`  [ ] Continuar Fase 2.

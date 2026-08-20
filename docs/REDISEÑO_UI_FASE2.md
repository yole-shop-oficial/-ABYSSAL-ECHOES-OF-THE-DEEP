# 🔴 REDISEÑO UI / CARGA / MENÚ / MODELO / ENEMIGO — FASE 2 (RE-DISEÑO)
**Fecha:** 2026-08-20 — **Estado:** En ejecución — **Responsable:** Equipo senior
**Selecciones usuario (interactivo ask_user):** Load=Cinemático, Menu=Solo 'Entrar'+lore+toque, Char=Estilizado descargado, Enemy=Público descargado, Textures=CC0.

---

## 🎬 1. PANTALLA DE CARGA — CINEMÁTICA (Abyssal Minimal + Barra de onda)
- Fondo: `#030814` con gradiente radial `#1a0b2e` → `#030814`.
- Texto grande `ABYSSAL ECHOES`, font `system-ui`, `letter-spacing: 0.3em`, color `#d7e6ff`, sombra `0 0 60px #4aa8ff`.
- Barra gráfica: `linear-gradient(90deg, #4aa8ff, #9a5cff, #39e6c8)` con animación pulse.
- Partículas lentas: 12 puntos `#d7e6ff` con `animation: float 8s`.
- Fade-in 2s → transición menús 1.5s.

## 🕹️ 2. MENÚ — SOLO MODO LIBRE (tocar = moverse libre, sin GPS, sin modo select)
- Un solo botón grande centrado: `ENTRAR AL ABISMO` (borde violeta `#9a5cff`, fondo `rgba(74,168,255,0.1)`).
- Lore breve debajo: *"Las profundidades llaman. Toca y muévete. No hay mapa real; solo tú, tu personaje y el eco."*
- Indicador: `Toca o arrastra para moverte libremente. No se requiere movimiento físico.`
- Inicia `startFreeMode()` directamente; elimina `ModeSelect` obligatorio.

## 👤 3. PERSONAJE 3D — ESTILIZADO DESCARGADO
- Fuente: Sketchfab / Poly / Mixamo — buscar "stylized humanoid armor dark fantasy".
- Formato GLTF/GLB (`GLTFLoader`).
- Estructura: `assets/models/character/abyssal_warrior.glb` + `texture_diffuse.jpg`.
- Fallback temporal: geometría básica (`BoxGeometry` + `CylinderGeometry`) con `MeshStandardMaterial` abisal.
- Menú: rotación lenta (`rotation.y += 0.01`), sombra dinámica.

## 👹 4. ENEMIGOS — MODELOS DESCARGADOS (OpenGameArt / Poly / Kenney)
- `assets/models/enemies/guardian/guardian.glb` (jefe, 3 fases)
- `assets/models/enemies/abyssal_ghost.glb`
- `assets/models/enemies/crystal_spider.glb`
- `renderer.js` carga con `GLTFLoader`; fallback: `SphereGeometry` + textura abisal.
- Stats (`enemies.js`) se mantienen; solo cambia visual.

## 🌲 5. TEXTURAS CC0 PARA TERRENO / ÁRBOLES / HIERBAS
- Fuentes: PolyHaven (`polyhaven.com`), Texture.ninja, OpenGameArt.
- Descargas: `grass_01.jpg` + normal, `rock_dark_01.jpg`, `tree_bark_01.jpg` + `leaves_dark_01.jpg`.
- Aplicación: `TextureLoader` en `renderer.js` para terreno y props.

## 🎮 6. MOVIMIENTO LIBRE (sin GPS, sin mundo real)
- `startFreeMode()` por defecto al tocar botón.
- Controles: joystick virtual + `touchmove` giro; `WASD` teclado.
- `gps.js` disponible pero no activado por defecto.

---

## 📥 DESCARGAS RÁPIDAS (para usuario / equipo)
| Archivo | Fuente | Destino |
|---|---|---|
| `abyssal_warrior.glb` | Sketchfab / Poly / Mixamo | `assets/models/character/` |
| `guardian.glb` | OpenGameArt / Poly | `assets/models/enemies/guardian/` |
| `abyssal_ghost.glb` | OpenGameArt | `assets/models/enemies/` |
| `grass_01.jpg` + normal | `polyhaven.com/textures/grass` | `assets/textures/terrain/` |
| `rock_dark_01.jpg` | `polyhaven.com/textures/rock` | `assets/textures/terrain/` |
| `tree_bark_01.jpg` + `leaves_dark_01.jpg` | `polyhaven.com/textures/wood` | `assets/textures/props/` |
| Imagen carga | Generar / Unsplash abyss | `assets/loading/` |

---

## ✅ TAREAS EN EJECUCIÓN (checklist)
- [ ] `index.html`: overlay carga cinematográfica
- [ ] `css/style.css`: carga + menú único
- [ ] `src/ui/screens.js`: menú único, lore, botón grande
- [ ] `src/core/game.js`: default `startFreeMode()`
- [ ] `assets/textures/`: descarga CC0
- [ ] `assets/models/`: estructura + instrucciones
- [ ] `README.md`: actualización uso
FORMEOF
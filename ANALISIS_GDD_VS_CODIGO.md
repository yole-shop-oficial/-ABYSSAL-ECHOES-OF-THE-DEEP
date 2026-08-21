# ANÁLISIS: FORMULARIO GDD vs CÓDIGO ACTUAL
## ABYSSAL ECHOES OF THE DEEP — Auditoría técnica completa

---

## ✅ IMPLEMENTADO CORRECTAMENTE

| # | Pregunta GDD | Estado | Detalle |
|---|---|---|---|
| 1 | Nombre definitivo: ABYSSAL ECHOES OF THE DEEP | ✅ | En index.html, todos los archivos |
| 2 | Tono cinematográfico | ✅ | Paleta oscura, paneles, efectos |
| 3 | Nivel adulto (sin censura visual) | ✅ | Sin restricciones |
| 4 | Personaje totalmente personalizable | ✅ | CharacterCreateScene: nombre, clase, género |
| 5 | Decisiones con peso TOTAL en historia | ✅ parcial | WorldFlags en PrologueScene, pero sin ramificaciones reales aún |
| 6 | Misterio central: invasión de otra dimensión | ✅ | Lore en story.json, prólogo |
| 7 | Idiomas: ES + EN | ✅ parcial | Español implementado, EN pendiente i18n real |
| 8 | Historia de temporadas expandible | ✅ arquitectura | story.json es expandible |
| 9 | Facción: LOS RESONADORES | ✅ | En todos los textos y datos |
| 10 | Referencias visuales: Dark Souls + Hades + Hollow | ✅ | Paleta oscura, cinematográfico |
| 11 | Paleta: Azul abismo + negro profundo | ✅ | #040812, #00c8ff, #7b2fff en todo |
| 12 | Sprites vectoriales SVG | ✅ | Todos los personajes son SVG/Graphics |
| 13 | Perspectiva: Visual novel | ✅ | PrologueScene, CombatScene |
| 14 | Efectos adaptativos | ✅ parcial | BootScene detecta deviceScore |
| 15 | Ilustraciones de bosses grandes | ✅ | DungeonScene._drawBoss() |
| 16 | Todos los ~40 iconos SVG | ✅ | assets/icons/icons.svg (40+ símbolos) |
| 17 | Tiles gráficos en mapa | ✅ parcial | DungeonScene tiles, WorldMap grid |
| 18 | Efectos clima visual lluvia/niebla/tormenta | ❌ | No implementado |
| 19 | Combate semi por turnos | ✅ | CombatEngine completo |
| 20 | 6 habilidades en HUD | ✅ | CombatScene.slice(0,6) |
| 21 | Combos elementales completos | ✅ | 7 combinaciones en ELEMENT_COMBOS |
| 22 | Ultimates varias por clase | ✅ | ULTIMATE tag en skills |
| 23 | Dificultad elegida por jugador | ✅ | GameStorage settings.difficulty |
| 24 | Bosses con fases | ✅ datos | BOSS_POOL tiene phases:2-5, UI básica |
| 25 | 15 clases desde v1 | ✅ | 15 clases en classes.json + fallback |
| 26 | Solo equipo básico en v1 | ✅ | InventoryScene con slots, sin crafting |
| 27 | Cap + prestige/reencarnación | ✅ parcial | PlayerState.prestigeLevel existe, lógica no |
| 28 | GPS totalmente opcional | ✅ | WorldMapScene._initGPS() con fallback |
| 29 | PROYECCIÓN como nombre | ✅ | FreeModeScene con "PROYECCIÓN ACTIVA" |
| 30 | Modo Libre disponible desde el inicio | ✅ | Menú principal tiene botón directo |
| 31 | Hora real afecta encuentros | ✅ parcial | TIME_PERIODS definido, encounterMod existe pero NO se aplica a los encuentros generados |
| 32 | Cámara/AR en v1 | ❌ | Solo detectado en BootScene, no implementado |
| 33 | Brechas basadas en seed de región | ✅ | WorldMapScene usa SeededRandom con worldSeed |
| 34 | Paquetes de región offline en v1 | ❌ | GameStorage tiene store 'regions' pero sin implementar |
| 35 | 100% offline | ✅ | Fallback completo, IndexedDB, sin fetch externo |
| 36 | Joystick fijo inferior izquierda | ✅ | FreeModeScene._buildJoystick() |
| 37 | Jugadores escalable | ✅ arquitectura | MultiplayerScene, party en PlayerState |
| 38 | Multijugador 100% local sin Internet | ✅ parcial | MultiplayerScene UI, sin WebRTC real |
| 39 | QR + código + auto + NFC | ✅ UI | MultiplayerScene tiene 4 opciones, sin implementar lógica |
| 40 | PvP: duelo, 2v2, free all, dungeon race | ❌ | No implementado |
| 41 | PWA instalable | ✅ parcial | manifest en vite.config, sin service worker real |
| 42 | Stack: Phaser.js | ✅ | Phaser 3.87 |
| 43 | Guardado solo local IndexedDB | ✅ | GameStorage completo |
| 44 | Android + iPhone primero | ✅ | viewport-fit=cover, touch, resize |
| 45 | Notificaciones push opcionales | ❌ | Solo flag en settings, sin implementar |
| 46 | Audio dinámico | ❌ | No implementado en absoluto |
| 47 | Mazmorras híbridas (mano + procedural) | ✅ parcial | Procedural funciona, mano no |
| 48 | Pisos variables según mazmorra | ✅ | DungeonGenerator variable floor |
| 49 | Secretas + puzzles + NPC + trampas | ✅ datos | DungeonGenerator genera todos los tipos, sin UI/lógica |
| 50 | Clanes en v1 | ❌ | No implementado |
| 51 | Loot híbrido (base + sufijos) | ✅ parcial | items.json con rareza, sin affix generator |
| 52 | Logros en v2 | ✅ | GameStorage tiene store 'achievements' |
| 53 | Temporadas | ❌ | Sin sistema |
| 54 | Gratis total + donaciones | ✅ | Sin monetización |
| 55 | Prioridad v1: TODO lo básico | ⚠️ | Ver desglose abajo |

---

## 🔴 BUGS CRÍTICOS CONOCIDOS (afectan jugabilidad)

### BUG 1 — CombatScene: HP del jugador NO se actualiza visualmente
```js
// CombatScene._updateDisplay() — línea ~398
this.playerHpFill.fillRoundedRect(14, 0, 0, 12, 4); // ← ancho = 0 siempre, hardcoded
```
**El jugador nunca ve su HP bajar en la barra.**

### BUG 2 — CombatScene: MP del jugador NO se actualiza visualmente
`playerMpFill` se crea pero nunca se llama `.clear()` + redraw en `_updateDisplay()`

### BUG 3 — CombatScene: `_drawEnemyPanel` recrea gráficos encima de los anteriores
Cada vez que se llama `_updateDisplay()`, dibuja nuevos Graphics encima sin borrar los anteriores → acumulación de objetos.

### BUG 4 — DungeonScene: enemigos del room no tienen `name` ni stats completos
Los enemies del DungeonGenerator solo tienen `id`, `hp`, `atk`, `def`. El CombatScene intenta hacer `full.name` que puede ser `undefined`.

### BUG 5 — FreeModeScene: `_drawPlayerAt` dibuja sobre gráficos anteriores en update()
Cada frame llama `clear()` y redibuja, pero los `this.add.text()` de etiquetas de objetos se acumulan porque se crean en `create()` y no se destruyen.

### BUG 6 — WorldMapScene: `_showRiftModal` crea un container pero los objetos se añaden a la escena, no al container
Los botones del modal no se destruyen correctamente al cerrar.

### BUG 7 — PrologueScene: `choicesContainer.removeAll(true)` no destruye las zonas interactivas
Las zonas de elecciones anteriores siguen activas bajo las nuevas.

### BUG 8 — CharacterScene/InventoryScene: `player.getEffectiveStats` puede fallar
Si el player viene del storage como plain object (sin métodos), `getEffectiveStats()` no existe → crash.

---

## 🟡 IMPLEMENTADO PERO INCOMPLETO / SUPERFICIAL

| Sistema | Estado real |
|---|---|
| **WorldFlags/decisiones** | Se guardan flags pero NO hay ramificaciones reales en historia |
| **Sistema de hora** | TIME_PERIODS definido, `encounterMod` existe pero NUNCA se usa al generar encuentros |
| **GPS** | Se detecta y muestra indicador, pero las coords NO se convierten a posición en mapa |
| **Habitaciones secretas/puzzles/trampas** | Generadas en DungeonGenerator, pero DungeonScene solo renderiza combat/rest/treasure/boss |
| **Boss fases** | `phases` en datos, pero la UI del boss no cambia entre fases |
| **Prestige** | Campo en PlayerState, sin lógica de reset |
| **Habilidades del jugador** | Nunca se asignan al crear personaje (activeSkills = []) |
| **Loot real** | Rewards calculan items pero nunca se añaden al inventario del player |
| **NPCs del mundo** | Tipos definidos en DungeonGenerator, sin diálogos ni interacción |
| **Crafting/Runas** | En items.json existen runas, sin sistema de crafteo |
| **Mapa scrollable** | Drag funciona pero worldContainer está vacío de contenido real |
| **Modal de Brecha** | UI hecha, pero al entrar siempre genera el mismo tipo de mazmorra |

---

## 🔴 COMPLETAMENTE FALTANTE (no existe nada)

| Sistema | Formulario | Prioridad |
|---|---|---|
| **Audio dinámico** | P.46 — si_dinamico | ALTA |
| **SettingsScene** | Menú → Ajustes | ALTA |
| **Sistema de misiones (quests)** | Mega Prompt §73 | ALTA |
| **Habilidades se asignan al personaje** | P.20 — 6 en HUD | ALTA |
| **Loot real añadido al inventario** | P.51 | ALTA |
| **AR / Cámara** | P.32 — si_v1 | MEDIA |
| **WebRTC P2P real** | P.38 — si_100_local | MEDIA |
| **PvP escenas** | P.40 | MEDIA |
| **Clanes** | P.50 — si_v1 | MEDIA |
| **Sistema de prestige real** | P.27 | MEDIA |
| **GPS → coordenadas → posición en mapa** | P.28 | MEDIA |
| **Region Pack offline descargable** | P.34 — si_v1 | MEDIA |
| **Efectos de clima visual** | P.18 — si_full | BAJA |
| **i18n EN/ES real** | P.7 | BAJA |
| **EncounterEngine real** | Mega Prompt §11 | ALTA |
| **Notificaciones push** | P.45 | BAJA |
| **Service Worker real** | P.41 | MEDIA |
| **Árbol de habilidades** | Mega Prompt §88 | MEDIA |
| **Sistema de títulos** | Mega Prompt §90 | BAJA |
| **Sistema de afinidad/NPC** | Mega Prompt §81 | MEDIA |
| **Temporadas** | P.53 | BAJA |
| **Debug Mode** | Mega Prompt §188 | BAJA |
| **Auto-guardado periódico** | — | ALTA |

---

## PLAN DE ACCIÓN — ORDEN DE PRIORIDAD

### SPRINT 1 — Bugs críticos que rompen la jugabilidad
1. Fix HP/MP bars en CombatScene (se actualizan correctamente)
2. Fix acumulación de Graphics en CombatScene._updateDisplay
3. Fix enemies sin name/stats en DungeonScene → CombatScene
4. Fix habilidades asignadas al crear personaje
5. Fix loot real se añade al inventario
6. Fix modal de brecha destruye objetos al cerrar

### SPRINT 2 — Sistemas incompletos más importantes
1. EncounterEngine real (hora → modifica qué aparece)
2. SettingsScene funcional
3. Misiones básicas (3-5 misiones del prólogo)
4. Sistema de prestige completo
5. Habitaciones de mazmorra: puzzle, trampa, NPC con interacción real

### SPRINT 3 — Sistemas nuevos prioritarios
1. Audio dinámico (Web Audio API)
2. WebRTC P2P básico para 2 jugadores
3. Árbol de habilidades / desbloqueo
4. AR/Cámara opcional

### SPRINT 4 — Pulido y sistemas adicionales
1. Clanes
2. PvP (duelo local)
3. Temporadas
4. Efectos de clima
5. i18n completo

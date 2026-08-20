# 📝 FORMULARIO DE DESARROLLO — FASE 2
**Abyssal Echoes of the Deep** — Rama: `main` (post-Fase 1, commit `7ba7e1c`)
**Fecha:** 2026-08-20 — **Responsable:** Equipo senior (dev + arquitectura + diseño)
**Regla §193:** NO asumir respuestas. Si no respondes, usar defaults de Fase 1 (`A1/N3/J1/M1/M2/N1`) y los establecidos en `docs/FORMULARIO_DE_DESARROLLO.md`.

---

## A. SEGURIDAD / TOKEN / PROTOCOLO DE PUSH

1. ¿Confirmas que el token de Vercel fue revocado y que `docs/VERCEL_FIX.md` ya no contiene secretos?
2. ¿Confirmas que `main` debe recibir siempre el commit de integración antes de cualquier redeploy?
3. ¿Deseas que `vercel.json` se mantenga igual (`framework: null`, SPA fallback, headers SW) o se modifican headers para Fase 2?
4. ¿Se requiere una política de `Content-Security-Policy` más estricta para NPC/dialogos dinámicos?
5. ¿El archivo `localStorage` (`abyssal_save_v1`) debe incluir un checksum de integridad para evitar corrupción entre sesiones?
6. ¿Se requiere cifrado básico (obfuscación + salt) para datos de partido (room IDs, player stats local)?
7. ¿Confirmas que no se guardarán datos de jugadores en servidores externos (P2P puro)?
8. ¿Se debe agregar un botón de "Borrar todos los datos locales" visible en Settings (Fase 2)?

---

## B. GPS / MUNDO REAL / ANTI-TELEPORT / SUAVIZADO

9. ¿Confirmas que `GpsService` (`src/gps/gps.js`) mantiene umbral 15 m y anti-teleport 5000 m?
10. ¿Querés que el suavizado de coordenadas (`smoothing`) sea más agresivo (ej. 5 puntos de media móvil) para GPS urbano?
11. ¿Se activa modo "Mundo Real" solo si `navigator.geolocation` está disponible y con `watchPosition` (no `getCurrentPosition` único)?
12. ¿Se requiere una pantalla de "Calibración GPS" con mapa hecho con `MapModel` antes de entrar al mundo?
13. ¿Se debe mostrar la distancia al POI más cercano (mazmorra / aldea / brecha) como indicador en HUD?
14. ¿Querés que el mundo real use los biomas (`Cripta`, `Castillo`, `Cueva`, `Templo`, `Ruinas`, `Abismo`) como zonas de transición física (ej. caminando 500 m cambia biome)?
15. ¿Se requiere un límite de velocidad de movimiento (`maxSpeed`) para evitar exploits con GPS fake (anti-teleport extendido)?
16. ¿Confirmas que `worldX / worldZ` se convierten a coordenadas del mapa procedural (`MapModel`) sin rotación extra?
17. ¿Se debe integrar un "modo sin GPS" (modo libre sin geolocalización) como fallback permanente?
18. ¿Querés que los puntos de interés (POI) tengan un icono 3D sobre el mapa (`renderer.js`) y un efecto de sonido de proximidad (`audio.js`)?

---

## C. NPC / MISIONES / DIÁLOGOS / LORE

19. ¿Confirmas que los NPC deben tener nombres generados o predefinidos (`lore.js` + base de datos estática)?
20. ¿Se requiere un sistema de "Misiones" con 3 tipos: Principales (historia Fase 3-4), Secundarias (recompensa), Diarias (rotativas)?
21. ¿Las misiones deben guardarse en `localStorage` (`abyssal_save_v1`) con un campo `quests: [{id, status, progress, reward}]`?
22. ¿Se requiere un diálogo con opciones múltiples (A/B/C) que afecten el estado de la misiones?
23. ¿Los diálogos deben usar texto sintetizado (`audio.js` + `SpeechSynthesis`) o solo subtítulos con sonido ambiental?
24. ¿Confirmas que `lore.js` (`INTRO`, `WORLD_LORE`, `LOADING_TIPS`, `MODES`) debe ampliarse con diálogos de NPC por zona?
25. ¿Se requiere que los NPC vendan objects (`items.js`) o solo den misiones y lore?
26. ¿Se debe incluir un sistema de "reputación" por aldea (ej. `factionReputation: {crita, abismo}`) para Fase 3?
27. ¿El diálogo debe ser en español (como usuario escribe) o multilingüe (es/en) con fallback?
28. ¿Se requiere un "diario de misión" accesible desde `Profile` (`screens.js`) con lista de activos y completados?
29. ¿Confirmas que los NPC tendrán modelos 3D simples (`renderer.js` con geometrías básicas) en lugar de sprites 2D?
30. ¿Se requiere animación de diálogo (sprite de habla flotante) sobre el NPC?

---

## D. CRAFTING / FABRICACIÓN / INVENTARIO AVANZADO / EQUIPAMIENTO

31. ¿Confirmas que `crafting` requiere una receta de base (`recipe: {ingredients: [{item, qty}], result, levelReq}`)?
32. ¿Se requiere una estación de crafteo física en el mapa (POI `craftingStation`) o solo acceso desde menú?
33. ¿El inventario (`inventory[]`) debe expandirse a 48 o 64 slots (actual ~20)?
34. ¿Se requiere categorización visual: Armas, Armaduras, Consumibles, Materiales, Misiones?
35. ¿Confirmas que `items.js` debe incluir materiales de crafteo (`iron_shard`, `abyssal_essence`, `crystal_soul`) con valores de rareza (`RARITY`)?
36. ¿Se requiere que los objetos crafteados tengan estadísticas variables (`rollStat`) dependiendo del nivel del jugador?
37. ¿Se debe agregar un sistema de "destrucción / desmantelamiento" de objetos para recuperar materiales?
38. ¿El equipamiento (`equipItem`) debe incluir ranuras (head, torso, legs, weapon, accessory) con bonificaciones de set?
39. ¿Se requiere un límite de peso / carga (`encumbrance`) que afecte velocidad y evasión?
40. ¿Confirmas que `progression.js` (`buildItem`, `applyConsumable`) debe actualizarse para craft results?
41. ¿Se debe incluir un "banco / caja fuerte" con slots adicionales para almacenar materiales sin ocupar inventario?
42. ¿Querés que los objetos tengan una historia de creación (`craftedBy`, `date`) para coleccionismo?

---

## E. PARTY / MULTIJUGADOR P2P / 4 JUGADORES / WEBRTC

43. ¿Confirmas que `MULTIPLAYER.maxPlayers = 4` es definitivo para Fase 2?
44. ¿El `NetHost` (`src/multiplayer/net.js`) debe sincronizar estado de combate (`snapshot`), inventario (`inventory`) y posición (`worldX/worldZ`) en tiempo real?
45. ¿Se requiere que la sala (`roomId`) se genere con `uid()` (`rng.js`) y que solo el host pueda expulsar jugadores?
46. ¿Se requiere una pantalla de `Lobby` previa al juego con lista de jugadores conectados, ready-check y chat básico?
47. ¿Confirmas que el chat debe ser local (solo en la pantalla de party) sin servidor externo, usando `DataChannel`?
48. ¿Se debe permitir que los jugadores compartan loot (`generateLoot`) entre sí (ej. "dar item a jugador X")?
49. ¿Se requiere que el host pueda asignar roles (líder, soporte, tanque, daño) con bonificaciones pasivas?
50. ¿Confirmas que si un jugador se desconecta (`DataChannel` `close`), su jugador NPC (controlado por IA básica) toma el turno para evitar bloqueo de combate?
51. ¿Se debe agregar un sistema de "voto" (mover escenario, iniciar combate, aceptar misión) con mayoría simple?
52. ¿El `drawQR` pseudo-QR debe incluir el `roomId` y un color de identificación para facilitar unión?
53. ¿Se requiere que los saves de party guarden cada jugador por separado (`save_1`, `save_2`, ...) o solo un save combinado?
54. ¿Confirmas que `localStorage` debe limpiar datos de sala al salrir (`deleteRoom`) para evitar fugas?

---

## F. DISEÑO / ESTÉTICA / ASSETS / AUDIO / UI

55. ¿Confirmas que la paleta abisal (`#4aa8ff`, `#9a5cff`, `#39e6c8`, `#ff4d6d`, `#f2c14e`) se mantiene?
56. ¿Se requiere un icono nuevo para Fase 2 (`icon-192`, `icon-512` actualizado) o se mantienen los actuales?
57. ¿Se requiere una animación de transición entre menú y juego (`transition`: fade + sonido de ondas) en `screens.js`?
58. ¿Se debe agregar un efecto de partículas (`renderer.js`) al entrar a mazmorras (polvo abisal, burbujas, chispas)?
59. ¿Confirmas que `style.css` debe incluir `safe-area-insets` para móviles y `backdrop-filter` para modales?
60. ¿Se requiere un modo "alto contraste" o "daltonismo" como opción en `Settings`?
61. ¿Se debe agregar música ambiental sintetizada (`audio.js`) por bioma (`Cripta` = grave, `Abismo` = pulsos bajos, `Templo` = campanas distantes)?
62. ¿Confirmas que los efectos de sonido (ataque, impacto, drop de item, nivel up) deben ser generados con `OscillatorNode` sin archivos `.mp3`?
63. ¿Se requiere que los diálogos de NPC tengan subtítulos con fuente de consola (`monospace`) y sombra oscura para legibilidad?

---

## G. BALANCE / CLASES / COMBATE / PROGRESIÓN / DIFICULTAD

64. ¿Confirmas que las 15 clases (`CLASSES` en `constants.js`) se mantienen sin cambios estructurales, solo con nuevas habilidades opcionales?
65. ¿Se requiere que cada clase tenga una habilidad pasiva de Fase 2 (ej. "Crafteo avanzado", "GPS exacto", "Bonus party")?
66. ¿Confirmas que `combat.js` mantiene cooldowns, mana, combos y ultimate?
67. ¿Se debe agregar un sistema de "dificultad dinámica" (`dynamicDifficulty`) que escala enemigos según nivel promedio de la party?
68. ¿Confirmas que `enemy.js` mantiene el fix de HP (`lvlScale = 1 + (level-1)*0.25`; `maxHp = Math.max(20, floor(...))`) y que `guardian` sigue con `hp:300`?
69. ¿Se requiere que los enemigos de Fase 2 tengan nuevas mecánicas (ej. `guardian` fase 4 con invocación de minions)?
70. ¿Confirmas que `progression.js` (`addXp`, `generateLoot`, `buildItem`) debe actualizarse para incluir recompensas de misiones y crafting?
71. ¿Se requiere un sistema de "títulos" (`earnTitles`) con logros de Fase 2 (ej. "Explorador Abisal", "Maestro del Crafteo")?
72. ¿Se debe agregar un límite de nivel (`maxLevel`) o se mantiene infinito con escala de dificultad?

---

## H. DATOS / SAVE / EXPORT / PRIVACIDAD / LOCALSTORAGE

73. ¿Confirmas que `save.js` (`abyssal_save_v1`) debe incluir campo `version: 2` para Fase 2 (backward compatible con v1)?
74. ¿Se requiere que `exportSave` genere un `.json` con todos los datos de party (si hay 4 jugadores)?
75. ¿Confirmas que `importSave` debe validar la versión y rechazar saves corruptos o con datos faltantes?
76. ¿Se requiere que `deleteSave` borre no solo `localStorage` sino también cualquier residuo de `IndexedDB` (si se usa)?
77. ¿Confirmas que los datos de GPS (`worldX`, `worldZ`) no deben exportarse por privacidad (opción de borrado parcial)?
78. ¿Se debe agregar un log de cambios (`changelog`) en `README.md` con cada fase?

---

## I. MONETIZACIÓN / DONACIONES / PRIVACIDAD / PREMIUM (SIN PAY-TO-WIN)

79. ¿Confirmas que sigue siendo **gratuito + donaciones** (no pay-to-win, no gacha, no lootbox pago)?
80. ¿Se requiere un botón de donación (`Ko-fi` / `PayPal`) visible en `Settings` y al completar misiones clave?
81. ¿Se debe incluir un mensaje de agradecimiento (título o insignia) para donantes (opcional, no obligatorio)?
82. ¿Confirmas que no se recopilarán datos personales (email, nombre real) sin consentimiento explícito?
83. ¿Se requiere una página de `Profile` pública (solo estadísticas, no datos sensibles) para compartir?

---

## J. ROADMAP / CONFIRMACIÓN / HOJA DE FIRMAS FASE 2

84. ¿Confirmas que **Fase 2** = GPS pulido + NPC/misiones + Crafting + Party 4 + Art/Balance + Save v2?
85. ¿El orden de trabajo recomendado es: (1) GPS/NPC, (2) Crafting, (3) Party 4, (4) Art/Balance, (5) Save/Export?
86. ¿Confirmas que `Mega promts` sigue sin ser reescrito (regla del proyecto)?
87. ¿Se debe actualizar `README.md` con instrucciones de Fase 2 y guía de party?
88. ¿Confirmas que el formulario (`FORMULARIO_DE_DESARROLLO.md`) debe mantener sus 80 preguntas de Fase 1 sin borrarlas?
89. ¿Se requiere que `GDD_ABYSSAL_ECHOES.md` se actualice con la tabla de Fase 2 (GPS/NPC/Crafting/Party) antes de empezar codificación?
90. ¿Confirmas que el siguiente paso (si respondes con defaults) es: crear `src/npc/` + `src/crafting/` + actualizar `net.js` para party 4, con commit y push a `main`?

---

## HOJA DE FIRMAS — FASE 2

- Proyecto: **Abyssal Echoes of the Deep**
- Fase actual: **Fase 2** (GPS / NPC / Crafting / Party 4)
- Estado Fase 1: ✅ Entregado (commit `5550822` / `7ba7e1c`)
- Documento: `docs/FORMULARIO_DE_DESARROLLO_FASE2.md` (90 preguntas)
- Decisiones por defecto (si no respondes): GPS igual (`15m/5000m`), NPC con texto simple, Crafting básico (recetas fijas), Party 4 (`maxPlayers=4`), Art igual (`paleta abisal`), Balance igual (`HP fix` + `guardian`), Save v2 (`version: 2`), Sin pay-to-win.
- Confirmación del usuario para empezar: [ ] Sí — usar defaults y empezar Fase 2  [ ] No — respondo preguntas primero  [ ] Mixto — respondo solo algunas (indicar números).
- Fecha: 2026-08-20 — Responsable: Equipo senior.

# 🌀 ABYSSAL ECHOES OF THE DEEP — GDD (Game Design Document)

> Documento de diseño v0.1 · Proyecto original · PWA · Fantasía oscura
> Se genera conforme al Mega Prompt §§207-208 tras recoger las decisiones del creador.

---

## 1. Decisiones clave del creador (Hoja de firmas)

| Área | Decisión |
|------|----------|
| Nombre | **Abyssal Echoes of the Deep** (provisional confirmado) |
| Motor visual | **Three.js / WebGL 3D** (empaquetado local) |
| Alcance | Todo el prompt: Modo Libre, Mundo Real+GPS, mazmorras, combate, multijugador Wi-Fi local, offline-first |
| Estética | **Azul abisal + violeta + negro** (fantasía oscura) |
| Monetización | **Gratuito + donaciones** (sin pay-to-win) |
| Extra | **Creación de personaje con las 15 clases** |

---

## 2. Concepto (Lore)

La ciudad real descansa sobre un abismo silencioso. Aparecen **Brechas** que conectan nuestro mundo con el **Reino de las Brechas**: mazmorras, ruinas, dimensiones rotas. Todo aventurero aprende la **Proyección**: separar la conciencia del cuerpo para cruzar la Frontera y explorar desde cualquier lugar.

**El mundo real es el mapa exterior** (parques→Bosque de las Sombras, zonas urbanas→Zona Urbana, agua→cercanías acuáticas). Nunca se modifica el mapa real; se superpone una capa fantástica.

---

## 3. Modos de juego

- **Mundo Real:** geolocalización + brújula; el jugador camina físicamente. Los encuentros dependen de bioma, hora y densidad de zona.
- **Modo Libre (Proyección):** joystick virtual; movimiento en el Dominio de las Brechas. Distancias separadas: `REAL_EXPLORATION_DISTANCE` y `VIRTUAL_EXPLORATION_DISTANCE`.

---

## 4. Combate

- Acción en tiempo real con cooldowns, coste, prioridad.
- Acciones: Ataque, Habilidad, Defender, Esquivar, Ultimate.
- **Combos modulares por tags** (Hielo+Rayo=Tormenta Helada; Fuego+Viento=Tempestad Infernal; Sombra+Sangre=Vínculo Abisal...).
- Efectos de estado: Veneno, Quemadura, Sangrado, Congelación, Parálisis, Silencio, Maldición, Ceguera, Debilidad, Frenesí, Lento, Marcado.
- Enemigos por familias y comportamientos (Beast, Demon, Undead, Spirit, Construct, Abyssal, Ancient...) con IA.
- Bosses con fases y mecánicas.
- Narrativa reactiva durante la batalla.

## 5. Mazmorras

- Generación procedimental por seeds (WORLD/REGION/DUNGEON/EVENT/ENCOUNTER).
- Pisos con profundidad infinita; habitaciones (encuentro, tesoro, élite, evento, trampa, boss).
- Biomas: Cripta, Castillo, Cueva, Templo, Ruinas, Dimensión Rota.
- Reproducible con la misma seed.

## 6. Progresión

- Nivel abierto, poder total = nivel+equipo+habilidades+runas+maestría+títulos+artefactos+decisiones.
- 15 clases con caminos de evolución.
- Loot procedimental con rarezas (Common→Unknown) y afijos.
- Crafting, títulos, maestría, inventario con equipo por ranuras.

## 7. Multijugador local Wi-Fi

- 2–4 jugadores, misma red, **sin servidor externo**.
- WebRTC RTCDataChannel + señalización local (código / QR / copy-paste).
- El otro jugador aparece físicamente en el mundo; coords locales respecto a un origen (evita números gigantes).
- Party, revive, duelo, arenas (fases futuras).

## 8. Offline-first / PWA

- Service Worker + Cache API + IndexedDB + Web Workers + Web Crypto.
- La campaña individual funciona 100% sin internet tras la primera carga.
- Guardado local versionado con migración.
- GPS sin conexión; si no hay posición, cambia automáticamente a Modo Libre.

## 9. Arquitectura (resumen)

```
index.html → src/main.js → core/game.js (controlador)
├─ core/      constantes, bus de eventos, RNG con semilla
├─ data/      JSON-like de clases, skills, enemigos, items, biomas, lore
├─ player/    personaje, progresión, loot
├─ world/     mapa procedimental + motor de encuentros
├─ dungeon/   generador de mazmorras
├─ combat/    controlador de combate + combos + efectos
├─ enemy/     instancia de enemigo + IA
├─ render/    Three.js (escena, mundo, mallas)
├─ gps/       geolocalización con suavizado y anti-teleport
├─ multiplayer/ WebRTC P2P local
├─ storage/   guardado versionado
├─ ui/        pantallas y HUD
└─ audio/     sonido sintetizado (Web Audio)
```
Proveedores desacoplados (GeoProvider, MapProvider, NetworkProvider, CombatProvider) para poder sustituirse sin reescribir el juego (Mega Prompt §209).

## 10. Roadmap

- **Fase 1 (hecha en este prototipo):** PWA + carga + menú + creación de personaje (15 clases) + Modo Libre + mapa + 1 mazmorra + 3+ monstruos + boss + habilidades + combos + loot + nivel + guardado + combate + pantalla multijugador local.
- **Fase 2:** GPS smoothing real completo, encounters por zona real, chunks, NPC, misiones, crafting, más clases, party 4 jugadores.
- **Fase 3:** cámara/AR opcional, world events, bosses, facciones, clanes, PvP.
- **Fase 4:** historia larga ramificada, mazmorras profundas, contenido secreto, temporadas.

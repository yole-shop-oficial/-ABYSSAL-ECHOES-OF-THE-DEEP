# 🌀 ABYSSAL ECHOES OF THE DEEP

RPG de fantasía oscura para móviles, construido como **PWA offline-first** con **Three.js (WebGL 3D)**.

*"Un RPG de fantasía oscura donde el mundo real es la puerta de entrada a un universo de Brechas y mazmorras, pero donde cada aventurero también puede proyectarse dentro de ese mundo desde cualquier lugar."*

---

## ▶️ Cómo jugar (desarrollo)

El juego se sirve como archivos estáticos. Opciones:

```bash
# Opción A: Python
python3 -m http.server 8090
# abre http://localhost:8090

# Opción B: cualquier servidor estático
npx serve .
```

### En móvil / instalar como PWA
- Ábrelo en el navegador móvil y usa "Añadir a pantalla de inicio".
- **Offline-first:** el Service Worker cachea el shell y los datos; la campaña individual funciona sin internet tras la primera carga.

## 🎮 Cómo se juega
1. **Crear aventurero:** elige una de las 15 clases.
2. **Elegir modo:**
   - 🌍 **Mundo Real** — usa tu GPS (permiso del navegador). Caminar cambia tu posición; los encuentros dependen de zona/hora.
   - 🌀 **Modo Libre (Proyección)** — joystick virtual, explora el Reino de las Brechas desde cualquier lugar.
3. **Moverte:** joystick táctil (o WASD en escritorio).
4. **Combatir:** botones de habilidad con cooldown; combina elementos para **combos**; carga la barra **ULT**.
5. **Mazmorras:** acércate a un pilar de luz (mazmorra/brecha) y entra. Derrota al **Guardián del Abismo** (boss con fases).
6. **Progresa:** loot, niveles, títulos, equipo. Todo se guarda localmente (💾).

## 🌐 Multijugador local (Wi-Fi)
Menú **Multijugador**: un jugador "Crea partida" (genera un offer/código + QR), el otro "Unirse" pega el offer y devuelve la respuesta. WebRTC P2P en la misma red, **sin internet**.

## 📁 Estructura
- `docs/` — formulario de desarrollo, GDD, decisiones del creador.
- `src/` — código modular (core, data, player, world, dungeon, combat, enemy, render, gps, multiplayer, storage, ui, audio).
- `assets/vendor/three.min.js` — Three.js empaquetado localmente (offline).
- `sw.js` + `manifest.json` — PWA.

## 🗺️ Roadmap
- ✅ **Fase 1:** prototipo jugable completo (este entregable).
- ⏳ **Fase 2:** GPS real pulido, encounters por zona, NPC, misiones, crafting, party 4 jugadores.
- ⏳ **Fase 3:** cámara/AR opcional, world events, facciones, clanes, PvP.
- ⏳ **Fase 4:** historia larga ramificada, mazmorras profundas, temporadas.

## 🧪 Pruebas
La lógica (combate, combos, generación de mapas/mazmorras, guardado) se verificó con pruebas de runtime; el arranque completo del juego pasó sin errores en un entorno de ejecución headless.

## 🧾 Licencia
Proyecto original del creador. Icono y arte generados específicamente para este proyecto. Sin monetización pay-to-win (gratuito + donaciones).

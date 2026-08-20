# 🌀 ABYSSAL ECHOES OF THE DEEP
## Formulario de Desarrollo — Documento de Requisitos del Creador

> **Nombre provisional del juego:** *Abyssal Echoes of the Deep*
> (coincide con el nombre del repositorio; pendiente de aprobación final, ver sección A)
>
> **Regla del proyecto (Mega Prompt §193):** *NO asumir las respuestas. Antes de escribir el código completo hay que responder el formulario, detectar contradicciones, agrupar decisiones, y solo entonces producir GDD, arquitectura, modelo de datos, flujo de pantallas, networking, mapa, offline y roadmap.*

Este documento contiene **más de 50 preguntas** organizadas por áreas. Responde todas las que puedas. Si una no la respondes, se tomará el **valor por defecto** indicado en cursiva, marcado como `[DEFECTO]`. Al final hay una hoja de firmas donde se consolidan las decisiones para que nadie asuma nada.

---

## A. Identidad y visión del juego

**A1. Nombre provisional.** El Mega Prompt (§3) exige generar de 10 a 20 nombres originales y NO decidir sin tu aprobación. ¿Confirmas *"Abyssal Echoes of the Deep"* como provisional, o prefieres que genere una lista de 20 nombres para que elijas?
- ✅ Confirmo el nombre del repositorio (provisional)
- ⏳ Que me generes la lista de 20 nombres y elijo después
- ✍️ Tengo mi propio nombre: ____

**A2. Estilo visual general (§96).** Estética de fantasía oscura, cinematográfica, mística, moderna y elegante (sin parecer anime genérico). ¿Qué nivel de "oscuridad" quieres?
- 🩸 Oscuridad profunda / madura
- 🌒 Oscuridad equilibrada con momentos épicos
- 🔥 Épica brillante con toques oscuros

**A3. Nivel de realismo (§3, §96).** ¿Más realista o más estilizado?
- 🎨 Estilizado / stylized (concept art, sombras suaves) `[DEFECTO]`
- 📷 Semi-realista
- ✏️ 2D ilustrado / novela visual

**A4. Público objetivo (§5).**
- 🧒 Todos (8+)
- 🧑 Jóvenes (13+)
- 👤 Adultos (18+)
- 👥 Sin restricción específica `[DEFECTO]`

**A5. Nivel de violencia (§6).**
- 🕊️ Baja (sin sangre, enemigos se desvanecen) `[DEFECTO]`
- ⚔️ Media (combate, sin gore explícito)
- 🩸 Alta (gore y sangre)

**A6. Tono narrativo (§7).**
- 🌫️ Misterioso y melancólico `[DEFECTO]`
- ⚔️ Épico y heroico
- 😈 Oscuro e inquietante
- ⚖️ Mixto (tonos alternos)

**A7. Protagonista (§8).** ¿Qué tipo de personaje controla el jugador?
- 🎭 Creado por el jugador (clase + aspecto) `[DEFECTO]`
- 📖 Protagonista definido con historia propia
- 🔄 Ambos (híbrido)

**A8. Género del protagonista (§9).**
- ⚧️ Elección libre masculino/femenino/neutro `[DEFECTO]`
- 🚹 Masculino
- 🚺 Femenino

**A9. Impacto de las decisiones (§10).** ¿Cuánto cambian las decisiones la historia?
- 🟢 Bajo (historia lineal con ramas menores)
- 🟡 Medio (algunos finales y eventos según decisiones) `[DEFECTO]`
- 🔴 Alto (historia fuertemente ramificada, múltiples finales)

---

## B. Mundo real / GPS / mapa

**B1. Rol del mapa real (§11, §12).** ¿El mapa real se usa solo como fondo/posición, o también como zonas jugables con encuentros?
- 🗺️ Mapa real + zonas jugables completas `[DEFECTO]`
- 🗺️ Mapa real como fondo/posición, encuentros por overlay simple

**B2. Tamaño de región descargable offline (§7).** Tamaño máximo aprox. de un "Region Pack" descargable.
- 📦 10–25 MB `[DEFECTO]`
- 📦 25–100 MB
- 📦 100+ MB (ciudad completa)

**B3. Descarga de ciudad completa (§13).** ¿Debe poder descargarse una ciudad completa para jugar offline?
- ✅ Sí `[DEFECTO]`
- ⏹️ Solo zonas/barrios individuales

**B4. Uso de GPS (§14).** ¿El juego debe usar geolocalización en la aventura?
- ✅ Sí, con permiso y desactivación opcional `[DEFECTO]`
- ❌ No usar GPS

**B5. Sin GPS (§15, §114).** ¿Qué pasa si el GPS no está disponible?
- 🔁 Cambiar automáticamente a MODO LIBRE `[DEFECTO]`
- ⚠️ Usar posición manual/última conocida
- 🛑 Bloquear el modo mundo real

**B6. Influencia de la hora (§14, §152).** ¿Cuánto cambian los encuentros según la hora del día?
- 🟢 Ligera
- 🟡 Media (día/noche claros) `[DEFECTO]`
- 🔴 Alta (madrugada con eventos rarísimos)

**B7. Eventos nocturnos (§17).** ¿Quieres criaturas/eventos exclusivos de noche?
- ✅ Sí `[DEFECTO]`
- ❌ No

**B8. Tipo de zona real influye en monstruos (§12, §18).** ¿Parques→bestias, zona urbana→sombras, agua→criaturas acuáticas, etc.?
- ✅ Sí, biomas por tipo de zona `[DEFECTO]`
- ⏹️ No, encuentros uniformes

**B9. Clima real (§19, §151).** ¿Usar clima real (solo cuando hay conexión) para modificar encuentros?
- ✅ Opcional y degradable `[DEFECTO]`
- ❌ Ignorar clima

**B10. Lugares reales especiales (§20).** ¿Parques/plazas/edificios abandonados tienen funciones especiales (ruinas, puntos de reunión, Brechas)?
- ✅ Sí `[DEFECTO]`
- ⏹️ No, solo decorativos

**B11. Privacidad GPS (§8, §155).** Confirmas que las coordenadas NUNCA se suben a servidores y el modo local/offline es LOCAL-ONLY.
- ✅ Confirmado `[DEFECTO]`
- ⚠️ Quiero sincronización cloud futura (opcional)

---

## C. Modo Libre (Proyección)

**C1. Nombre de la habilidad universal (§17, §21).**
- 🌀 Proyección `[DEFECTO]`
- ✨ Tránsito Astral
- 👻 Excursión del Alma
- ✍️ Otro: ____

**C2. Desbloqueo (§22).** ¿La Proyección se desbloquea al inicio o mediante historia?
- 🗝️ Al inicio del juego `[DEFECTO]`
- 📖 Mediante historia (primeros capítulos)

**C3. Limitación de uso (§23).** ¿La Proyección debe ser ilimitada o limitada?
- ♾️ Ilimitada `[DEFECTO]`
- 🔋 Limitada por energía/recarga

**C4. Consumo de energía (§24).** ¿Debe consumir un recurso (mana/energía de proyección)?
- ⚡ Sí, con regeneración
- 🚫 No consumir nada `[DEFECTO]`

**C5. Caminar sin límite (§25).** ¿En Modo Libre se puede explorar sin límite de distancia?
- ✅ Sí, sin límite `[DEFECTO]`
- ⏳ Limitado por nivel/energía

**C6. Zonas exclusivas (§26, §169).** ¿Debe haber Brechas/mazmorras SOLO accesibles en Modo Libre (y otras solo en Mundo Real)?
- ✅ Sí, exclusividad mixta `[DEFECTO]`
- ❌ Todo accesible desde ambos modos

**C7. Mapa propio (§27).** ¿El Modo Libre tiene su propio mapa virtual (bosque, ruinas, ciudad de las sombras)?
- ✅ Sí, mapa de "El Dominio de las Brechas" `[DEFECTO]`
- ❌ Reutiliza el mapa del mundo real

**C8. Alcance del contenido (§28, §29).** ¿Desde Modo Libre se puede acceder a TODAS las mazmorras y obtener todo el loot?
- ✅ Sí, progresión completa sin salir `[DEFECTO]`
- ⚠️ La mayoría, pero algunos objetos/eventos solo en Mundo Real

**C9. Recompensas diferentes (§30).** ¿El Modo Libre ofrece recompensas distintas al Mundo Real (descubrimientos, títulos)?
- ✅ Sí, sistema de descubrimientos y títulos `[DEFECTO]`
- ⏹️ Mismas recompensas

**C10. Distancias separadas (§21, §145, §146).** Confirmas que REAL_EXPLORATION_DISTANCE y VIRTUAL_EXPLORATION_DISTANCE se guardan por separado (nunca se finge que caminaste físicamente).
- ✅ Confirmado `[DEFECTO]`

---

## D. Combate

**D1. Ritmo del combate (§28, §31).** ¿Muy rápido (action) o moderado?
- ⚡ Rápido / orientado a acción `[DEFECTO]`
- 🧘 Moderado con tiempos tácticos
- 🐢 Lento por turnos (NO recomendado por el prompt)

**D2. Habilidades visibles (§32).** ¿Cuántas habilidades simultáneas en el HUD de combate?
- 🔢 4 botones `[DEFECTO]`
- 🔢 6 botones
- 🔢 8 botones

**D3. Apuntado automático (§33).** ¿Apuntado automático a objetivos?
- ✅ Sí `[DEFECTO]`
- 🎯 Manual

**D4. Esquiva manual (§34).** ¿Botón de esquivar manual con ventana de invulnerabilidad?
- ✅ Sí `[DEFECTO]`
- ❌ No

**D5. Defensa (§35).** ¿Acción de defender/guardia?
- ✅ Sí `[DEFECTO]`
- ❌ No

**D6. Combos (§36, §37).** ¿Sistema de combos por tags elementales (ICE+LIGHTNING=STORM_FROZEN, etc.)?
- ✅ Sí, sistema modular por tags `[DEFECTO]`
- ⏹️ Sin combos

**D7. Ataques definitivos (§37).** ¿Barras de Ultimate/definitivos?
- ✅ Sí `[DEFECTO]`
- ❌ No

**D8. Estados elementales (§38).** ¿Efectos de estado (veneno, quemadura, congelación, sangrado, etc.)?
- ✅ Sí, los 12 estados del prompt `[DEFECTO]`
- 🟡 Solo los básicos

**D9. Daño crítico (§39).** ¿Sistema de críticos?
- ✅ Sí `[DEFECTO]`
- ❌ No

**D10. Enemigos que aprenden (§40).** ¿Enemigos con IA adaptable a los patrones del jugador?
- 🟢 No (IA fija)
- 🟡 IA con variación moderada `[DEFECTO]`
- 🔴 IA que aprende y contraataca

**D11. Narrativa en combate (§30).** ¿Texto narrativo reaccionando a la batalla ("El Guardián levanta su brazo..." → [ESQUIVAR])?
- ✅ Sí, narrativa dinámica en combate `[DEFECTO]`
- ⏹️ Solo texto de log

---

## E. Mazmorras

**E1. Jugadores máximos por mazmorra (§41, §51, §63).**
- 👤 1 (solo)
- 👥 2
- 👥👥 3
- 👥👥👥 4 `[DEFECTO]`

**E2. Duración (§42).** ¿Mazmorras cortas o largas?
- 🕒 Cortas (10–20 min) `[DEFECTO]`
- 🕓 Medianas (20–40 min)
- 🕖 Largas (40+ min)

**E3. Pisos infinitos (§43).** ¿Mazmorras con profundidad procedimental infinita (piso 1, 10, 100, ???)?
- ✅ Sí, profundidad infinita `[DEFECTO]`
- ⏹️ Profundidad fija

**E4. Checkpoints (§44).** ¿Checkpoints / guardado dentro de la mazmorra?
- ✅ Sí, checkpoints por piso `[DEFECTO]`
- ❌ Sin checkpoints (riesgo alto)

**E5. Bosses con fases (§45, §66).** ¿Bosses con varias fases y mecánicas?
- ✅ Sí `[DEFECTO]`
- ⏹️ Bosses simples

**E6. Habitaciones secretas (§46).** ¿Habitaciones secretas ocultas?
- ✅ Sí `[DEFECTO]`
- ❌ No

**E7. Puzzles (§47).** ¿Puzzles dentro de mazmorras?
- ✅ Sí, puzzles ligeros `[DEFECTO]`
- ⏹️ Sin puzzles

**E8. Trampas (§48).** ¿Trampas (suelos, flechas, lazos)?
- ✅ Sí `[DEFECTO]`
- ❌ No

**E9. Mazmorras vivientes (§44, §49).** ¿Mazmorras que cambian de ruta/enemigos entre visitas?
- ✅ Sí, procedimental viviente `[DEFECTO]`
- ⏹️ Estáticas

**E10. Mazmorras exclusivas Mundo Real (§50, §170).** ¿Mazmorras híbridas que empiezan en Mundo Real y continúan en dimensión propia?
- ✅ Sí `[DEFECTO]`
- ⏹️ Todas entran igual

**E11. Tipo de mazmorras (§41).** Marca las que quieres en la primera fase (marca todas las que apliquen):
- 🏰 Criptas / castillos / cuevas / templos
- 🌲 Ruinas / bosques / torres / fortalezas
- 📚 Ciudades abandonadas / bibliotecas antiguas
- 🌌 Dimensiones rotas
- `[DEFECTO: todas, progresivamente por fases]`

---

## F. Multijugador

**F1. Jugadores por partida local (§48, §51).**
- 👥 2
- 👥👥 3
- 👥👥👥 4 `[DEFECTO]`

**F2. Visibilidad del otro jugador (§52, §104).** ¿El otro jugador debe verse físicamente en el mundo (avatar + posición + animación), no solo en lista?
- ✅ Sí, obligatorio `[DEFECTO]`
- ⏹️ Solo marcador/mapa

**F3. Chat (§53).** ¿Chat de texto?
- ✅ Sí
- ❌ No `[DEFECTO]`
- 💬 Emojis rápidos + frases predefinidas

**F4. Emojis/reacciones (§54).** ¿Emojis/reacciones rápidas?
- ✅ Sí `[DEFECTO]`
- ❌ No

**F5. Revivir (§55, §65).** ¿Sistema de revivir (Downed State + Revive Timer)?
- ✅ Sí `[DEFECTO]`
- ❌ No

**F6. Compartir loot (§56).** ¿Reparto/compartir loot entre la party?
- ✅ Sí `[DEFECTO]`
- ⏹️ Loot individual

**F7. Comercio (§57).** ¿Comercio entre jugadores?
- 🟡 Sí, comercio P2P local
- ⏹️ No `[DEFECTO]`

**F8. Duelos (§58).** ¿Modo duelo 1v1?
- ✅ Sí `[DEFECTO]`
- ❌ No

**F9. 2v2 (§59).** ¿Modo 2v2 en arena?
- ✅ Sí
- ❌ No `[DEFECTO]`

**F10. Dungeon Race (§60, §69).** ¿Modo carrera de mazmorras (misma seed, gana quien acabe antes)?
- ✅ Sí
- ❌ No `[DEFECTO]`

**F11. Tipos de partida (§67).** Modos competitivos locales que quieres en fases futuras (marca los que apliquen):
- ⚔️ Duel / Arena / 2v2 / Free for All
- 🏃 Dungeon Race / Boss Rush / Survival
- `[DEFECTO: Duel + Survival + Boss Rush en primera fase competitiva]`

---

## G. Wi-Fi local / P2P

**G1. Conexión sin Internet (§48, §61).** ¿Quieres multijugador local 100% sin Internet (misma red Wi-Fi)?
- ✅ Sí, obligatorio `[DEFECTO]`
- 🔄 Híbrido (online + local)

**G2. QR para negociación inicial (§49, §62).** ¿Aceptas usar QR para el intercambio inicial de señalización WebRTC?
- ✅ Sí `[DEFECTO]`
- 🔤 Prefiero solo código de sala
- ⚙️ QR + código + copy/paste

**G3. Código de sala (§50, §63).** ¿Código corto de sala (ej. AB7X-92)?
- ✅ Sí `[DEFECTO]`
- ❌ No

**G4. Expulsar jugadores (§64).** ¿El host puede expulsar jugadores?
- ✅ Sí
- ❌ No `[DEFECTO]`

**G5. Migración de host (§65, §130).** ¿Si el host abandona, otro jugador asume el control?
- ✅ Sí `[DEFECTO]`
- ❌ No (se cierra la sala)

**G6. Reconexión (§66, §128).** ¿Intentar reconexión automática ante desconexión momentánea?
- ✅ Sí `[DEFECTO]`
- ❌ No

**G7. Cambio de modo con la party (§67, §172).** ¿La party puede cambiar entre Mundo Real y Modo Libre / entrar en instancia común?
- ✅ Sí `[DEFECTO]`
- ⏹️ Fijo por sesión

**G8. Reunirse en Modo Libre (§68).** ¿Jugadores físicamente separados pueden reunirse en la misma instancia virtual del Modo Libre?
- ✅ Sí `[DEFECTO]`
- ❌ No

**G9. Cercanos en Mundo Real (§69).** ¿Jugadores físicamente cercanos aparecen en el mapa del Mundo Real?
- ✅ Sí `[DEFECTO]`
- ❌ No

**G10. Radio de visibilidad (§57, §70).** Distancia máxima de visibilidad entre jugadores.
- 50 m
- 100 m `[DEFECTO]`
- 250 m

**G11. Tecnología de red (§49).** Confirmas el stack: WebRTC RTCDataChannel + señalización local (QR/código/copy-paste), sin servidor de señalización remoto obligatorio.
- ✅ Confirmado `[DEFECTO]`

---

## H. Progresión

**H1. Nivel (§33).** ¿Nivel realmente infinito o número máximo enorme?
- ∞ Progresión abierta sin techo `[DEFECTO]`
- 🔝 Máximo enorme pero finito

**H2. Clases evolutivas (§31, §32).** ¿Clases que evolucionan (Guerrero→Guardian→Campeón→Clase Superior→Legendaria)?
- ✅ Sí `[DEFECTO]`
- ❌ No

**H3. Multiclase (§73).** ¿Permitir multiclase / cambiar de build?
- ✅ Sí, con coste `[DEFECTO]`
- ⏹️ Clase fija

**H4. Árbol de habilidades (§74, §88).** ¿Árbol de especializaciones con decisiones (no solo +5 daño)?
- ✅ Sí `[DEFECTO]`
- ⏹️ Habilidades lineales

**H5. Runas (§86).** ¿Sistema de runas combinables?
- ✅ Sí `[DEFECTO]`
- ❌ No

**H6. Crafting (§87, §177).** ¿Sistema de forja/alquimia/encantamiento/joyería/runas?
- ✅ Sí `[DEFECTO]`
- ⏹️ Sin crafting

**H7. Artefactos (§76, §34).** ¿Artefactos únicos con historia y habilidades?
- ✅ Sí `[DEFECTO]`
- ⏹️ Sin artefactos

**H8. Títulos (§90).** ¿Títulos desbloqueables con efectos pequeños?
- ✅ Sí `[DEFECTO]`
- ❌ No

**H9. Maestría (§89).** ¿Maestría por arma y habilidades que evolucionan con el uso?
- ✅ Sí `[DEFECTO]`
- ❌ No

**H10. Transformaciones (§80).** ¿Transformaciones/estados especiales?
- ✅ Sí
- ❌ No `[DEFECTO]`

**H11. Sistema de poder (§34).** ¿Poder total calculado de nivel+equipo+habilidades+runas+maestría+títulos+artefactos+decisiones+especialización?
- ✅ Sí `[DEFECTO]`

**H12. Rarezas (§84, §174).** ¿Rarezas de objetos (Common→Uncommon→Rare→Epic→Legendary→Mythic→Ancient→Unknown)?
- ✅ Sí, las 8 rarezas `[DEFECTO]`
- 🟡 Solo 5 básicas

**H13. Muerte (§91).** ¿Penalización por muerte?
- 🩹 Pérdida parcial (suelta loot / pena leve) `[DEFECTO]`
- 🌙 Sin pena significativa
- ☠️ Modo hardcore opcional

---

## I. Historia / narrativa

**I1. Longitud de la historia principal (§81).** ¿Extremadamente larga o moderada?
- 🌌 Muy larga, expandible indefinidamente `[DEFECTO]`
- 📖 Moderada con temporadas

**I2. Capítulos (§82).** ¿Historia por capítulos?
- ✅ Sí `[DEFECTO]`
- ❌ No

**I3. Decisiones permanentes (§83, §77).** ¿Decisiones con consecuencias reales y permanentes?
- ✅ Sí `[DEFECTO]`
- 🟡 Consecuencias moderadas

**I4. Finales diferentes (§84).** ¿Múltiples finales según decisiones?
- ✅ Sí `[DEFECTO]`
- ❌ Final único

**I5. NPC que pueden morir (§85).** ¿NPC pueden morir de forma permanente?
- ✅ Sí
- ❌ No `[DEFECTO]`

**I6. Personajes recurrentes (§86).** ¿Personajes recurrentes con memoria y relaciones?
- ✅ Sí `[DEFECTO]`
- ❌ No

**I7. Rivales (§79, §87).** ¿Rivales que evolucionan con el jugador?
- ✅ Sí `[DEFECTO]`
- ❌ No

**I8. Secretos (§88).** ¿Contenido oculto y lore ambiental?
- ✅ Sí `[DEFECTO]`
- ⏹️ Poco

**I9. Lore ambiental (§89).** ¿Lore recogible en el mundo (textos, ruinas, NPC)?
- ✅ Sí `[DEFECTO]`
- ⏹️ Mínimo

**I10. Expansión infinita (§90, §181, §182).** ¿La historia se expande indefinidamente (temporadas, contenido nuevo)?
- ✅ Sí `[DEFECTO]`
- ⏹️ Historia cerrada

**I11. Motor narrativo (§75).** ¿Sistema de World Flags para registrar decisiones y desbloquear consecuencias (saved_village, boss_derrotado, facción_amiga)?
- ✅ Sí `[DEFECTO]`

**I12. Compañeros (§80).** ¿Compañeros desbloqueables con afinidad (amistad/respeto/rivalidad, NO solo romance)?
- ✅ Sí `[DEFECTO]`
- ❌ No

---

## J. Visual / UI

**J1. Colores principales (§91).**
- 🌊 Azul abisal + violeta + negro `[DEFECTO]`
- 🔥 Negro + rojo carmesí
- 💜 Púrpura + dorado
- ✍️ Personalizado: ____

**J2. Estilo de paneles (§92, §97).** ¿Paneles/cards con bordes, brillos, sombreados, microanimaciones?
- ✅ Sí, paneles y cards oscuros `[DEFECTO]`
- ⏹️ Interfaz plana y minimalista

**J3. Iconos (§94, §95).** Confirmas: iconos SVG originales propios (nada de Font Awesome/Material/emoji como icono final).
- ✅ Confirmado `[DEFECTO]`

**J4. Retratos (§96).** ¿Retratos/ilustraciones de personajes y NPC?
- ✅ Sí, arte propio
- ⏹️ Solo iconos `[DEFECTO]`

**J5. Efectos luminosos (§95).** ¿Efectos luminosos/brillos en habilidades y UI?
- ✅ Sí `[DEFECTO]`
- ⏹️ Mínimos

**J6. Animaciones de habilidades (§96).** ¿Animaciones al usar habilidades?
- ✅ Sí `[DEFECTO]`
- ⏹️ Solo flashes simples

**J7. Ilustraciones de bosses (§97).** ¿Ilustraciones/escenas especiales para bosses?
- ✅ Sí `[DEFECTO]`
- ❌ No

**J8. Estilo novela visual (§98).** ¿Efectos tipo novela visual (fondos + diálogo) para historia?
- ✅ Sí, en escenas clave `[DEFECTO]`
- ⏹️ Solo texto

**J9. Cámara en combate (§99).** ¿Movimiento de cámara durante el combate?
- ✅ Sí, sutil `[DEFECTO]`
- ⏹️ Cámara fija

**J10. Escenas especiales bosses (§100).** ¿Cinematicas/escenas de entrada de boss?
- ✅ Sí `[DEFECTO]`
- ❌ No

---

## K. Offline / PWA / datos

**K1. % del juego sin Internet (§101, §111).**
- 🟢 100% de la campaña individual `[DEFECTO]`
- 🟡 ~90%
- 🟠 ~70%

**K2. Descarga inicial completa (§102).** ¿Descargar el juego completo inicialmente?
- ✅ Sí, todo el shell + datos `[DEFECTO]`
- 🔄 Progresivo (lo mínimo y luego regiones)

**K3. Paquetes de regiones (§103, §7).** ¿Sistema de Region Pack descargables con Wi-Fi?
- ✅ Sí `[DEFECTO]`
- ❌ No

**K4. Guardado local (§104, §117).** ¿Todo se guarda localmente en IndexedDB?
- ✅ Sí `[DEFECTO]`

**K5. Exportar backups (§105).** ¿Exportar backup de partida (archivo)?
- ✅ Sí `[DEFECTO]`
- ❌ No

**K6. Importar partidas (§106).** ¿Importar partidas desde backup?
- ✅ Sí `[DEFECTO]`
- ❌ No

**K7. Sincronización cloud (§107).** ¿Sincronización cloud opcional (futuro)?
- ✅ Sí, opcional y desactivable `[DEFECTO]`
- ❌ Solo local

**K8. Inicio sin cuenta (§108).** ¿Jugar sin crear cuenta?
- ✅ Sí, sin cuenta obligatoria `[DEFECTO]`
- 🔑 Con cuenta opcional para cloud

**K9. Service Worker (§111, §185).** ¿PWA instalable con Service Worker + manifest + Cache API + IndexedDB + Web Workers + Web Crypto?
- ✅ Confirmado `[DEFECTO]`

**K10. Actualizaciones (§186).** ¿Avisar de actualizaciones y permitir "Actualizar ahora / después" sin perder partidas?
- ✅ Sí `[DEFECTO]`

**K11. Migración de guardado (§187).** ¿Sistema de versionado y migración de saves?
- ✅ Sí `[DEFECTO]`

---

## L. Dispositivos / rendimiento

**L1. Android mínimo (§109).** ¿Versión mínima de Android objetivo?
- 📱 Android 9+ (2018) `[DEFECTO]`
- 📱 Android 11+
- 📱 Android 6+ (retrocompat)

**L2. iPhone mínimo (§110).** ¿Versión mínima de iOS?
- 🍎 iOS 14+ `[DEFECTO]`
- 🍎 iOS 16+

**L3. Gama baja (§111).** ¿Compatibilidad con teléfonos de gama baja?
- ✅ Sí, con MODO LOW `[DEFECTO]`
- ⏹️ Optimizado para media/alta

**L4. FPS objetivo (§112).** ¿Objetivo de 60 FPS?
- ✅ 60 FPS en gama media `[DEFECTO]`
- 🟡 30 FPS aceptable en gama baja `[DEFECTO]`

**L5. Modo ahorro de batería (§114).** ¿Modo ahorro de batería (reduce frecuencia, GPS, efectos)?
- ✅ Sí `[DEFECTO]`
- ❌ No

**L6. Vibración (§115).** ¿Vibración en eventos (presencia detectada, golpes)?
- ✅ Sí, desactivable `[DEFECTO]`
- ❌ No

**L7. Audio espacial (§116).** ¿Audio espacial/posicional en combate?
- 🟢 No (estéreo simple) `[DEFECTO]`
- 🟡 Panorámico básico
- 🔴 Posicional completo

**L8. Adaptive quality (§121).** ¿Sistema LOW/MEDIUM/HIGH/AUTO?
- ✅ Sí `[DEFECTO]`

**L9. Workers (§122).** ¿Mover generación procedural, seeds y loot a Web Workers para no bloquear la UI?
- ✅ Sí `[DEFECTO]`

**L10. Safe area (§108).** ¿Respetar env(safe-area-inset-*) para notch/barra del sistema?
- ✅ Sí `[DEFECTO]`

**L11. Orientación (§109).** ¿Portrait para historia/mapa/inventario y Landscape para combate/mazmorras/PvP?
- ✅ Sí, orientación adaptativa `[DEFECTO]`
- ⏹️ Solo portrait

---

## M. Monetización

**M1. Modelo (§117–124).**
- 🆓 Gratuito, sin publicidad, sin compras `[DEFECTO]`
- 🆓 Gratuito + publicidad opcional
- 🎁 Gratuito + cosméticos (sin pay-to-win)
- 💎 Freemium con contenido premium
- 🧡 Donaciones

**M2. Sin pay-to-win (§121).** Confirmas: NUNCA pay-to-win.
- ✅ Confirmado `[DEFECTO]`

**M3. Cosméticos (§120).** ¿Cosméticos (aspectos, skins, títulos decorativos)?
- ✅ Sí, solo estético
- ❌ No `[DEFECTO]`

---

## N. Alcance del primer prototipo (§189)

**N1. Contenido del primer prototipo.** El Mega Prompt (§189) define la primera versión. Confirma qué incluye:
- ✅ PWA + pantalla de carga + menú + creación de personaje
- ✅ Mapa + Modo Mundo Real + Modo Libre
- ✅ 1 Brecha + 1 mazmorra + 3 monstruos + 1 boss
- ✅ 3 habilidades + loot + nivel + guardado
- ✅ 2 jugadores locales (otro personaje visible)
- 🎯 ¿Quieres añadir algo más al prototipo? ____
- `[DEFECTO: todo lo anterior]`

**N2. Prioridad de entrega (§190–192).** ¿Orden de fases recomendado?
- 🟢 Fase 1: prototipo jugable offline (individual)
- 🟡 Fase 2: GPS smoothing + encuentros + chunks + NPC + misiones
- 🟠 Fase 3: cámara/AR + world events + facciones + clanes + PvP
- 🔴 Fase 4: historia larga + mazmorras profundas + temporadas
- `[DEFECTO: seguir el orden Fase 1→4 del prompt]`

**N3. Tecnología de renderizado.** ¿Motor visual base?
- ⚛️ Canvas 2D con sprite/overlay (ligero, recomendado para PWA + gama baja) `[DEFECTO]`
- 🌐 WebGL/Three.js 3D (más pesado, mejor AR)
- 📚 HTML/CSS + DOM (más simple, menos juego)

---

## O. Hoja de firmas / consolidación

> Rellena aquí la lista de confirmaciones finales cuando termines. Este bloque lo actualiza el equipo de desarrollo con las respuestas.

**D0. Contradicciones detectadas:** El creador eligió "Todo el prompt" como alcance, lo que es imposible de entregar en una única iteración → se entrega por fases (prototipo Fase 1 funcional, luego 2→4). Sin otras contradicciones entre las respuestas clave.
**D1. Decisiones agrupadas:**
- Nombre provisional: **Abyssal Echoes of the Deep** (A1 ✅)
- Motor visual: **Three.js / WebGL 3D** (N3)
- Estética: **Azul abisal + violeta + negro** (J1)
- Monetización: **Gratuito + donaciones**, sin pay-to-win (M1/M2)
- Extra: **Creación de personaje con las 15 clases** (N1)
- Alcance entregado en esta iteración: **Fase 1 del roadmap** (ver `docs/GDD_ABYSSAL_ECHOES.md` §10)
**D2. GDD final:** `docs/GDD_ABYSSAL_ECHOES.md` _(se generará tras las respuestas)_
**D3. Arquitectura técnica:** `docs/ARQUITECTURA_TECNICA.md` _(se generará tras las respuestas)_
**D4. Modelo de datos:** `docs/MODELO_DE_DATOS.md` _(se generará tras las respuestas)_
**D5. Flujo de pantallas:** `docs/FLUJO_DE_PANTALLAS.md` _(se generará tras las respuestas)_
**D6. Sistema de networking:** `docs/NETWORKING.md` _(se generará tras las respuestas)_
**D7. Sistema de mapa:** `docs/SISTEMA_DE_MAPA.md` _(se generará tras las respuestas)_
**D8. Sistema offline:** `docs/OFFLINE.md` _(se generará tras las respuestas)_
**D9. Roadmap:** `docs/ROADMAP.md` _(se generará tras las respuestas)_

---

*Fin del formulario. Total de preguntas: más de 50. Cuando las respondas (aquí, en el chat, o en este documento), el equipo de desarrollo procederá a generar el GDD, la arquitectura y el código del juego **Abyssal Echoes of the Deep**.*

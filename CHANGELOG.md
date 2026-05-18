# Changelog — PokéSector 35

Registro de todos los cambios significativos del proyecto, ordenados de más reciente a más antiguo.

El formato sigue las convenciones de [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/).

---

## [Beta v1.3.x] — 2026-05-17 (estado actual)

### Añadido
- **Panel admin — Gestión de sticker en slots**: las tarjetas de slots muestran el sticker asignado; el formulario de creación y edición incluye selector de sticker con lista validada de los 27 disponibles, ordenados alfabéticamente con "Sin sticker" como primera opción
- **Panel admin — Detección de spam**: nuevo endpoint `GET /api/users/spam`; filtro "Posible spam" en la vista de usuarios; botón "Eliminar spam visible"; criterios de detección: cuenta sin slots, creada recientemente, username con patrón sospechoso
- **Frontend — Mapas aleatorios**: 20 mapas predefinidos en `menu-config.js` (5 por cada dificultad); función `getRandomMap(difficultyId)` que selecciona aleatoriamente dentro de la dificultad correcta; aplicado en las tres llamadas a `applyMap` del código
- **Frontend — Mejoras React**: `App.jsx` gestiona el sticker mediante `useState` + `useEffect` (eliminada manipulación directa del DOM); `GameScreen.jsx` genera las 35 celdas dinámicamente con `Array.from().map()` con constantes `ROWS` y `COLS`; `StatsScreen.jsx` carga estadísticas del usuario desde la API al montarse
- **Frontend — Mensajes integrados**: funciones `showAlert()` y `showConfirm()` en `menu-nav.js` que muestran mensajes dentro de la consola GameBoy usando `.menu-confirm`; eliminados 8 `alert()`/`confirm()` nativos de `menu-account.js` y `menu-start.js`

### Corregido
- **Slots borrados al crear**: `createSlot` no enviaba el campo `sticker`, la validación del backend lo rechazaba y el slot quedaba eliminado — corregido enviando el sticker en la petición
- **Mapas que no se aplicaban**: `applyMap` se ejecutaba antes de que el componente `GameScreen` fuera visible en el DOM — corregido envolviendo la llamada en `requestAnimationFrame`
- **Jugador en posición incorrecta al iniciar**: mismo problema de timing que el mapa — corregido en el mismo `requestAnimationFrame`
- **`applyMap` sobreescribía la posición del jugador**: la responsabilidad de posicionar al jugador se ha separado de `applyMap`
- **Dificultad que se reiniciaba a "normal" tras Game Over**: al reiniciar, `localStorage` ya no tenía la dificultad guardada — corregido usando `gameState.difficultyId` como fallback

### Archivos modificados
`backend`: `slots.pug`, `slots.js`, `slotValidation.js`, `userController.js`, `userRoutes.js`, `users.pug`, `users.js`
`frontend`: `menu-start.js`, `menu-config.js`, `menu-nav.js`, `menu-account.js`, `App.jsx`, `GameScreen.jsx`, `StatsScreen.jsx`, `api/users.js`, `apiService.js`

---

## [Beta v1.3.3] — 2026-05-16

### Añadido
- **Soporte completo de gamepad/joystick**: nuevo `gamepad-input.js` con detección automática de gamepads, mapeo estándar (D-Pad/stick = movimiento, botones frontales = A/B), deadzone configurable (0.4), polling a 50ms, soporte multi-gamepad y vibración/rumble; `gamepad-debug.js` para debugging
- **Vibración del mando en eventos de juego**: captura exitosa (200ms, intensidad 0.8), fallo de captura (100ms, 0.4), choque con roca (150ms, 0.6), choque con borde del mapa (120ms, 0.5)
- **Opción de vibración en personalización**: menú ON/OFF accesible desde "PERSONALIZAR", persistido en localStorage, respetado por `gamepad-input.js`; orden del menú de personalización actualizado: Dificultad / Explorador / Color / Sticker / Vibración / Volver
- **Stickers personalizables**: 30 Pokémon seleccionables (articuno, bulbasaur, charizard… zapdos) mediante selector ◀▶ en personalización; se actualiza en tiempo real; guardado en `pokesector_sticker`; default `nosticker.webp`
- **Sistema de música aleatoria**: 10 pistas de banda sonora libre de derechos; cada partida selecciona una al azar; loop continuo a volumen 0.3; se pausa al llegar a meta o perder; pistas: Cartridge Route, Cobblestone Mornings, High Score Morning, Level One Arrival, Morning Sun at the Gate, Over the Hilltop, Pocket Kingdom Map, Pocket Mountain Ascent, The Mayor's Porch, The Sunny Coast
- **Pokédex del slot cargada desde BD al continuar**: `restoreFromSlot()` es ahora `async` y carga los Pokémon del slot desde `api.getPokedex()`; nueva propiedad `gameState.slotPokedex` con el acumulado BD + sesión actual
- **Indicador "Ya lo has capturado"** en la pantalla de batalla: elemento `.battle-already-caught` (pokeball + texto) visible cuando el Pokémon ya existe en `slotPokedex`
- **Rate limiting contra fuerza bruta**: `rateLimitMiddleware.js` — login: 5 intentos en 15 min, bloqueo 15 min; registro: 3 intentos en 1 hora, bloqueo 3 horas
- **Opción "CONTINUAR" oculta para invitados**: usuarios no registrados solo ven "NUEVA PARTIDA" en el submenú
- **Aviso en pantalla de victoria para invitados**: mensaje que advierte que sin cuenta los datos de la partida no se guardan
- **Intro saltable**: hint "A/SPACE: Saltar intro" visible a los 5 segundos de la animación; saltable con A o Space
- **Cerrar sesión oculto en menús de fin de partida para invitados**: el botón no se renderiza si el usuario no está logueado
- **Botón "volver" siempre visible en resultados**: el texto "◄ B/ESC: volver" está fuera de la lista scrolleable y permanece fijo en pantalla
- **Feedback visual en controles**: `flashButton()` añade clase `.pressed` por 120ms con efecto de hundimiento realista; cambio de `click` a `mousedown` + `touchstart` para respuesta instantánea; teclas A y B mapeadas a `pressA`/`pressB`; botón START bloqueado durante partida activa
- **Consola GameBoy mejorada**: `border-radius: 0.5rem 0.5rem 3.5rem 0.5rem` (esquina inferior izquierda pronunciada); sombreado multicapa realista (luz superior, sombra exterior estrecha, highlight interior, sombra de esquinas)
- **Ranking — Pokédex admin — slot obligatorio**: slot requerido al añadir Pokémon desde el panel admin; validación en frontend, backend y controller

### Corregido
- Ranking limitado al top 50 por dificultad (añadido `LIMIT 50` en `rankingService.js`)

### Archivos creados
`gamepad-input.js`, `gamepad-debug.js`, `rateLimitMiddleware.js`, `usernameValidation.js`

---

## [Beta v1.2.0] — 2026-05-14

### Añadido
- **Pokédex del menú principal**: nuevo `menu-pokedex.js` con selector de slots (si no hay slot activo), carga desde API, filtro por letra ◀▶, scroll ▲▼ y cabecera dinámica `POKÉDEX: SLOT N`; sin sesión muestra mensaje orientativo
- **Filtro por slot en Pokédex del panel admin**: `select#slotFilter` que se popula dinámicamente; filtro combinado con búsqueda por nombre/ID; el filtro se preserva al eliminar un Pokémon
- **Ordenación de la Pokédex al construirse**: `sortById()` llamado en el constructor de la clase `Pokedex` para garantizar orden correcto independientemente del orden de la BD

### Corregido
- **`slotNumber` y `slotDbId` no se restauraban al recargar**: `main.js` ahora restaura estos dos valores desde localStorage al arrancar, evitando que las partidas corran sin slot asignado
- **Nombre de explorador residual tras logout**: `startGame()` fuerza `playerName = 'Ash'` si no hay sesión activa; `onLogout()` limpia `pokesector_save` y `pokesector_global` además de `pokesector_explorer_name`
- Columna "Slot" de la Pokédex del panel admin convertida a `th` estático (no ordenable, dado que ya existe el filtro)

### Refactorización
- **`apiService.js` (383 líneas → módulos)**: fachada de 39 líneas + 8 módulos en `services/api/`: `http.js`, `auth.js`, `slots.js`, `pokedex.js`, `ranking.js`, `replays.js`, `users.js`, `save.js`
- **`game-state.js` → 3 módulos**: `game-state.js` (solo el objeto), `explorer.js` (sanitización + HUD), `game-persist.js` (saveGame, saveToBackend, eraseAllData)
- **`menu.js` (1148 líneas → módulos)**: fachada 30 líneas + `menu-nav.js`, `menu-start.js`, `menu-customize.js`, `menu-account.js`, `menu-ranking.js`
- **`game-over.js` → 3 módulos**: `end-menu.js` (estado + navegación), `results-screen.js` (pantalla de resultados + scroll), `game-over.js` (trigger + re-exports)
- **`controls.js`**: dispatcher centralizado `dispatch(action)`; lógica de teclado y botones unificada; `KEY_MAP` y `PREVENT_DEFAULT_KEYS` como constantes; `lockTimeFor(action)` centraliza debounces

Todos los archivos consumidores funcionan sin cambios gracias al patrón de fachada con re-exports.

---

## [Beta v1.1.0] — 2026-05-12

### Añadido
- **Música de fondo**: `melody.mp3` en loop al iniciar o continuar partida; se para al llegar a meta o hacer Game Over; gestión de la política de autoplay del navegador (espera al primer `keydown` si el navegador bloquea el audio)
- **Menús de fin de partida sin recarga de página**:
  - *Game Over*: al llegar a 0 HP aparece imagen del explorador y prompt parpadeante "PULSA START"; al pulsar START aparece menú navegable: JUGAR DE NUEVO / VOLVER AL MENÚ / CERRAR SESIÓN
  - *Meta (Enhorabuena)*: menú con JUGAR DE NUEVO / VER RESULTADOS / VOLVER AL MENÚ / CERRAR SESIÓN
  - *Ver resultados*: pantalla con lista de Pokémon capturados y escapados, navegable con D-Pad
- **Pokédex en el menú principal**: nueva opción visible para todos; sin sesión muestra mensaje; con sesión muestra Pokédex del slot activo con filtro por letra y scroll

### Corregido
- Reorganización de assets: contenido de `frontend/public/assets/` movido directamente a `frontend/public/`; todas las rutas actualizadas de `/assets/img/` a `/img/`, etc.
- Flag `pokesector_color_pending` para gestión correcta de la personalización de color: la BD manda sobre localStorage salvo que el usuario haya confirmado un cambio desde el menú de personalización

---

## [Beta v1.0.0] — 2026-05-11 (primera versión estable)

### Estado del proyecto en esta versión

Esta es la primera versión considerada estable, con el ciclo completo de juego funcional y la arquitectura fullstack consolidada.

### Arquitectura y estructura
- Proyecto FullStack separado en `frontend/` y `backend/`
- Docker Compose con PostgreSQL 15 + pgAdmin 4
- API REST documentada con Swagger UI en `/api-docs`
- Panel de administración con vistas Pug (SSR)
- Repositorio GitHub con ramas `main` / `dev` / `feature/*`
- `.gitignore` configurado (excluye `.env`, `node_modules`, `seed_data.sql`)
- React refactorizado: 6 componentes + 1 hook personalizado

### Autenticación y usuarios
- Registro con nombre de explorador, username y contraseña
- Login con JWT (access token 30min + refresh token 7 días)
- Refresh automático del access token
- Endpoint `DELETE /api/users/:id/me` para borrado propio con doble confirmación
- Al borrar cuenta: limpia sesión, localStorage y datos del explorador
- Sanitización `sanitizeExplorerName()`: el username nunca aparece en pantalla

### Menú principal
- Orden: INICIAR PARTIDA / PERSONALIZAR / RANKING / CUENTA
- CERRAR SESIÓN movido exclusivamente al submenú de CUENTA
- Submenú INICIAR PARTIDA: CONTINUAR (si logueado) / NUEVA PARTIDA / ATRÁS
- Nombre del explorador visible en menú solo si hay sesión activa

### Sistema de slots
- Máximo 3 slots por usuario
- Vista simplificada: SLOT N + (DIFICULTAD) en mayúsculas
- Slots vacíos muestran `(vacío)` en minúscula
- Nueva partida en slot ocupado: dos confirmaciones de advertencia
- Prompt para el nombre del explorador al iniciar nueva partida

### Pokédex
- Filtrada por slot activo (nunca mezcla datos entre slots)
- `findOrCreate` por `(user_id, pokemon_id, slot_id)` — sin duplicados en el mismo slot
- `ON DELETE CASCADE` en `captured_pokemon.slot_id`: borrar slot borra sus Pokémon
- Endpoint `GET /api/users/:id/pokedex?slot_id=X`
- Deduplicación por `pokemon_id` también en el frontend

### Personalización
- Bandeja de cambios pendientes en localStorage
- Al CONTINUAR: si hay cambios pendientes → se aplican, se guardan en BD y se limpia la bandeja
- Si no hay cambios → valores de la BD (fuente de verdad)
- Preview del color en tiempo real al navegar con las flechas
- Al cancelar: se restaura el color anterior
- Color de consola persistente entre partidas (solo se borra en `eraseAllData()`)

### Ranking
- Organizado por dificultad: FÁCIL / NORMAL / DIFÍCIL / INFERNAL
- Cambio de dificultad con flechas ◀▶
- Scroll interno con flechas ▲▼
- Muestra `explorer_name` (nunca el username)

### Panel de administración
- Detalle de usuario con botón para editar `explorer_name` (actualiza todos sus slots)
- Cards de slots con `captured_count` real y fecha `updated_at`
- Formulario de creación de slot incluye nombre del explorador
- Select de slots en Pokédex carga slots reales con IDs de BD
- Columna slot muestra Slot 1/2/3 en lugar del ID interno

### Bugs corregidos en esta versión
- Username aparecía como nombre de explorador en el HUD
- Pokémon duplicados en el mismo slot
- `slot_id: null` al guardar Pokémon al final de la partida
- Pokémon no se eliminaban al borrar un slot (faltaba `ON DELETE CASCADE`)
- Fecha "Invalid Date" en cards de slots del panel admin
- Ranking que desbordaba el screen del juego
- Personalización no se aplicaba al continuar partida
- Confirmaciones aparecían en slots vacíos
- Pantalla duplicada al llegar a la meta (race condition)
- Select de slots usaba `slot_number` como `slot_id` (IDs incorrectos)
- Pokémon de otros slots aparecían en la Pokédex del slot activo
- Color personalizado se perdía al iniciar nueva partida
- Campo `is_global` eliminado de BD, backend y frontend

---

## [Alpha v1.0] — 2026-05-06 (prototipo inicial)

### Primera iteración funcional

Esta fase corresponde al prototipo inicial del proyecto, construido para validar la arquitectura y las mecánicas básicas del juego.

### Implementado
- **Proyecto fullstack básico**: React 18 + Vite + Express 5 + PostgreSQL 15 + Docker Compose
- **6 componentes React**: `App.jsx` (orquestador), `IntroScreen.jsx`, `MenuScreen.jsx`, `GameScreen.jsx`, `BattleScreen.jsx`, `StatsScreen.jsx`
- **Hook personalizado**: `useGameState.js` para gestión del estado del juego
- **Servicio de API**: `api.js` (comunicación con PokeAPI) y `apiService.js` (comunicación con backend propio)
- **Pantallas implementadas**:
  - Intro con animación y transición automática a menú
  - Menú navegable con flechas y selección por Space/Enter
  - Mapa 5×7 con posición del jugador renderizada dinámicamente
  - Pantalla de batalla (estructura HTML y CSS lista)
  - Pantalla de estadísticas / Pokédex (estructura lista)
- **Controles**: teclado (flechas, Space, Enter, Escape) + D-Pad físico en pantalla con `onMouseDown`
- **Lógica de movimiento**: límites del mapa (0–4 filas, 0–6 columnas)
- **Sistema de encuentros**: probabilidad del 30% al moverse a celda wild
- **Sistema de captura**: probabilidad del 70%
- **Conexión a PokeAPI**: obtención de Pokémon aleatorios
- **Autenticación JWT**: registro, login, refresh token, logout; middleware de protección de rutas
- **Modelos Sequelize**: User, CapturedPokemon, GameSlot, Ranking, GameReplay, RefreshToken
- **Persistencia**: saveGame() en localStorage durante partida; saveToBackend() al llegar a meta
- **CSS retro Game Boy**: 8 archivos CSS (styles.css + uno por pantalla)
- **Assets**: 27 sprites de personajes, fuente pokemonGB.ttf, 11 archivos de audio
- **Documentación básica**: README, QUICK_START, SETUP_AUTOMATICO

### Pendiente en esta fase (resuelto en betas)
- Pantalla de Game Over (solo HTML/CSS, sin lógica)
- Pantalla de victoria (solo HTML/CSS, sin lógica)
- Sistema de dificultad (sin implementar)
- Slots múltiples (sin UI)
- Panel de administración (no existía)
- Animaciones y sonidos (solo estructura)
- Menú de personalización (no existía)

---

## Notas de versioning

```
main        ← versión estable más reciente (Beta v1.0.0)
dev         ← rama de integración
feature/*   ← ramas de desarrollo activo

Nomenclatura de ramas de feature:
  feature/beta-v1.1.0
  feature/beta-v1.2.0
  feature/beta-v1.3.0
  feature/beta-v1.3.3
```

Los PRs se integran en `dev` mediante *squash and merge*. Cuando `dev` es estable, se fusiona en `main` con un tag de versión.

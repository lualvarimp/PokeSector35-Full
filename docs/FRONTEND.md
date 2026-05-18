# Frontend - PokéSector 35

Aplicación React + Vite con lógica de juego fullscreen estilo Game Boy.

---

## Stack

- **React 18.2** - Framework UI
- **Vite 6.0** - Build tool (bundler)
- **Vanilla JavaScript** - Lógica de juego
- **CSS moderno** - Estilos responsive

---

## Estructura

```
frontend/src/
├── game/                    # Lógica del juego (JS puro)
│   ├── main.js             # Loop principal
│   ├── game-state.js       # Estado global
│   ├── game-persist.js     # localStorage
│   ├── gamepad-input.js    # Controles (teclado + gamepad)
│   ├── movement.js         # Movimiento jugador
│   ├── explorer.js         # Exploración del mapa
│   ├── battle.js           # Sistema de batalla
│   ├── pokemon.js          # Datos Pokémon
│   ├── intro.js            # Pantalla intro
│   ├── menu.js             # Menú principal
│   ├── menu-*.js           # Submenús específicos
│   ├── stats.js            # Pantallas estadísticas
│   ├── sounds.js           # Gestión audio
│   └── api.js              # Llamadas al backend
│
├── services/               # Servicios HTTP
│   ├── api/
│   │   ├── http.js         # Cliente HTTP genérico
│   │   ├── auth.js         # POST /auth/login, register, refresh
│   │   ├── users.js        # GET /users/:id
│   │   ├── pokedex.js      # GET /pokedex/:userId/:slot
│   │   ├── ranking.js      # GET /ranking
│   │   ├── slots.js        # CRUD /slots
│   │   └── replays.js      # GET/POST /slots/:id/replay
│   └── apiService.js       # Orquestador servicios
│
├── components/             # Componentes React
│   ├── GameScreen.jsx      # Canvas principal
│   ├── BattleScreen.jsx    # Batalla
│   ├── MenuScreen.jsx      # Menús
│   ├── GameOverScreen.jsx  # Game Over
│   ├── StatsScreen.jsx     # Estadísticas
│   └── GameControls.jsx    # UI controles
│
├── hooks/                  # Custom hooks
│   └── useGameInit.js      # Inicialización
│
├── css/                    # Estilos
│   ├── styles.css          # Global
│   ├── game-screen.css
│   ├── battle-screen.css
│   ├── menu-screen.css
│   ├── stats-screen.css
│   └── ... (más)
│
├── App.jsx                 # Componente raíz
└── main.jsx                # Entry point Vite
```

---

## Game State (Estado Global)

Se mantiene en `game-state.js` como objeto singleton.

```javascript
// game-state.js
export const gameState = {
  // Configuración
  mode: 'guest', // 'guest' o 'registered'
  userId: null,
  currentSlotId: null,
  
  // Explorador
  explorer: {
    x: 2, // Posición
    y: 3,
    type: 'boy', // Tipo personaje
    name: 'ASH'
  },
  
  // Partida
  difficulty: 'normal', // easy, normal, hard
  isFinished: false,
  score: 0,
  
  // Pokémon
  pokemonCaptured: [],
  pokemonEncountered: 0,
  
  // Historial
  moves: [], // ['up', 'down', 'left', 'right', ...]
  
  // Métodos
  reset() { ... },
  saveToPersist() { ... },
  loadFromPersist() { ... }
};
```

---

## Persistencia

### localStorage

```javascript
// game-persist.js
export function saveGameState() {
  const state = {
    explorer: gameState.explorer,
    pokemonCaptured: gameState.pokemonCaptured,
    moves: gameState.moves,
    score: gameState.score,
    // ... más datos
  };
  
  localStorage.setItem('pokesector_game', JSON.stringify(state));
}

export function loadGameState() {
  const saved = localStorage.getItem('pokesector_game');
  if (saved) {
    const state = JSON.parse(saved);
    Object.assign(gameState, state);
  }
}
```

### Backend Sync

Cuando usuario se registra durante la partida:

```javascript
// Crear slot en backend
const slot = await slotService.createSlot({
  user_id: userId,
  slot_number: 1,
  explorer: gameState.explorer.type,
  explorer_name: gameState.explorer.name,
  difficulty: gameState.difficulty
});

// Sincronizar pokémon capturados
for (const pokemon of gameState.pokemonCaptured) {
  await pokedexService.addPokemon(slot.id, pokemon);
}

// Guardar replay
await replayService.saveReplay(slot.id, gameState.moves);
```

---

## Bucle de Juego

### main.js

```javascript
// game/main.js
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

function gameLoop() {
  // 1. Input
  handleInput(); // gamepad-input.js
  
  // 2. Update
  updateExplorer(); // movement.js
  updateEncounters(); // explorer.js
  updateBattle(); // battle.js
  
  // 3. Render
  render(ctx);
  
  // 4. Persistencia
  saveGameState();
  
  // Loop siguiente frame
  requestAnimationFrame(gameLoop);
}

gameLoop();
```

---

## Sistema de Input

Soporta teclado y gamepad (controles estilo Game Boy).

### Teclado

```javascript
// gamepad-input.js
const keys = {};

document.addEventListener('keydown', (e) => {
  keys[e.key] = true;
  
  switch(e.key) {
    case 'ArrowUp': handleMove('up'); break;
    case 'ArrowDown': handleMove('down'); break;
    case 'ArrowLeft': handleMove('left'); break;
    case 'ArrowRight': handleMove('right'); break;
    case 'Enter': handleConfirm(); break;
    case 'Escape': handleCancel(); break;
  }
});

document.addEventListener('keyup', (e) => {
  keys[e.key] = false;
});
```

### Gamepad (Joystick)

```javascript
function pollGamepad() {
  const gamepads = navigator.getGamepads();
  
  for (let gp of gamepads) {
    if (!gp) continue;
    
    // Botones
    if (gp.buttons[0].pressed) handleConfirm(); // A
    if (gp.buttons[1].pressed) handleCancel(); // B
    
    // Sticks
    if (gp.axes[0] < -0.5) handleMove('left');
    if (gp.axes[0] > 0.5) handleMove('right');
    if (gp.axes[1] < -0.5) handleMove('up');
    if (gp.axes[1] > 0.5) handleMove('down');
  }
}

setInterval(pollGamepad, 50);
```

---

## Movimiento

```javascript
// movement.js
export function moveExplorer(direction) {
  const { explorer } = gameState;
  let newX = explorer.x;
  let newY = explorer.y;
  
  switch(direction) {
    case 'up': newY = Math.max(0, newY - 1); break;
    case 'down': newY = Math.min(6, newY + 1); break; // 7 filas (0-6)
    case 'left': newX = Math.max(0, newX - 1); break;
    case 'right': newX = Math.min(4, newX + 1); break; // 5 columnas (0-4)
  }
  
  // Validar terreno
  if (!isSolid(newX, newY)) {
    explorer.x = newX;
    explorer.y = newY;
    gameState.moves.push(direction);
    
    // Sincronizar con backend si registrado
    if (gameState.mode === 'registered') {
      replayService.addMove(gameState.currentSlotId, direction);
    }
  }
}
```

---

## Exploración (Encuentro de Pokémon)

```javascript
// explorer.js
export function checkEncounter() {
  // 10% probabilidad de encuentro
  if (Math.random() > 0.9) {
    const pokemon = getRandomPokemon();
    enterBattle(pokemon);
  }
}

export function getRandomPokemon() {
  const allPokemon = [
    { id: 1, name: 'Bulbasaur', type: 'grass' },
    { id: 25, name: 'Pikachu', type: 'electric' },
    // ... 151 Pokémon
  ];
  
  return allPokemon[Math.floor(Math.random() * 151)];
}
```

---

## Sistema de Batalla

```javascript
// battle.js
export function enterBattle(pokemon) {
  gameState.currentBattle = {
    pokemon: pokemon,
    health: 100,
    state: 'intro' // intro -> attacking -> result
  };
  
  playSound('encounter');
  renderBattleScreen();
}

export function attemptCapture() {
  const success = Math.random() > 0.6; // 40% captura
  
  if (success) {
    gameState.pokemonCaptured.push(gameState.currentBattle.pokemon);
    gameState.score += 100;
    
    if (gameState.mode === 'registered') {
      pokedexService.addPokemon(
        gameState.currentSlotId,
        gameState.currentBattle.pokemon
      );
    }
    
    playSound('captured');
  } else {
    playSound('escaped');
  }
  
  exitBattle();
}

function exitBattle() {
  gameState.currentBattle = null;
  gameState.pokemonEncountered++;
}
```

---

## Servicios HTTP

### http.js (Cliente genérico)

```javascript
// services/api/http.js
export async function request(method, url, data = null) {
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Agregar JWT si existe
  const token = localStorage.getItem('access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = { method, headers };
  if (data) config.body = JSON.stringify(data);
  
  const response = await fetch(`${import.meta.env.VITE_API_URL}${url}`, config);
  
  if (response.status === 401) {
    // Token expirado, intentar refresh
    await refreshToken();
    return request(method, url, data); // Reintentar
  }
  
  if (!response.ok) {
    const error = await response.json();
    throw error;
  }
  
  return response.json();
}

async function refreshToken() {
  const refreshToken = localStorage.getItem('refresh_token');
  const data = await request('POST', '/api/auth/refresh', { refreshToken });
  
  localStorage.setItem('access_token', data.access_token);
}
```

### auth.js

```javascript
// services/api/auth.js
export async function register(username, password) {
  return request('POST', '/api/auth/register', { username, password });
}

export async function login(username, password) {
  return request('POST', '/api/auth/login', { username, password });
}

export async function getProfile(userId) {
  return request('GET', `/api/users/${userId}`);
}
```

### slots.js

```javascript
// services/api/slots.js
export async function createSlot(slotData) {
  return request('POST', '/api/slots', slotData);
}

export async function capturePokemon(slotId, pokemon) {
  return request('POST', `/api/slots/${slotId}/capture`, pokemon);
}

export async function finishSlot(slotId, finalScore) {
  return request('POST', `/api/slots/${slotId}/finish`, { finalScore });
}
```

---

## Componentes React

### GameScreen.jsx

```jsx
import { useGameInit } from '../hooks/useGameInit';

export function GameScreen() {
  const canvasRef = useRef();
  
  useGameInit(canvasRef); // Hook que inicia el juego
  
  return (
    <div className="game-container">
      <canvas
        ref={canvasRef}
        width={320}
        height={224}
        className="game-canvas"
      />
      <GameControls />
    </div>
  );
}
```

### BattleScreen.jsx

```jsx
export function BattleScreen({ pokemon, onCapture, onFlee }) {
  const [message, setMessage] = useState('');
  
  const handleCapture = () => {
    const success = Math.random() > 0.6;
    setMessage(success ? '¡Capturado!' : 'Se escapó...');
    setTimeout(() => onCapture(success), 1500);
  };
  
  return (
    <div className="battle-screen">
      <div className="enemy-pokemon">
        <img src={`/img/${pokemon.name.toLowerCase()}.png`} />
      </div>
      <div className="message">{message}</div>
      <div className="buttons">
        <button onClick={handleCapture}>Capturar</button>
        <button onClick={onFlee}>Huir</button>
      </div>
    </div>
  );
}
```

---

## Estilos CSS

### Game Boy Aesthetic

```css
/* styles.css */
:root {
  --gb-light: #9bbc0f;
  --gb-dark: #0f380f;
  --screen-width: 320px;
  --screen-height: 224px;
}

.game-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--gb-dark) 0%, #1a1a1a 100%);
  font-family: 'Press Start 2P', monospace;
  overflow: hidden;
}

.game-canvas {
  width: 640px; /* 2x escala */
  height: 448px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  border: 4px solid var(--gb-dark);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.8);
}
```

---

## Build y Deploy

### Vite Config

```javascript
// vite.config.js
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:3000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
```

### Build Production

```bash
npm run build
# Genera /dist con assets optimizados

npm run preview
# Previsualiza producción
```

---

## Testing Manual

```bash
# Desarrollo con HMR
npm run dev

# Build production
npm run build

# Previsualiza dist
npm run preview
```

---

**Próximo**: [JUEGO.md](./JUEGO.md) para mecánicas específicas del juego

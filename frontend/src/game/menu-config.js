// =============================================================================
//  menu-config.js — Datos de configuración del menú
// =============================================================================
//  Paths adjusted for Vite: assets served from /public/
// =============================================================================

export const EXPLORERS = [
    { id: 'boy',  src: '/pokesector35/img/character-boy-front.png',  label: 'EXPLORADOR' },
    { id: 'girl', src: '/pokesector35/img/character-girl-front.png', label: 'EXPLORADORA' },
    { id: 'professor', src: '/pokesector35/img/character-professor-front.png', label: 'PROFESOR' },
    { id: 'nurse', src: '/pokesector35/img/character-nurse-front.png', label: 'ENFERMERA' },
    { id: 'brock', src: '/pokesector35/img/character-brock-front.png', label: 'BROCK' },
    { id: 'police', src: '/pokesector35/img/character-police-front.png', label: 'POLICIA' },
    { id: 'rocket-boy', src: '/pokesector35/img/character-team-rocket-boy-front.png', label: 'T-ROCKET BOY' },
    { id: 'rocket-girl', src: '/pokesector35/img/character-team-rocket-girl-front.png', label: 'T-ROCKET GIRL' },
];

export const COLORS = [
    { label: 'VERDE',            value: '#019273' },
    { label: 'BLANCO',           value: '#ecf0f1' },
    { label: 'AMARILLO',         value: '#f2b602' },
    { label: 'ROSA',             value: '#f286a6' },
    { label: 'ROJO',             value: '#821E1E' },
    { label: 'AZUL',             value: '#1851a6' },
    { label: 'GRIS',             value: '#afad9e' },
    { label: 'NEGRO',            value: '#3d3a3d' },
];

export const STICKERS = [
    { label: 'SIN STICKER', src: '/pokesector35/img/stickers/nosticker.webp'  },
    { label: 'ARTICUNO',    src: '/pokesector35/img/stickers/articuno.webp'   },
    { label: 'BULBASAUR',   src: '/pokesector35/img/stickers/bulbasaur.webp'  },
    { label: 'CHANSEY',     src: '/pokesector35/img/stickers/chansey.webp'    },
    { label: 'CHARIZARD',   src: '/pokesector35/img/stickers/charizard.webp'  },
    { label: 'CHARMANDER',  src: '/pokesector35/img/stickers/charmander.webp' },
    { label: 'CLEFAIRY',    src: '/pokesector35/img/stickers/clefairy.webp'   },
    { label: 'CUBONE',      src: '/pokesector35/img/stickers/cubone.webp'     },
    { label: 'DITTO',       src: '/pokesector35/img/stickers/ditto.webp'      },
    { label: 'DRAGONITE',   src: '/pokesector35/img/stickers/dragonite.webp'  },
    { label: 'GENGAR',      src: '/pokesector35/img/stickers/gengar.webp'     },
    { label: 'GRIMER',      src: '/pokesector35/img/stickers/grimer.webp'     },
    { label: 'GYARADOS',    src: '/pokesector35/img/stickers/gyarados.webp'   },
    { label: 'IVYSAUR',     src: '/pokesector35/img/stickers/ivysaur.webp'    },
    { label: 'JYNX',        src: '/pokesector35/img/stickers/jynx.webp'       },
    { label: 'KADABRA',     src: '/pokesector35/img/stickers/kadabra.webp'    },
    { label: 'LAPRAS',      src: '/pokesector35/img/stickers/lapras.webp'     },
    { label: 'MAGMAR',      src: '/pokesector35/img/stickers/magmar.webp'     },
    { label: 'MEOWTH',      src: '/pokesector35/img/stickers/meowth.webp'     },
    { label: 'MEW',         src: '/pokesector35/img/stickers/mew.webp'        },
    { label: 'MEWTWO',      src: '/pokesector35/img/stickers/mewtwo.webp'     },
    { label: 'NIDOQUEEN',   src: '/pokesector35/img/stickers/nidoqueen.webp'  },
    { label: 'PIDGEOTTO',   src: '/pokesector35/img/stickers/pidgeotto.webp'  },
    { label: 'PIKACHU',     src: '/pokesector35/img/stickers/pikachu.webp'    },
    { label: 'PSYDUCK',     src: '/pokesector35/img/stickers/psyduck.webp'    },
    { label: 'SNORLAX',     src: '/pokesector35/img/stickers/snorlax.webp'    },
    { label: 'SQUIRTLE',    src: '/pokesector35/img/stickers/squirtle.webp'   },
];

export const VIBRATION_OPTIONS = [
    { label: 'ON',  value: 'on' },
    { label: 'OFF', value: 'off' },
];

const MAPS = {
    facil: [
        // Mapa 1 — camino amplio central, pocas rocas
        [
            '',     '',     '',     '',     '',     'wild', '',
            '',     'wild', '',     'rock', '',     '',     '',
            'wild', '',     '',     '',     '',     'wild', '',
            '',     '',     'rock', '',     'wild', '',     '',
            '',     'wild', '',     '',     '',     '',     'goal',
        ],
        // Mapa 2 — zigzag suave, muchos espacios libres
        [
            '',     'wild', '',     '',     'rock', '',     '',
            '',     '',     '',     'wild', '',     '',     'wild',
            'rock', '',     'wild', '',     '',     '',     '',
            '',     '',     '',     '',     'wild', 'rock', '',
            'wild', '',     '',     'rock', '',     '',     'goal',
        ],
        // Mapa 3 — corredor izquierda despejado
        [
            '',     '',     'wild', '',     '',     'wild', 'rock',
            '',     'rock', '',     '',     'wild', '',     '',
            '',     '',     '',     'rock', '',     '',     'wild',
            'wild', '',     '',     '',     '',     'rock', '',
            '',     '',     'wild', '',     '',     '',     'goal',
        ],
        // Mapa 4 — pocos encuentros salvajes, fácil de atravesar
        [
            '',     '',     'rock', '',     '',     '',     'wild',
            'wild', '',     '',     '',     'rock', '',     '',
            '',     '',     'wild', '',     '',     '',     'rock',
            '',     'rock', '',     '',     '',     'wild', '',
            '',     '',     '',     'wild', '',     '',     'goal',
        ],
        // Mapa 5 — abierto, caminos amplios
        [
            '',     '',     '',     'wild', '',     '',     '',
            '',     'wild', 'rock', '',     '',     'wild', '',
            '',     '',     '',     '',     'wild', '',     'rock',
            'rock', '',     'wild', '',     '',     '',     '',
            '',     '',     '',     '',     'rock', '',     'goal',
        ],
    ],

    normal: [
        // Mapa 1 — equilibrado, pasillos con encuentros moderados
        [
            '',     'wild', '',     '',     'rock', 'wild', '',
            '',     'rock', '',     'wild', '',     '',     'wild',
            'wild', '',     'wild', '',     'rock', 'wild', '',
            '',     'wild', 'rock', '',     'wild', '',     'wild',
            'wild', '',     '',     'wild', '',     'rock', 'goal',
        ],
        // Mapa 2 — diagonal de rocas, zona central abierta
        [
            '',     '',     'rock', '',     'wild', '',     'rock',
            'wild', '',     '',     'rock', '',     'wild', '',
            '',     'rock', '',     '',     '',     'rock', 'wild',
            'wild', '',     'wild', '',     'rock', '',     '',
            '',     'wild', '',     'rock', '',     'wild', 'goal',
        ],
        // Mapa 3 — franjas alternadas de wild y roca
        [
            '',     'wild', '',     'rock', '',     'wild', '',
            'rock', '',     'wild', '',     'wild', '',     'rock',
            '',     '',     'rock', 'wild', '',     '',     'wild',
            'wild', 'rock', '',     '',     'rock', '',     '',
            '',     '',     'wild', '',     '',     'rock', 'goal',
        ],
        // Mapa 4 — esquinas con rocas, centro más libre
        [
            '',     '',     '',     'wild', '',     '',     'rock',
            '',     'wild', '',     '',     '',     'wild', '',
            '',     '',     'rock', '',     'rock', '',     '',
            '',     'wild', '',     '',     '',     'wild', '',
            'rock', '',     'wild', '',     '',     '',     'goal',
        ],
        // Mapa 5 — mixto, buen ritmo de juego
        [
            '',     'rock', '',     'wild', '',     '',     'wild',
            'wild', '',     '',     '',     'rock', 'wild', '',
            '',     '',     'wild', 'rock', '',     '',     '',
            'rock', 'wild', '',     '',     'wild', '',     'rock',
            '',     '',     'rock', 'wild', '',     '',     'goal',
        ],
    ],

    dificil: [
        // Mapa 1 — original rebalanceado: quitamos 2 rocas y 1 wild del final
        [
            '',     'wild', 'rock', 'wild', '',     'wild', 'rock',
            'wild', 'rock', 'wild', '',     'rock', '',     'wild',
            '',     'wild', '',     'rock', 'wild', '',     '',
            'rock', '',     'wild', 'wild', '',     'wild', 'rock',
            'wild', '',     '',     'wild', 'rock', 'wild', 'goal',
        ],
        // Mapa 2 — laberinto con pasillos estrechos
        [
            '',     'wild', 'rock', '',     'wild', 'rock', '',
            'rock', '',     '',     'wild', 'rock', '',     'wild',
            '',     'rock', 'wild', '',     '',     'wild', 'rock',
            'wild', '',     'rock', 'wild', '',     'rock', '',
            '',     'wild', '',     'rock', 'wild', '',     'goal',
        ],
        // Mapa 3 — alta densidad de wild, pocas rocas bloqueantes
        [
            '',     'wild', 'wild', '',     'rock', 'wild', '',
            'wild', '',     'rock', 'wild', '',     'wild', 'rock',
            '',     'wild', '',     '',     'wild', 'rock', 'wild',
            'rock', 'wild', '',     'rock', 'wild', '',     'wild',
            'wild', '',     'wild', '',     'rock', 'wild', 'goal',
        ],
        // Mapa 4 — columnas de obstáculos, pasillos verticales
        [
            '',     'rock', '',     'wild', '',     'rock', '',
            'wild', 'rock', '',     'wild', '',     'rock', 'wild',
            '',     '',     'wild', 'rock', 'wild', '',     '',
            'rock', 'wild', '',     '',     'wild', 'rock', 'wild',
            '',     'wild', 'rock', '',     'wild', '',     'goal',
        ],
        // Mapa 5 — alta densidad pero con ruta viable
        [
            '',     'wild', 'rock', 'wild', 'rock', '',     'wild',
            'rock', '',     'wild', '',     'wild', 'rock', '',
            'wild', 'rock', '',     'wild', '',     'wild', 'rock',
            '',     'wild', 'rock', '',     'rock', '',     'wild',
            'wild', '',     'wild', 'rock', '',     'wild', 'goal',
        ],
    ],

    infernal: [
        // Mapa 1 — original aligerado: sin bloqueos totales, siempre hay ruta
        [
            '',     'wild', 'rock', 'wild', '',     'wild', 'wild',
            'wild', '',     'wild', 'rock', 'wild', '',     '',
            'rock', 'wild', '',     'rock', '',     'rock', 'wild',
            'wild', 'rock', '',     '',     'wild', 'rock', 'wild',
            '',     'wild', 'wild', 'wild', '',     'wild', 'goal',
        ],
        // Mapa 2 — espiral de wild hacia la meta
        [
            '',     'wild', 'wild', 'rock', 'wild', 'wild', '',
            'wild', 'rock', '',     'wild', '',     'rock', 'wild',
            'wild', '',     'wild', 'rock', 'wild', '',     'wild',
            'rock', 'wild', 'rock', '',     'wild', 'wild', '',
            '',     'wild', '',     'wild', 'rock', 'wild', 'goal',
        ],
        // Mapa 3 — casi todo ocupado, pasillos de un paso
        [
            '',     'wild', 'rock', '',     'wild', 'rock', 'wild',
            'wild', 'rock', 'wild', 'wild', 'rock', '',     'wild',
            '',     '',     'wild', 'rock', '',     'wild', 'rock',
            'wild', 'rock', '',     'wild', 'rock', 'wild', '',
            'rock', '',     'wild', 'rock', 'wild', '',     'goal',
        ],
        // Mapa 4 — fortaleza central de rocas, rodeo obligatorio
        [
            '',     'wild', '',     'rock', '',     'wild', '',
            'wild', 'rock', 'wild', 'rock', 'wild', 'rock', 'wild',
            '',     '',     '',     '',     '',     '',     'wild',
            'wild', 'rock', 'wild', 'rock', 'wild', 'rock', '',
            '',     'wild', '',     'wild', '',     'wild', 'goal',
        ],
        // Mapa 5 — máxima presión pero siempre existe un camino
        [
            '',     'wild', 'rock', 'wild', 'rock', 'wild', '',
            'rock', 'wild', '',     'rock', '',     'wild', 'rock',
            'wild', '',     'wild', 'wild', 'wild', '',     'wild',
            '',     'rock', 'wild', '',     'rock', 'wild', 'rock',
            'wild', '',     'rock', 'wild', '',     'wild', 'goal',
        ],
    ],
};

export function getRandomMap(difficultyId) {
    const maps = MAPS[difficultyId];
    if (!maps) return MAPS.normal[0];
    return maps[Math.floor(Math.random() * maps.length)];
}

export const DIFFICULTY_CONFIG = {
    facil: {
        hp:            10,
        pokeballs:     20,
        encounterRate: 0.40,
        wildRate:      0.75,
        catchRate:     0.85,
        map:           MAPS.facil[0],
    },
    normal: {
        hp:            10,
        pokeballs:     20,
        encounterRate: 0.30,
        wildRate:      0.70,
        catchRate:     0.60,
        map:           MAPS.normal[0],
    },
    dificil: {
        hp:            10,
        pokeballs:     20,
        encounterRate: 0.50,
        wildRate:      0.85,
        catchRate:     0.35,
        map:           MAPS.dificil[0],
    },
    infernal: {
        hp:            10,
        pokeballs:     20,
        encounterRate: 0.70,
        wildRate:      0.95,
        catchRate:     0.20,
        map:           MAPS.infernal[0],
    },
};
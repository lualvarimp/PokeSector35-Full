// =============================================================================
//  menu-config.js — Datos de configuración del menú
// =============================================================================
//  Paths adjusted for Vite: assets served from /public/
// =============================================================================

export const EXPLORERS = [
    { id: 'boy',  src: '/img/character-boy-front.png',  label: 'EXPLORADOR' },
    { id: 'girl', src: '/img/character-girl-front.png', label: 'EXPLORADORA' },
    { id: 'professor', src: '/img/character-professor-front.png', label: 'PROFESOR' },
    { id: 'nurse', src: '/img/character-nurse-front.png', label: 'ENFERMERA' },
    { id: 'brock', src: '/img/character-brock-front.png', label: 'BROCK' },
    { id: 'police', src: '/img/character-police-front.png', label: 'POLICIA' },
    { id: 'rocket-boy', src: '/img/character-team-rocket-boy-front.png', label: 'T-ROCKET BOY' },
    { id: 'rocket-girl', src: '/img/character-team-rocket-girl-front.png', label: 'T-ROCKET GIRL' },
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

const MAPS = {
    facil: [
        '',     '',     'rock', '',     '',     'wild', 'rock',
        'wild', '',     '',     'wild', '',     'wild', '',
        '',     'rock', '',     '',     'rock', 'wild', '',
        'wild', '',     '',     'rock', '',     '',     'wild',
        'rock', '',     'wild', '',     'wild', 'rock', 'goal',
    ],
    normal: [
        '',     'wild', '',     '',     'rock', 'wild', '',
        '',     'rock', '',     'wild', '',     '',     'wild',
        'wild', '',     'wild', '',     'rock', 'wild', '',
        '',     'wild', 'rock', '',     'wild', '',     'wild',
        'wild', '',     '',     'wild', '',     'rock', 'goal',
    ],
    dificil: [
        '',     'wild', 'rock', 'wild', '',     'wild', 'rock',
        'wild', 'rock', 'wild', '',     'rock', '',     'wild',
        '',     'wild', '',     'rock', 'wild', '',     '',
        'rock', '',     'wild', 'wild', 'rock', 'wild', 'rock',
        'wild', 'rock', '',     'wild', 'rock', 'wild', 'goal',
    ],
    infernal: [
        '',     'wild', 'rock', 'wild', ''    , 'wild', 'wild',
        'wild', '',     'wild', 'rock', 'wild', 'rock', '',
        'rock', 'wild', 'wild', 'rock', '',     'rock', 'wild',
        'wild', 'rock', '',     'rock', 'wild', 'rock', 'wild',
        'rock', 'wild', 'wild', 'wild', 'wild', 'rock', 'goal',
    ],
};

export const DIFFICULTY_CONFIG = {
    facil: {
        hp:            10,
        pokeballs:     20,
        encounterRate: 0.40,
        wildRate:      0.75,
        catchRate:     0.85,
        map:           MAPS.facil,
    },
    normal: {
        hp:            10,
        pokeballs:     20,
        encounterRate: 0.30,
        wildRate:      0.70,
        catchRate:     0.60,
        map:           MAPS.normal,
    },
    dificil: {
        hp:            10,
        pokeballs:     20,
        encounterRate: 0.50,
        wildRate:      0.85,
        catchRate:     0.35,
        map:           MAPS.dificil,
    },
    infernal: {
        hp:            10,
        pokeballs:     20,
        encounterRate: 0.70,
        wildRate:      0.95,
        catchRate:     0.20,
        map:           MAPS.infernal,
    },
};
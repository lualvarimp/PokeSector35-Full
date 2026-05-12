import swaggerJsdoc from 'swagger-jsdoc';

/**
 * Configuración de Swagger/OpenAPI para PokéSector 35
 * Define la especificación general del API y escanea comentarios JSDoc en rutas
 */
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'PokéSector 35 API',
      version: '1.0.0',
      description: 'API Backend para gestionar un juego retro de captura de Pokémon con sistema de ranking',
      contact: {
        name: 'Luis Alonso',
        email: 'contact@pokesector.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      },
      {
        url: 'https://api.pokesector.com',
        description: 'Servidor de producción'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtenido en /api/auth/login o /api/auth/register'
        }
      },
      schemas: {
        /**
         * Esquema de Usuario
         */
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            username: {
              type: 'string',
              example: 'Ash',
              minLength: 3,
              maxLength: 15
            },
            role: {
              type: 'string',
              enum: ['user', 'admin'],
              example: 'user'
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              example: '2024-04-15T10:30:00Z'
            }
          },
          required: ['id', 'username', 'role', 'created_at']
        },

        /**
         * Esquema de GameSlot (Partida Guardada)
         */
        GameSlot: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'integer',
              example: 1
            },
            slot_number: {
              type: 'integer',
              enum: [1, 2, 3],
              example: 1
            },
            explorer: {
              type: 'string',
              example: 'boy'
            },
            explorer_name: {
              type: 'string',
              example: 'ASH'
            },
            color: {
              type: 'string',
              format: 'color',
              example: '#019273'
            },
            difficulty_id: {
              type: 'string',
              enum: ['facil', 'normal', 'dificil', 'infernal'],
              example: 'normal'
            },
            hp: {
              type: 'integer',
              minimum: 0,
              maximum: 10,
              example: 8
            },
            pokeball: {
              type: 'integer',
              example: 15
            },
            position_r: {
              type: 'integer',
              example: 5
            },
            position_c: {
              type: 'integer',
              example: 7
            },
            is_game_over: {
              type: 'boolean',
              example: false
            },
            is_goal: {
              type: 'boolean',
              example: false
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'user_id', 'slot_number', 'explorer', 'color', 'difficulty_id']
        },

        /**
         * Esquema de CapturedPokemon (Pokédex)
         */
        CapturedPokemon: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'integer',
              example: 1
            },
            pokemon_id: {
              type: 'integer',
              example: 25,
              description: 'ID del Pokémon según PokeAPI'
            },
            pokemon_name: {
              type: 'string',
              example: 'PIKACHU'
            },
            slot_id: {
              type: 'integer',
              nullable: true,
              example: 1
            },
            is_global: {
              type: 'boolean',
              example: true
            },
            captured_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'user_id', 'pokemon_id', 'pokemon_name', 'is_global', 'captured_at']
        },

        /**
         * Esquema de Ranking
         */
        Ranking: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            user_id: {
              type: 'integer',
              example: 1
            },
            username: {
              type: 'string',
              example: 'Ash'
            },
            captured_count: {
              type: 'integer',
              example: 18
            },
            escaped_count: {
              type: 'integer',
              example: 2
            },
            difficulty_id: {
              type: 'string',
              enum: ['facil', 'normal', 'dificil', 'infernal'],
              example: 'normal'
            },
            completed_at: {
              type: 'string',
              format: 'date-time'
            }
          },
          required: ['id', 'user_id', 'username', 'captured_count', 'escaped_count', 'difficulty_id', 'completed_at']
        },

        /**
         * Esquema de respuesta de autenticación
         */
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login exitoso'
            },
            access_token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            refresh_token: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            },
            user_id: {
              type: 'integer',
              example: 1
            }
          },
          required: ['message', 'access_token', 'refresh_token', 'user_id']
        },

        /**
         * Esquema de Error
         */
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Usuario o contraseña incorrectos'
            }
          },
          required: ['error']
        }
      }
    },
    security: [
      {
        BearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
};

/**
 * Genera la especificación Swagger a partir de la configuración
 * Combina la definición general con los comentarios JSDoc de las rutas
 */
const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;

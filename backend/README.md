# PokéSector 35 (Back-end) 

<img src="./public/img/poke-sector-back-logo-readme.webp" alt="PokeSector35 Banner" width="100%" />

**PokéSector 35 (Back-end)** 


> Un panel administrativo y sistema backend completo para gestionar PokéSector 35, un juego retro de captura de Pokémon basado en la probabilidad

Bienvenido a **PokéSector 35**, un proyecto backend construido con **Node.js + Express** y **PostgreSQL**. Este sistema maneja toda la lógica de un juego donde los jugadores capturan Pokémon, avanzan por el mapa y compiten en un ranking global. Se trata de un backend robusto, escalable y bien estructurado que proporciona todas las herramientas necesarias para gestionar usuarios, partidas guardadas, capturas de Pokémon y un sistema de ranking competitivo.

---

## Tabla de Contenidos

- [Características](#características)
- [Requisitos Previos](#requisitos-previos)
- [Instalación Rápida](#instalación-rápida)
- [Documentación del API](#documentación-del-api)
- [Configuración del Proyecto](#configuración-del-proyecto)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Reference](#api-reference)
- [Base de Datos](#base-de-datos)
- [Autenticación](#autenticación)
- [Troubleshooting](#troubleshooting)

---

## Características Principales

### Gestión Completa de Usuarios

El sistema implementa un completo sistema de autenticación y gestión de usuarios. Permite a los usuarios loguearse con un nombre de usuario único y una contraseña segura (hasheada con bcrypt). Una vez logueados, pueden iniciar sesión utilizando el sistema de autenticación JWT (JSON Web Tokens), que proporciona tanto un access token de corta duración (15 minutos) como un refresh token de larga duración (7 días) para mantener la sesión sin necesidad de reautentificarse constantemente. El sistema distingue entre dos tipos de rol: usuarios normales y administradores, permitiendo diferentes niveles de acceso y permisos. Adicionalmente, implementa un sistema de soft delete donde los usuarios pueden ser eliminados lógicamente (marcados como eliminados) pero recuperados en cualquier momento. Los administradores pueden cambiar contraseñas de usuarios y gestionar todos los aspectos de sus cuentas.

### Sistema de Partidas Guardadas (Game Slots)

Cada usuario puede tener hasta 3 slots de partida simultáneamente, permitiendo múltiples líneas de juego en paralelo. Cada slot almacena información completa de la partida en curso: el tipo de explorador elegido, el nombre personalizado del juego, el color de la consola del jugador, la dificultad seleccionada (Fácil, Normal, Difícil, Infernal), el HP actual, la cantidad de pokéballs disponibles, la posición en el mapa (representada como fila y columna), y los estados booleanos que indican si el juego ha terminado o si se alcanzó el objetivo.

### Sistema de Ranking Global y Competitivo

El sistema mantiene un ranking global donde se registra cada partida completada. Calcula automáticamente estadísticas de desempeño como el porcentaje de captura (pokémon capturados respecto al total de encuentros), permite filtrar por dificultad, y ordena a los jugadores tanto por cantidad de capturas como por porcentaje de éxito. Esto proporciona múltiples perspectivas del desempeño: puedes ser el jugador con más capturas totales pero tener un porcentaje bajo, o tener pocas capturas pero un ratio excelente. El ranking es público y sirve como tabla de posiciones del juego.

### Sistema de Grabación de Replays

Cada partida completada es grabada automáticamente, almacenando una secuencia JSON de todos los movimientos realizados durante el juego. Esta información incluye la posición del jugador en cada paso, el HP restante, las pokéballs usadas y el número de Pokémon capturados hasta ese punto. Este sistema es invaluable para análisis post-partida, identificación de patrones de juego, creación de mapas de calor mostrando dónde los jugadores tienen más dificultades, y mejora continua del diseño de niveles basada en datos reales.

### Pokédex Integrada

El sistema implementa un Pokédex personalizado para cada jugador, registrando todos los Pokémon capturados. Cada captura se vincula con la PokeAPI (API pública de Pokémon) para obtener datos reales y validados. Puedes marcar Pokémon como "globales" (capturados en cualquier slot) o "locales" (específicos de un slot). El sistema permite buscar, filtrar y ordenar el Pokédex, proporcionando un seguimiento completo de todas las capturas realizadas a lo largo de todas las partidas.

---

## Requisitos Previos

Antes de comenzar la instalación de PokéSector 35, asegúrate de tener instaladas las siguientes herramientas en tu ordenador. Estos son los componentes fundamentales que necesitas para que el proyecto funcione correctamente. Si ya tienes algunos instalados, simplemente verifica que cumplan con las versiones mínimas requeridas.

Node.js es el runtime de JavaScript que ejecutará todo el código del servidor. Express.js (que viene como dependencia npm) es el framework web que maneja todas las rutas y lógica del servidor. PostgreSQL es la base de datos relacional donde se almacenan todos los datos del juego. Docker es opcional pero altamente recomendado, ya que simplifica enormemente la configuración del entorno: en lugar de instalar y configurar PostgreSQL manualmente, Docker lo maneja todo en contenedores aislados.

| Requisito | Versión Mínima | Descripción |
|-----------|-----------------|-------------|
| Node.js | 16.x | Runtime de JavaScript para ejecutar el servidor |
| npm | 8.x | Gestor de paquetes para instalar dependencias |
| Docker | 20.x | (Opcional pero recomendado) Para ejecutar la BD en contenedor |
| PostgreSQL | 12.x | Base de datos relacional (puedes instalarlo localmente o en Docker) |
| Git | 2.x | Control de versiones para clonar el repositorio |

Para verificar que tienes estas herramientas instaladas correctamente, abre una terminal y ejecuta los siguientes comandos. Cada comando debería devolver un número de versión si el software está instalado.

```bash
node --version    # Debería mostrar v16.x.x o superior
npm --version     # Debería mostrar 8.x.x o superior
docker --version  # Debería mostrar Docker version 20.x.x (opcional)
git --version     # Debería mostrar git version 2.x.x
```

Si alguno de estos comandos no funciona o devuelve un error, significa que el software no está instalado. En ese caso, descargalo desde sus sitios oficiales: Node.js desde nodejs.org, Docker desde docker.com, PostgreSQL desde postgresql.org, y Git desde git-scm.com.

---

## Instalación Paso a Paso

### Opción 1: Instalación con Docker (Recomendada)

Docker es la forma más sencilla y recomendada de instalar PokéSector 35 porque te permite ejecutar tanto PostgreSQL como pgAdmin (una herramienta visual para gestionar la base de datos) sin necesidad de instalar nada más en tu ordenador. Docker se encarga de descargar las imágenes necesarias, crear los contenedores, y configurar todo automáticamente. Esta es especialmente útil si trabajas en diferentes proyectos o quieres evitar conflictos de versiones.

Primer paso es clonar el repositorio desde GitHub. Abre una terminal en la carpeta donde quieras que se descargue el proyecto e ejecuta el comando git clone. Esto descargará todo el código fuente del proyecto a una carpeta llamada pokesector-backend.

```bash
# Paso 1: Clonar el repositorio
git clone https://github.com/tu-usuario/pokesector-backend.git
cd pokesector-backend
```

Ahora necesitas crear el archivo de configuración .env. Este archivo contiene todas las variables de entorno que el proyecto necesita para funcionar, como las credenciales de la base de datos y los secretos para los tokens JWT. Hemos incluido un archivo _env.example que puedes usar como plantilla. Simplemente cópialo y renómbralo a .env.

```bash
# Paso 2: Crear archivo .env (copiar del ejemplo)
cp _env.example _env
```

Antes de lanzar Docker, asegúrate de que el daemon de Docker está ejecutándose. En Windows y macOS, simplemente abre la aplicación Docker Desktop. En Linux, suele ejecutarse como un servicio del sistema, pero puedes verificar que está corriendo con el comando docker ps.

```bash
# Paso 3: Verificar que Docker está corriendo
docker ps  # Si sale un error, abre Docker Desktop o inicia el servicio
```

Ahora lanza los contenedores de Docker. El archivo docker-compose.yml define dos servicios: uno para PostgreSQL (la base de datos) y otro para pgAdmin (la interfaz web para gestionar la base de datos). El parámetro -d significa "detached", es decir, que los contenedores se ejecutarán en segundo plano. 

```bash
# Paso 4: Lanzar contenedores (BD + pgAdmin)
docker-compose up -d
```

Una vez que Docker está ejecutando, necesitas instalar las dependencias de npm. El archivo package.json lista todas las librerías JavaScript que necesita el proyecto. npm install descargará e instalará todas ellas.

```bash
# Paso 5: Instalar dependencias
npm install
```

Finalmente, arranca el servidor en modo desarrollo. El script dev usa nodemon, una herramienta que reinicia automáticamente el servidor cada vez que haces cambios en el código, lo que acelera enormemente el desarrollo.

```bash
# Paso 6: Arrancar el servidor
npm run dev
```

Si todo funciona correctamente, deberías ver un mensaje como "Servidor PokeSector corriendo en http://localhost:3000" en tu terminal. El servidor está listo, y la base de datos está funcionando en segundo plano.

Para acceder a pgAdmin (la herramienta visual para gestionar la base de datos), abre tu navegador y ve a http://localhost:5050. Las credenciales por defecto están definidas en el archivo docker-compose.yml:

```
Email: xxx
Contraseña: xxx
```

---

## Documentación del API

### Swagger UI (Documentación Interactiva)

El API incluye documentación interactiva con **Swagger/OpenAPI 3.0**. Una vez que el servidor está ejecutándose, puedes acceder a la documentación completa en:

```
http://localhost:3000/api-docs
```

En Swagger UI puedes:
- Ver todos los endpoints organizados por categoría
- Leer la descripción detallada de cada endpoint
- Ver los parámetros requeridos y opcionales
- **Probar los endpoints directamente desde el navegador** (sin necesidad de Postman)
- Autenticarte con JWT y probar endpoints protegidos
- Ver ejemplos de respuesta y códigos de error

### Documentación de Código

El proyecto incluye comentarios **JSDoc** detallados en todos los archivos de backend:

- **[JSDOC_SUMMARY.md](./docs/JSDOC_SUMMARY.md)** - Índice y resumen de toda la documentación JSDoc

### Guías de Swagger

Para entender cómo funciona Swagger en este proyecto:

- **[QUICK_START_SWAGGER.md](./docs/QUICK_START_SWAGGER.md)** - Guía rápida (5 minutos)
- **[SWAGGER_SETUP.md](./docs/SWAGGER_SETUP.md)** - Guía detallada de instalación y uso
- **[SWAGGER_SUMMARY.md](./docs/SWAGGER_SUMMARY.md)** - Resumen técnico de la implementación

### Ejemplo: Probar un endpoint en Swagger

1. Abre http://localhost:3000/api-docs en tu navegador
2. Busca **POST /api/auth/login**
3. Haz click en él para expandir
4. Haz click en **"Try it out"**
5. Rellena los campos:
   - username: `Ash`
   - password: `testpass123`
6. Haz click en **"Execute"**
7. Verás la respuesta del servidor en tiempo real

---

### Opción 2: PostgreSQL Instalado Localmente

Si prefieres no usar Docker y tener PostgreSQL instalado directamente en tu ordenador, puedes seguir este proceso alternativo. Esta opción es útil si ya tienes PostgreSQL instalado y configurado, o si simplemente prefieres no usar contenedores.

```bash
# Paso 1: Clonar el repositorio
git clone https://github.com/tu-usuario/pokesector-backend.git
cd pokesector-backend
```

Copia el archivo de configuración de ejemplo a .env. Este archivo es idéntico al anterior, pero los valores que pongas dentro serán diferentes porque apuntarán a tu instalación local de PostgreSQL.

```bash
# Paso 2: Crear archivo .env
cp _env.example _env
```

Ahora necesitas editar el archivo .env para que apunte a tu instalación local de PostgreSQL. Abre el archivo con tu editor de código preferido. Verás que contiene variables como DB_HOST, DB_PORT, DB_NAME, DB_USER y DB_PASS. Modifica estos valores para que coincidan con tu configuración de PostgreSQL local. En la mayoría de instalaciones, el usuario por defecto es "postgres" y escucha en el puerto 5432.

```bash
# Paso 3: Editar archivo .env
nano _env  # En macOS/Linux
# o
code _env  # Si tienes VS Code instalado
```

Dentro del archivo, asegúrate de que los valores coinciden con tu configuración local de PostgreSQL. Por ejemplo:

```env
DB_HOST= xxx
DB_PORT= xxxx
DB_NAME= xxx
DB_USER= xxx
DB_PASS= xxx
```

Antes de lanzar la aplicación, necesitas crear la base de datos en PostgreSQL. PostgreSQL es como un servidor de bases de datos, y dentro puedes crear múltiples bases de datos independientes. El comando createdb crea una nueva base de datos con el nombre que especifiques.

```bash
# Paso 4: Crear la BD en PostgreSQL
createdb pokesector -U postgres
```

Es posible que te pida la contraseña del usuario postgres. Introdúcela si es necesario. Si el comando funciona sin errores, significa que la base de datos ha sido creada correctamente.

Ahora instala las dependencias de npm.

```bash
# Paso 5: Instalar dependencias
npm install
```

Una vez instaladas las dependencias, arranca el servidor en modo desarrollo usando nodemon, igual que en la opción con Docker.

```bash
# Paso 6: Arrancar en desarrollo
npm run dev
```

Si todo está configurado correctamente, deberías ver en la terminal que el servidor está corriendo en http://localhost:3000 y que la base de datos ha sido conectada exitosamente. Desde este punto, el proyecto funciona exactamente igual que con Docker; la única diferencia es que PostgreSQL está corriendo en tu máquina en lugar de en un contenedor.

---

## Configuración del Archivo .env

El archivo .env (environment variables) es donde almacenas toda la información sensible y específica de tu entorno. Este archivo NO debe subirse a GitHub por razones de seguridad, y ya está incluido en .gitignore. Crea el archivo .env en la raíz del proyecto copiando _env.example y luego personaliza los valores según tu configuración.

```env
# ========== CONFIGURACIÓN DE LA BASE DE DATOS ==========
# Estos valores le dicen a la aplicación dónde encontrar PostgreSQL
# Si usas Docker, DB_HOST debe ser "db" (nombre del servicio en docker-compose.yml)
# Si usas PostgreSQL local, DB_HOST debe ser "localhost"
DB_HOST= xxx
DB_PORT= xxx
DB_NAME= xxx
DB_USER= xxx
DB_PASS= xxx

# ========== TOKENS JWT PARA AUTENTICACIÓN ==========
# JWT_SECRET es una cadena aleatoria que se usa para firmar los access tokens
# Debe ser lo más única y segura posible. Si no tienes una idea, usa un generador online
# o ejecuta en Node: require('crypto').randomBytes(32).toString('hex')
# JWT_EXPIRES_IN es el tiempo de vida del access token. Después de esto, expira
JWT_SECRET= xxx
JWT_EXPIRES_IN=15m

# JWT_REFRESH_SECRET es igual a JWT_SECRET pero para refresh tokens
# Los refresh tokens duran más porque se usan solo para renovar el access token
JWT_REFRESH_SECRET= xxx
JWT_REFRESH_EXPIRES=7d

# ========== CONFIGURACIÓN DEL SERVIDOR ==========
# PORT es el puerto donde escuchará el servidor. 3000 es estándar para desarrollo
# NODE_ENV debe ser "development" mientras desarrollas. Cambia a "production" en producción
PORT=3000
NODE_ENV=development

# ========== CONFIGURACIÓN PGADMIN (Solo si usas Docker) ==========
# Estas credenciales son para acceder a pgAdmin en http://localhost:5050
# Usa lo que quieras, pero recuerda estos valores
PGADMIN_DEFAULT_EMAIL= xxx
PGADMIN_DEFAULT_PASSWORD= xxx
```

Algunas notas importantes sobre estas variables:

El valor de DB_HOST es crucial. Si estás usando Docker, debes poner "xxx" porque ese es el nombre del servicio PostgreSQL definido en el docker-compose.yml. Si estás usando PostgreSQL local (instalado directamente en tu ordenador), debes poner "localhost" o "127.0.0.1".

Los tokens JWT son fundamentales para la seguridad. Nunca uses los valores de ejemplo en producción. El JWT_SECRET debe ser una cadena única y compleja que solo tú conoces. Si alguien obtuviera este valor, podría forjar tokens falsos y acceder a cuentas sin permiso.

La variable NODE_ENV controla cómo se comporta la aplicación. En desarrollo, proporciona mensajes de error detallados que ayudan en la depuración. En producción, omite información sensible en los mensajes de error para evitar exposiciones de seguridad.

Si usas Docker, las credenciales de pgAdmin que configures aquí son las que usarás para acceder a la interfaz web en http://localhost:5050. Estos valores son solo para la administración visual; no afectan la funcionamiento del servidor.

---

## Estructura del Proyecto y Organización del Código

PokéSector 35 sigue una arquitectura en capas claramente separada, lo que facilita el mantenimiento, testing y escalabilidad del código. Cada carpeta tiene una responsabilidad específica, lo que hace que el proyecto sea fácil de navegar incluso para nuevos desarrolladores.

```
pokesector-backend/
│
├── src/                           # Todo el código fuente de la aplicación
│   │
│   ├── config/
│   │   └── database.js            # Configuración de Sequelize y conexión a PostgreSQL
│   │                              # Define cómo se conecta la aplicación a la BD
│   │
│   ├── models/                    # Definición de todas las tablas de la BD
│   │   ├── userModels.js          # Tabla users: almacena datos de usuarios
│   │   ├── gameSlotModels.js      # Tabla game_slots: partidas guardadas
│   │   ├── capturedPokemonModels.js  # Tabla captured_pokemon: Pokédex
│   │   ├── rankingModels.js       # Tabla ranking: registros de partidas completadas
│   │   ├── gameReplayModels.js    # Tabla game_replay: grabaciones de movimientos
│   │   ├── refreshTokenModels.js  # Tabla refresh_tokens: tokens para renovar sesión
│   │   └── index.js               # Exporta todos los modelos + define relaciones
│   │
│   ├── services/                  # Lógica de negocio (la "inteligencia" de la app)
│   │   ├── authService.js         # Funciones: registro, login, generación de tokens
│   │   ├── userService.js         # Funciones: obtener stats, datos de usuarios
│   │   ├── slotService.js         # Funciones: CRUD de slots, manejo de partidas
│   │   ├── rankingService.js      # Funciones: cálculo de ranking, estadísticas
│   │   ├── replayService.js       # Funciones: guardar/obtener grabaciones
│   │   └── index.js               # Exporta todos los servicios
│   │
│   ├── controllers/               # Manejadores de peticiones HTTP
│   │   ├── authController.js      # Endpoints: /auth/register, /auth/login
│   │   ├── userController.js      # Endpoints: GET /users, PUT /users/:id
│   │   ├── gameSlotController.js  # Endpoints: CRUD de slots
│   │   ├── rankingController.js   # Endpoints: /ranking, estadísticas
│   │   ├── replayController.js    # Endpoints: /replay, grabaciones
│   │   └── capturedPokemonController.js  # Endpoints: /pokedex
│   │
│   ├── routes/                    # Definición de rutas (URLs de la API)
│   │   ├── authRoutes.js          # POST /api/auth/register, /api/auth/login
│   │   ├── userRoutes.js          # GET/PUT/DELETE /api/users
│   │   ├── gameSlotRoutes.js      # CRUD /api/users/:id/slots
│   │   ├── capturedPokemonRoutes.js  # CRUD /api/users/:id/pokedex
│   │   ├── rankingRoutes.js       # GET /api/ranking
│   │   ├── replayRoutes.js        # CRUD /api/users/:id/replay
│   │   └── index.js               # Agrega todas las rutas al router principal
│   │
│   ├── validations/               # Validación de datos de entrada
│   │   ├── authValidation.js      # Valida que registro/login tengan datos válidos
│   │   ├── slotValidation.js      # Valida que slots cumplan reglas (ej: HP 0-10)
│   │   ├── rankingValidation.js   # Valida datos de ranking (ej: encuentros >= 10)
│   │   └── index.js               # Exporta todos los validadores
│   │
│   ├── middlewares/               # Código que se ejecuta antes de los controllers
│   │   ├── authMiddleware.js      # Verifica JWT, checkea si es admin
│   │   ├── errorHandler.js        # Captura y formatea errores de toda la app
│   │   └── index.js               # Exporta todos los middlewares
│   │
│   ├── views/                     # Plantillas Pug (renderización en servidor)
│   │   ├── login.pug              # Página de login
│   │   ├── dashboard.pug          # Panel principal
│   │   ├── users.pug              # Lista de usuarios
│   │   ├── ranking.pug            # Tabla de ranking
│   │   ├── pokedex.pug            # Pokédex del usuario
│   │   ├── slots.pug              # Gestión de slots
│   │   ├── users-detail.pug       # Detalles de un usuario específico
│   │   └── layout.pug             # Template base (nav, footer, etc)
│   │
│   └── index.js                   # Punto de entrada principal de la aplicación
│
├── public/                        # Archivos estáticos (CSS, JS cliente, imágenes)
│   ├── css/                       # Archivos CSS para las vistas
│   │   ├── layout.css             # Estilos globales (tema claro/oscuro)
│   │   ├── login.css              # Estilos específicos de login
│   │   ├── dashboard.css          # Estilos del dashboard
│   │   ├── users.css              # Estilos de la tabla de usuarios
│   │   ├── ranking.css            # Estilos del ranking
│   │   └── ... (más archivos CSS)
│   │
│   ├── js/                        # JavaScript que se ejecuta en el navegador
│   │   ├── layout.js              # Manejo del tema claro/oscuro, menú
│   │   ├── login.js               # Lógica del formulario de login
│   │   ├── users.js               # Funciones para gestionar usuarios
│   │   ├── ranking.js             # Funciones para mostrar ranking
│   │   └── ... (más archivos JS)
│   │
│   └── img/                       # Imágenes y assets
│       └── poke-sector-back-logo-readme.webp  # Logo del proyecto
│
├── docker-compose.yml             # Configuración para ejecutar PostgreSQL + pgAdmin en Docker
├── package.json                   # Definición de dependencias npm
├── package-lock.json              # Lock de versiones de dependencias (auto-generado)
├── pokesector_database.sql        # Script SQL que crea todas las tablas
├── seed_data.sql                  # Datos de prueba (usuarios, partidas, etc)
├── _env.example                   # Plantilla del archivo .env
├── .gitignore                     # Archivos que Git debe ignorar (ej: .env, node_modules)
└── README.md                      # Este archivo
```

La separación en capas funciona así: cuando llega una petición HTTP, primero pasa por las rutas (routes/), que la dirigen al controller correspondiente. El controller valida los datos usando las funciones de validations/. Si todo es válido, el controller llama al servicio correspondiente (services/), que contiene la lógica de negocio real. El servicio interactúa con la base de datos usando los modelos (models/). Finalmente, el controller devuelve la respuesta al cliente. Los middlewares pueden ejecutarse en cualquier punto para cosas como verificar autenticación. Esta estructura hace que el código sea modular, reutilizable y fácil de testear.

---

## Referencia Completa de la API

La API de PokéSector 35 está construida siguiendo estándares RESTful, lo que significa que usa los métodos HTTP estándar (GET para obtener datos, POST para crear, PUT para actualizar, DELETE para eliminar) en URLs predecibles. Todos los endpoints devuelven respuestas en formato JSON.

La mayoría de endpoints requieren autenticación, lo que significa que debes incluir un token JWT válido en el header Authorization. Algunos endpoints (como login y register) no requieren autenticación porque su propósito es precisamente permitirte obtener un token.

### Autenticación

Los endpoints de autenticación permiten que los usuarios se registren, inicien sesión y renueven sus tokens. Estos son los únicos endpoints que NO requieren un token JWT previo.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/auth/register | Crear una nueva cuenta de usuario |
| POST | /api/auth/login | Iniciar sesión y obtener tokens |
| POST | /api/auth/refresh | Renovar el access token usando el refresh token |
| POST | /api/auth/logout | Terminar la sesión |

Cuando te registras o inicias sesión, recibes dos tokens. El access token tiene una duración corta (15 minutos por defecto) y se usa para todas las peticiones autenticadas. El refresh token tiene una duración larga (7 días por defecto) y sirve exclusivamente para obtener un nuevo access token cuando el anterior expira. De esta forma, el usuario no necesita volver a introducir su contraseña cada 15 minutos.

Ejemplo de registro:

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "xxx",
    "password": "xxx"
  }'
```

La respuesta incluye tanto el access token como el refresh token, además del ID del usuario:

```json
{
  "message": "Usuario registrado",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": 1
}
```

### Gestión de Usuarios

Estos endpoints permiten ver, actualizar y gestionar cuentas de usuario. La mayoría requieren autenticación, y algunos requieren permisos de administrador.

| Método | Endpoint | Descripción | Autenticación Requerida |
|--------|----------|-------------|------------------------|
| GET | /api/users | Listar todos los usuarios (solo admin) | Sí, requiere admin |
| GET | /api/users/:id | Ver información de un usuario específico | Sí |
| GET | /api/users/:id/stats | Obtener estadísticas del usuario | Sí |
| PUT | /api/users/:id | Actualizar información del usuario | Sí |
| DELETE | /api/users/:id | Eliminar usuario (soft delete) | Sí, requiere admin |
| PUT | /api/users/:id/restore | Restaurar un usuario eliminado | Sí, requiere admin |
| PUT | /api/users/:id/change-password | Cambiar la contraseña del usuario | Sí, requiere admin |

El endpoint GET /api/users/:id/stats devuelve datos agregados sobre el desempeño del jugador:

```json
{
  "username": "Ash",
  "total_games": 6,
  "total_captured": 45,
  "total_escaped": 32,
  "unique_pokemon": 28
}
```

### Slots de Partida

Los slots son donde se guardan las partidas del jugador. Cada usuario puede tener hasta 3 slots activos simultáneamente. Estos endpoints permiten crear, actualizar y gestionar estas partidas.

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/users/:userId/slots | Obtener todos los slots del usuario | Sí |
| GET | /api/users/:userId/slots/:slotNumber | Obtener un slot específico | Sí |
| POST | /api/users/:userId/slots | Crear un nuevo slot | Sí |
| PUT | /api/users/:userId/slots/:slotNumber | Actualizar datos de un slot | Sí |
| DELETE | /api/users/:userId/slots/:slotNumber | Eliminar un slot | Sí |

Un slot contiene información detallada de la partida en curso: qué tipo de explorador está jugando, su nombre personalizado, el color de su consola, la dificultad elegida, su HP actual, pokéballs disponibles, posición en el mapa, y estados de juego (game over, objetivo alcanzado).

### Ranking y Competición

El sistema de ranking permite seguimiento de partidas completadas y competición entre jugadores. Los jugadores pueden ver el ranking global, filtrado por dificultad, y ordenado de diferentes formas.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | /api/ranking | Obtener ranking global (parámetro opcional: ?difficulty=normal) |
| GET | /api/ranking/by-percentage | Ranking ordenado por porcentaje de captura |
| GET | /api/ranking/:userId | Ver historial de rankings del usuario |
| POST | /api/ranking/:userId | Registrar una nueva partida completada |
| DELETE | /api/ranking/:rankingId | Eliminar una entrada de ranking (admin) |

Cuando una partida se completa, se registra en el ranking. El sistema calcula automáticamente el porcentaje de captura (pokémon capturados dividido por total de encuentros). Una entrada en el ranking requiere un mínimo de 10 encuentros para ser válida.

Un ejemplo de respuesta del ranking:

```json
{
  "id": 1,
  "user_id": 1,
  "username": "Ash",
  "captured_count": 18,
  "escaped_count": 2,
  "difficulty_id": "normal",
  "completed_at": "2024-04-15T10:30:00Z"
}
```

### Pokédex y Pokémon Capturados

Estos endpoints permiten gestionar la Pokédex de cada usuario, registrando qué Pokémon han sido capturados.

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| GET | /api/users/:id/pokedex | Obtener todos los Pokémon capturados | Sí |
| POST | /api/users/:id/pokedex | Agregar un nuevo Pokémon capturado | Sí |
| DELETE | /api/users/:id/pokedex/:pokemonId | Eliminar un Pokémon del Pokédex | Sí |
| GET | /api/users/:userId/captures/:slotId | Obtener capturas específicas de un slot | Sí |

Cuando capturas un Pokémon, puedes marcarlo como "global" (capturado en cualquier slot) o "local" (específico del slot actual). El sistema se integra con la PokeAPI para validar que el Pokémon existe y obtener datos reales sobre él.

### Sistemas de Replay

Los replays son grabaciones de todos los movimientos realizados durante una partida. Esto permite análisis posterior y mejoras de diseño.

| Método | Endpoint | Descripción | Autenticación |
|--------|----------|-------------|---------------|
| POST | /api/users/:userId/slots/:slotId/replay | Guardar un nuevo replay | Sí |
| GET | /api/users/:userId/replays | Obtener todos los replays del usuario | Sí |
| GET | /api/users/:userId/slots/:slotId/replay | Obtener el replay específico de un slot | Sí |
| DELETE | /api/replayId | Eliminar un replay (admin) | Sí, admin |

Un replay se almacena como un array JSON con información de cada movimiento: posición del jugador, HP restante, pokéballs gastadas, Pokémon capturados, etc. Esto es especialmente útil para crear mapas de calor mostrando dónde los jugadores tienen dificultades o tienden a explorar.

---

## Base de Datos y Esquema

PostgreSQL es la base de datos relacional que almacena todos los datos de PokéSector 35. Las relaciones entre tablas están cuidadosamente diseñadas para mantener la integridad de los datos. Por ejemplo, si un usuario es eliminado, todos sus slots, Pokémon capturados y rankings se eliminan automáticamente gracias a las restricciones de clave foránea (CASCADE).

### Diagrama de Relaciones entre Tablas

La aplicación utiliza 6 tablas principales que se relacionan entre sí de la siguiente manera:

```
users (Tabla Principal)
  ├── id (Clave primaria)
  ├── username (Único, identifica al usuario)
  ├── password_hash (Contraseña encriptada con bcrypt)
  ├── role (admin o user)
  ├── deleted_at (Para soft delete, NULL si activo)
  └── created_at (Fecha de registro)
  
game_slots (Depende de users)
  ├── id (Clave primaria)
  ├── user_id (Clave foránea → users)
  ├── slot_number (1, 2 o 3 - máximo 3 por usuario)
  ├── explorer (Tipo: boy, girl, professor, etc)
  ├── explorer_name (Nombre personalizado del juego)
  ├── color (Color de la consola, formato hex)
  ├── difficulty_id (facil, normal, dificil, infernal)
  ├── hp (0-10, energía del jugador)
  ├── pokeball (Cantidad disponible)
  ├── position_r y position_c (Fila y columna del mapa)
  ├── is_game_over (¿Ha perdido?)
  ├── is_goal (¿Alcanzó el objetivo?)
  └── updated_at (Última actualización)

captured_pokemon (Depende de users y game_slots)
  ├── id (Clave primaria)
  ├── user_id (Clave foránea → users)
  ├── slot_id (Clave foránea → game_slots, puede ser NULL)
  ├── pokemon_id (ID del Pokémon)
  ├── pokemon_name (Nombre del Pokémon)
  ├── is_global (¿Captura global o local del slot?)
  └── captured_at (Fecha de captura)

ranking (Depende de users)
  ├── id (Clave primaria)
  ├── user_id (Clave foránea → users)
  ├── captured_count (Pokémon capturados en esta partida)
  ├── escaped_count (Pokémon que escaparon)
  ├── difficulty_id (En qué dificultad)
  └── completed_at (Cuándo se completó)

refresh_tokens (Depende de users)
  ├── id (Clave primaria)
  ├── user_id (Clave foránea → users)
  ├── token (El token JWT real, debe ser único)
  ├── expires_at (Cuándo expira)
  └── created_at (Cuándo se creó)

game_replay (Depende de users y game_slots)
  ├── id (Clave primaria)
  ├── slot_id (Clave foránea → game_slots)
  ├── user_id (Clave foránea → users)
  ├── movements (Array JSON con todos los movimientos)
  └── completed_at (Cuándo se grabó)
```

### Datos de Prueba Incluidos

Para facilitar el desarrollo y testing, el proyecto incluye automáticamente datos de prueba al iniciarse con Docker. Estos datos permiten que los desarrolladores prueben la aplicación sin tener que crear usuarios y partidas desde cero.

| Usuario | Contraseña | Rol | Partidas Guardadas |
|---------|-----------|-----|-------------------|
| Ash | testpass123 | user | 6 partidas |
| Misty | testpass123 | user | 4 partidas |
| Brock | testpass123 | user | 3 partidas |
| Jessie | testpass123 | user | 3 partidas |
| Admin | testpass123 | admin | 2 partidas |

Puedes iniciar sesión con cualquiera de estas cuentas para explorar el sistema. Cada usuario tiene diferentes números de partidas guardadas, capturas de Pokémon y entrada en el ranking, lo que permite probar todos los aspectos de la aplicación.

### Cálculo de Restricciones y Validaciones

La base de datos implementa varias restricciones a nivel SQL para asegurar la integridad de los datos. Por ejemplo, el slot_number debe ser siempre 1, 2 o 3 (no permite otros valores). El HP está limitado a 0-10 (representando los puntos de vida del jugador). El rol del usuario debe ser "user" o "admin" (no permite otras opciones). Estas restricciones se definen en el archivo pokesector_database.sql y son ejecutadas directamente por PostgreSQL, proporcionando una capa adicional de validación más allá del código de la aplicación.

### Vista de Ranking (ranking_view)

La aplicación utiliza una vista SQL (una tabla virtual basada en una consulta) para optimizar las queries del ranking. Esta vista automáticamente filtra usuarios eliminados, requiere un mínimo de 10 encuentros por partida (para evitar rankings basados en datos insignificantes), y ordena por cantidad de capturas. Las vistas SQL son útiles porque pueden precalcular y optimizar consultas complejas, haciendo que las consultas al ranking sean más rápidas.

---

## Sistema de Autenticación JWT

PokéSector 35 utiliza JSON Web Tokens (JWT) para mantener sesiones seguras y sin estado. A diferencia de las sesiones tradicionales que almacenan información en el servidor, los JWTs son tokens autónomos que contienen información del usuario cifrada. Esto hace que el sistema sea más escalable y eficiente, especialmente útil si en el futuro necesitas desplegar la aplicación en múltiples servidores.

### Cómo Funciona el Sistema JWT

Cuando un usuario se registra o inicia sesión, el servidor crea dos tokens:

El access token es un token de corta duración (por defecto 15 minutos) que se usa para autenticar todas las peticiones API. Cada vez que haces una petición a un endpoint protegido, debes incluir este token en el header Authorization. El servidor verifica que el token es válido y no ha expirado antes de procesar la petición.

El refresh token es un token de larga duración (por defecto 7 días) que sirve exclusivamente para obtener un nuevo access token cuando el anterior expira. De esta forma, el usuario no necesita volver a introducir su contraseña cada vez que el access token expira. El refresh token se almacena en la base de datos para que el servidor pueda verificar su validez.

Este sistema de dos tokens es un balance entre seguridad y usabilidad. Si el access token fuera válido durante 7 días, un atacante que robara el token tendría acceso durante más tiempo. Con un token de corta duración, el acceso es limitado. Pero si el usuario tuviera que volver a autenticarse cada 15 minutos, la experiencia sería terrible. Los refresh tokens resuelven este problema.

### Uso en Peticiones

Para hacer una petición autenticada, debes incluir el access token en el header Authorization con el formato "Bearer TOKEN":

```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

Si el token no está presente, ha expirado, o es inválido, el servidor devolverá un error 401 (Unauthorized).

### Renovación de Tokens

Cuando el access token expira (después de 15 minutos), ya no puedes hacer peticiones autenticadas incluso si tienes un refresh token válido. Para obtener un nuevo access token sin tener que volver a introducir la contraseña, usa el endpoint de refresh:

```bash
curl -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

El servidor verifica que el refresh token es válido (existe en la base de datos, no ha expirado, pertenece a un usuario activo) y en caso afirmativo, devuelve un nuevo access token. Puedes repetir este proceso hasta que el refresh token expire (7 días después del login original).

### Estructura del Token JWT

Un JWT está compuesto por tres partes separadas por puntos: header.payload.signature

El header especifica que es un JWT y qué algoritmo se usó para firmarlo (en nuestro caso, HS256, que es HMAC con SHA-256).

El payload (carga) es donde se almacena la información del usuario. En PokéSector 35, incluye el ID del usuario, su nombre de usuario, su rol (admin o user), y metadatos como cuándo se creó el token y cuándo expira. El payload está codificado en Base64 pero NO está encriptado (puedes decodificarlo manualmente si lo deseas). Por eso es importante que nunca incluyas información sensible como contraseñas en el payload.

La firma es un hash criptográfico del header y el payload, firmado con el JWT_SECRET. Esto asegura que el token no ha sido modificado. Si alguien intenta cambiar el payload (por ejemplo, para cambiar su rol de user a admin), la firma ya no coincidirá y el servidor lo rechazará.

### Seguridad

El JWT_SECRET es la clave más importante del sistema. Es una cadena aleatoria conocida solo por el servidor. Si alguien obtiene el JWT_SECRET, podría forjar tokens falsos y acceder a cualquier cuenta. Por eso es crítico que:

El JWT_SECRET sea único y complejo (no uses el del ejemplo del _env.example en producción).

El JWT_SECRET nunca se suba a un repositorio público (está en .gitignore por esta razón).

El JWT_SECRET se almacene de forma segura en tus variables de entorno.

El acceso al archivo .env esté protegido (con permisos de archivo restrictivos).

En producción, usa sistemas como HashiCorp Vault, AWS Secrets Manager o similares para almacenar secretos de forma segura en lugar de en archivos .env locales.

---

## Solución de Problemas Comunes

### Error: "connect ECONNREFUSED 127.0.0.1:5432"

Este error significa que la aplicación intenta conectarse a PostgreSQL pero no encuentra nada escuchando en ese puerto. La base de datos no está corriendo.

Si estás usando Docker, verifica que el contenedor de PostgreSQL está activo:

```bash
docker ps  # Muestra contenedores en ejecución
```

Si el contenedor está parado, reinícialo:

```bash
docker-compose down
docker-compose up -d
```

Si estás usando PostgreSQL local (instalado en tu PC), necesitas arrancar el servicio. En macOS con Homebrew:

```bash
brew services start postgresql
```

En Linux (Ubuntu/Debian):

```bash
sudo systemctl start postgresql
```

En Windows, PostgreSQL debería estar ejecutándose como un servicio. Abre Services.msc y busca "postgresql".

Después de arrancar PostgreSQL, vuelve a iniciar el servidor Node:

```bash
npm run dev
```

### Error: "relation 'users' does not exist"

Este error significa que las tablas de la base de datos no existen. La base de datos está conectada, pero el esquema SQL no ha sido ejecutado.

Si estás usando Docker, la solución más simple es eliminar el contenedor y sus volúmenes (esto borra todos los datos) y recrear todo desde cero. Docker ejecutará automáticamente los scripts SQL incluidos:

```bash
docker-compose down -v  # -v elimina los volúmenes (datos de BD)
docker-compose up -d    # Recrea todo desde cero
```

Si estás usando PostgreSQL local, necesitas ejecutar manualmente el script SQL que define todas las tablas:

```bash
psql -U postgres -d pokesector -f pokesector_database.sql
```

Opcionalmente, también puedes cargar los datos de prueba:

```bash
psql -U postgres -d pokesector -f seed_data.sql
```

Si PostgreSQL te pide contraseña y no recuerdas cuál es, consulta la documentación de tu instalación de PostgreSQL.

### Error: ".env file not found"

Este error significa que el archivo .env no existe en la raíz del proyecto.

Crea el archivo copiando la plantilla de ejemplo:

```bash
cp _env.example _env
```

Luego abre el archivo con tu editor favorito y edita los valores para que coincidan con tu entorno (especialmente DB_HOST, DB_PORT, DB_USER y DB_PASS):

```bash
nano _env          # Linux/macOS
# o
code _env          # VS Code
# o
notepad _env       # Windows
```

Asegúrate de que los valores tengan sentido. Por ejemplo, si estás usando Docker, DB_HOST debe ser "db" (el nombre del servicio). Si usas PostgreSQL local, DB_HOST debe ser "localhost".

### Error: "npm install falla" o versiones de dependencias conflictivas

Este error puede ocurrir si tu versión de Node.js es demasiado antigua o si hay conflictos en las versiones de paquetes.

Primero, verifica tu versión de Node.js:

```bash
node --version  # Debe ser v16.x o superior
```

Si es más antigua, actualiza Node.js. La forma más fácil es usando nvm (Node Version Manager):

```bash
# Instalar nvm (si no lo tienes)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Instalar Node 18 (más reciente y estable)
nvm install 18

# Usar Node 18 en este terminal
nvm use 18
```

Si prefieres no usar nvm, descarga e instala la última versión de Node.js desde nodejs.org.

Una vez tengas una versión válida de Node, limpia el caché de npm e intenta nuevamente:

```bash
npm cache clean --force
rm -rf node_modules
rm package-lock.json
npm install
```

### Error: "Puerto 3000 ya está en uso"

Este error significa que otra aplicación (o instancia previa de PokéSector) está usando el puerto 3000.

La forma más fácil de solucionarlo es cambiar el puerto en tu archivo .env:

```env
PORT=3001
```

Luego reinicia el servidor:

```bash
npm run dev
```

Alternativamente, puedes encontrar y detener el proceso que está usando el puerto. En macOS/Linux:

```bash
lsof -i :3000       # Muestra el proceso usando puerto 3000
kill -9 <PID>       # Reemplaza <PID> con el número mostrado
```

En Windows, abre el Administrador de Tareas, busca el proceso, y termínalo.

### Error: "Can't find module 'express'" u otros módulos

Este error significa que las dependencias no se instalaron correctamente.

Primero, verifica que el archivo package.json existe en la raíz del proyecto. Si no está ahí, probablemente clonaste el repositorio incorrectamente.

Si package.json existe, intenta reinstalar las dependencias:

```bash
rm -rf node_modules
npm install
```

Si el problema persiste, intenta usar npm ci (ci = "clean install") que es más estricto con las versiones:

```bash
npm ci
```

Si aun así falla, verifica que tienes acceso a internet y que npm puede descargar paquetes. Intenta actualizar npm:

```bash
npm install -g npm@latest
```

### Acceso a pgAdmin no funciona (con Docker)

Si estás usando Docker pero pgAdmin no abre en http://localhost:5050, verifica que el contenedor de pgAdmin está corriendo:

```bash
docker ps | grep pgadmin
```

Si no aparece, reinicia los contenedores:

```bash
docker-compose restart
```

Verifica también que el puerto 5050 no está siendo usado por otra aplicación. Si es necesario, puedes cambiar el puerto en docker-compose.yml:

```yaml
services:
  pgadmin:
    ports:
      - "5051:80"  # Cambia 5050 por otro puerto
```

Luego accede a http://localhost:5051 (o el puerto que hayas elegido).

### Error: "password authentication failed for user postgres"

Este error ocurre cuando intentas conectarte a PostgreSQL pero la contraseña es incorrecta.

Verifica que el valor de DB_PASS en .env coincide exactamente con la contraseña que estableciste cuando instalaste PostgreSQL. Las contraseñas distinguen entre mayúsculas y minúsculas.

Si estás usando Docker, la contraseña está definida en dos lugares:
- En .env como DB_PASS
- En docker-compose.yml como POSTGRES_PASSWORD

Asegúrate de que coinciden:

```env
# .env
DB_PASS=pokemon123
```

```yaml
# docker-compose.yml
POSTGRES_PASSWORD: ${DB_PASS}  # Esto toma el valor del .env
```

Si los valores coinciden pero aun así no funciona, prueba reiniciando los contenedores:

```bash
docker-compose down
docker-compose up -d
```

---

## Scripts NPM Disponibles

Durante el desarrollo, tendrás acceso a varios scripts npm que automatizan tareas comunes. Los scripts se ejecutan con el comando npm run seguido del nombre del script.

```bash
npm start          # Ejecuta el servidor en modo producción (sin auto-reload)
npm run dev        # Ejecuta el servidor en modo desarrollo con nodemon (auto-reload)
npm test           # Ejecuta suite de tests (no implementado aún en esta versión)
```

El script npm run dev es el que usarás durante el desarrollo porque nodemon reinicia automáticamente el servidor cada vez que detecta cambios en los archivos, ahorrándote tiempo y evitando reinicios manuales.

---

## Desarrollo y Extensión del Proyecto

Si quieres añadir nuevas funcionalidades al proyecto, la estructura está diseñada para que sea sencillo. Aquí está el flujo típico para agregar una nueva ruta:

Primero, crea un nuevo archivo en src/controllers/ con la lógica que manejar la petición. Por ejemplo, si quieres crear un endpoint para obtener estadísticas globales del juego.

Segundo, crea o actualiza el archivo de ruta correspondiente en src/routes/. Importa el controller y define la ruta con el método HTTP apropiado (GET, POST, PUT, DELETE).

Tercero, importa la nueva ruta en src/routes/index.js y agrégala al router principal con app.use().

Cuarto, si necesitas validar datos de entrada, crea funciones de validación en src/validations/ y úsalas como middlewares en la ruta.

Si necesitas modificar la estructura de la base de datos (agregar nuevas tablas, columnas, cambiar tipos de datos), edita el archivo pokesector_database.sql y luego recrea la base de datos:

```bash
docker-compose down -v  # Elimina volúmenes
docker-compose up -d    # Recrea todo con el nuevo schema
```

Para agregar nuevas dependencias npm (librerías externas), usa:

```bash
npm install nombre-de-paquete
```

Esto descargará la librería y la agregará a package.json. Si trabajas con otros desarrolladores, asegúrate de hacer commit del archivo package-lock.json para que todos usen las mismas versiones.

---

## Licencia del Proyecto

Este proyecto está publicado bajo la licencia ISC (Internet Software Consortium). La licencia ISC es una licencia permisiva simple que te permite usar, modificar y distribuir el código libremente, siempre que incluyas el aviso de copyright y la licencia.

Esto significa que puedes clonar el repositorio, hacer cambios, usarlo en tus propios proyectos, e incluso comercializar código basado en PokéSector 35, siempre que respetes los términos de la licencia ISC. Para más detalles, consulta el archivo LICENSE en el repositorio.

---

## Autor y Contacto

PokéSector 35 fue desarrollado por Luis Alonso, un desarrollador backend apasionado por la arquitectura de software limpia y escalable.

Si tienes preguntas sobre el proyecto, encuentras bugs, o tienes sugerencias de mejora, no dudes en contactar:

GitHub: [@tu-usuario](https://github.com/tu-usuario)
Email: tu-email@example.com

---

## Contribuciones al Proyecto

Las contribuciones son bienvenidas. Si encontraste un bug, quieres mejorar la documentación, o tienes una idea de feature que crees que mejoraría el proyecto, sigue estos pasos:

Haz un fork (copia) del repositorio a tu propia cuenta de GitHub.

Crea una rama (branch) para tu feature: git checkout -b feature/nombre-de-tu-feature

Haz tus cambios y commit: git commit -m 'Descripción clara de qué cambió'

Push a tu rama: git push origin feature/nombre-de-tu-feature

Abre un Pull Request en el repositorio original describiendo tus cambios

Los mantenedores revisarán tu código y, si todo está bien, lo integrarán en el proyecto principal. Esto permite que múltiples desarrolladores contribuyan sin tener acceso directo al repositorio.

---

## Agradecimientos y Dependencias

PokéSector 35 se beneficia de excelentes proyectos open source. Quiero agradecer especialmente a:

PokeAPI por proporcionar datos públicos y accesibles de Pokémon. Sin esta API, la integración del Pokédex sería mucho más complicada.
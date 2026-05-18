# Setup e Instalación - PokéSector 35

## Requisitos Previos

- **Node.js** 18+ ([descargar](https://nodejs.org/))
- **PostgreSQL** 15+ ([descargar](https://www.postgresql.org/))
- **Git** ([descargar](https://git-scm.com/))
- **npm** 9+ (incluido con Node.js)

### Alternativa: Docker

Si prefieres usar contenedores:
- **Docker** ([descargar](https://www.docker.com/))
- **Docker Compose** (incluido en Docker Desktop)

---

## Instalación Local (sin Docker)

### 1. Preparar la Base de Datos

```bash
# Crear usuario PostgreSQL (si no existe)
createuser pokesector_user -P  # Se te pedirá contraseña

# Crear base de datos
createdb pokesector_db -O pokesector_user
```

Guarda las credenciales. Las necesitarás en la configuración de variables de entorno.

### 2. Clonar y Acceder al Proyecto

```bash
cd pokesector
```

### 3. Configurar Backend

**ATENCIÓN**: Los valores y claves que se dan a continuación son para poder levantar el proyecto en local, probar el juego, su base de datos y testear todo el conjunto sin problemas. **En ningún caso estos valores representarán los valores reales del juego una vez esté finalizado.**

```bash
cd backend

# Copiar variables de entorno
cp .env.example .env

# Editar .env con tus credenciales
# DB_HOST=db
# DB_PORT=5432
# DB_NAME=pokesector
# DB_USER=pokesector_user
# DB_PASSWORD=pokesector_pass
# JWT_SECRET=tu_secreto_muy_largo_aqui_cambio_en_produccion
# REFRESH_SECRET=otro_secreto_diferente_cambio_en_produccion
```

### 4. Instalar Dependencias del Backend

```bash
npm install
```

### 5. Poblar la Base de Datos

```bash
# Ejecutar SQL de creación de tablas
psql -U pokesector_user -d pokesector_db -f pokesector_database.sql

# Ejecutar SQL de datos de ejemplo
psql -U pokesector_user -d pokesector_db -f seed_data.sql
```

### 6. Configurar Frontend

```bash
cd ../frontend

# Copiar variables de entorno
cp .env.example .env

# Editar si es necesario (normalmente no hace falta)
# VITE_API_URL=http://localhost:3000
```

### 7. Instalar Dependencias del Frontend

```bash
npm install
```

---

## Instalación con Docker

### 1. Configurar Variables de Entorno

**ATENCIÓN**: Los valores y claves que se dan a continuación son para poder levantar el proyecto en local, probar el juego, su base de datos y testear todo el conjunto sin problemas. **En ningún caso estos valores representarán los valores reales del juego una vez esté finalizado.**

```bash
# En la raíz del proyecto, crear .env
cat > .env << EOF
DB_HOST=db
DB_PORT=5432
DB_NAME=pokesector
DB_USER=pokesector_user
DB_PASSWORD=pokesector_pass
JWT_SECRET=tu_secreto_muy_largo_aqui_cambio_en_produccion
REFRESH_SECRET=otro_secreto_diferente_cambio_en_produccion
NODE_ENV=development
PORT=3000
EOF
```
### 2. Levantar Contenedores

```bash
cd backend

docker-compose up --build
```

Este comando:
- Crea contenedor PostgreSQL
- Instala dependencias del backend
- Crea las tablas
- Inicia el servidor en puerto 3000

---

## Iniciar el Servidor (Desarrollo)

### Backend

```bash
cd backend
npm run dev
```

Debería ver:
```
✅ Base de datos conectada en puerto 5432
✅ Modelos sincronizados
🚀 Servidor PokeSector corriendo en http://localhost:3000
📚 Swagger UI disponible en http://localhost:3000/api-docs
🎮 Panel Admin disponible en http://localhost:3000/login
```

### Frontend

En otra terminal:

```bash
cd frontend
npm run dev
```

Debería ver:
```
  VITE v6.0.0  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

---

## Acceso a Aplicaciones

| Servicio | URL | Usuario | Contraseña |
|----------|-----|---------|-----------|
| Juego Frontend | http://localhost:5173 | N/A | N/A |
| API Docs Swagger | http://localhost:3000/api-docs | N/A | N/A |
| Panel Admin | http://localhost:3000/login | admin | admin123 |

---

## Verificar Instalación

### Backend

```bash
# Debería devolver la especificación Swagger en JSON
curl http://localhost:3000/api-docs/swagger.json
```

### Frontend

Abre http://localhost:5173 en tu navegador. Debería cargar el juego.

---

## Variables de Entorno

### Backend (`.env`)

**ATENCIÓN**: Los valores y claves que se dan a continuación son para poder levantar el proyecto en local, probar el juego, su base de datos y testear todo el conjunto sin problemas. **En ningún caso estos valores representarán los valores reales del juego una vez esté finalizado.**

```env
# Base de Datos
DB_HOST=db
DB_PORT=5432
DB_NAME=pokesector
DB_USER=pokesector_user
DB_PASSWORD=pokesector_pass

# JWT
JWT_SECRET=tu_secreto_muy_largo_aqui_cambio_en_produccion
REFRESH_SECRET=otro_secreto_diferente_cambio_en_produccion
JWT_EXPIRY=1h
REFRESH_EXPIRY=7d

# Servidor
PORT=3000
NODE_ENV=development

# Rate Limiting
RATE_LIMIT_WINDOW_MS=15000
RATE_LIMIT_MAX_REQUESTS=100
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3000
```

---

## Solución de Problemas

### ❌ Error: "connect ECONNREFUSED 127.0.0.1:5432"

**Causa**: PostgreSQL no está corriendo.

**Solución**:
```bash
# macOS (Homebrew)
brew services start postgresql

# Ubuntu/Debian
sudo systemctl start postgresql

# Windows: Busca PostgreSQL en Servicios y inicia el servicio
```

### ❌ Error: "EADDRINUSE: address already in use :::3000"

**Causa**: El puerto 3000 ya está en uso.

**Solución**:
```bash
# Cambiar puerto en backend/.env
PORT=3001

# O matar el proceso usando el puerto
lsof -ti:3000 | xargs kill -9
```

### ❌ Error: "psql: password authentication failed"

**Causa**: Contraseña incorrecta.

**Solución**: Verificar credenciales en `.env` y reintentar con `psql -U pokesector_user`.

### ❌ Error: "Command 'npm' not found"

**Causa**: Node.js no está instalado.

**Solución**: Descargar e instalar Node.js desde https://nodejs.org/

---

## Próximos Pasos

1. Lee [ARQUITECTURA.md](./ARQUITECTURA.md) para entender el flujo de datos
2. Explora [API.md](./API.md) para conocer los endpoints disponibles
3. Revisa [BACKEND.md](./BACKEND.md) para detalles de implementación

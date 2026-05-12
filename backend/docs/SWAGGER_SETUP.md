# Configuración de Swagger/OpenAPI en PokéSector 35

Este documento explica cómo integrar la documentación Swagger (OpenAPI) en tu proyecto.

## ¿Qué es Swagger?

Swagger (ahora OpenAPI) es un estándar para documentar APIs REST. Te permite:

✓ Ver todos los endpoints en una interfaz gráfica bonita
✓ Hacer click en cada endpoint y ver su documentación
✓ **Probar los endpoints directamente desde el navegador** (sin necesidad de Postman)
✓ Ver ejemplos de respuestas
✓ Autenticarse con JWT para probar endpoints protegidos

## Instalación

### 1. Instalar dependencias necesarias

```bash
npm install swagger-jsdoc swagger-ui-express
```

Estas dos librerías hacen todo el trabajo:
- `swagger-jsdoc`: Lee los comentarios `@swagger` en tus rutas y genera la especificación
- `swagger-ui-express`: Sirve la interfaz gráfica de Swagger en el navegador

### 2. Copiar archivos a tu proyecto

Copia estos archivos a tu proyecto:

**En `src/config/`:**
- `swaggerConfig.js` - Configuración general de Swagger

**En `src/routes/` (reemplazar los existentes):**
- `authRoutes.js` - Con comentarios Swagger
- `userRoutes.js` - Con comentarios Swagger
- `gameSlotRoutes.js` - Con comentarios Swagger
- `rankingRoutes.js` - Con comentarios Swagger
- `capturedPokemonRoutes.js` - Con comentarios Swagger
- `replayRoutes.js` - Con comentarios Swagger

**En `src/` (reemplazar el existente):**
- `index.js` - Versión actualizada con Swagger UI integrado

### 3. Verificar que `swaggerConfig.js` esté correctamente importado en `index.js`

En tu `src/index.js`, debe haber:

```javascript
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swaggerConfig.js';

// ... más código ...

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

## Usar Swagger

### Iniciar el servidor

```bash
npm start
```

### Abrir Swagger UI en el navegador

Abre tu navegador y ve a:

```
http://localhost:3000/api-docs
```

Verás una interfaz bonita con todos tus endpoints organizados por categorías (tags).

### Probar un endpoint

1. Haz click en un endpoint (ej: `POST /api/auth/login`)
2. Verás los detalles: parámetros requeridos, esquema del body, ejemplos de respuesta
3. Haz click en el botón `Try it out`
4. Rellena los campos (ej: username: "Ash", password: "testpass123")
5. Haz click en `Execute`
6. Verás la respuesta del servidor en tiempo real

### Usar autenticación JWT en Swagger

Algunos endpoints requieren un token JWT. Así los usas:

1. Primero haz login (`POST /api/auth/login`) y obtén el `access_token`
2. Copia el token
3. En la parte superior derecha de Swagger, haz click en el botón `Authorize`
4. Pega el token en el campo (sin "Bearer ", solo el token)
5. Haz click en `Authorize`
6. Ahora todos los endpoints que requieren autenticación te incluirán el header automáticamente

## Estructura de la documentación Swagger

Cada endpoint tiene esta información:

```yaml
@swagger
/api/users/{id}:
  get:
    summary: Breve descripción
    description: Descripción más detallada
    tags: ["Usuarios"]  # Categoría
    parameters:         # Parámetros path, query
      - in: path
        name: id
        schema: 
          type: integer
    responses:          # Posibles respuestas
      200:
        description: Descripción del éxito
        content:
          application/json:
            schema: { ... }
      404:
        description: Usuario no encontrado
```

## Componentes documentados

El archivo `swaggerConfig.js` define componentes reutilizables:

**Esquemas (Models):**
- `User` - Estructura de un usuario
- `GameSlot` - Estructura de una partida
- `CapturedPokemon` - Estructura de un pokémon capturado
- `Ranking` - Estructura de un ranking
- `AuthResponse` - Estructura de respuesta de autenticación
- `Error` - Estructura de error

**Seguridad:**
- `BearerAuth` - Autenticación JWT

Todos los endpoints usan estos componentes para documentación consistente.

## Archivo Swagger JSON

Si necesitas el archivo JSON completo de la especificación (por ejemplo, para integrar con otro servicio), está disponible en:

```
http://localhost:3000/api-docs/swagger.json
```

## Generar clientes automáticos

Con la especificación Swagger, puedes generar clientes automáticos en múltiples lenguajes:

```bash
# Generar cliente TypeScript
npm install -g swagger-codegen
swagger-codegen generate -i http://localhost:3000/api-docs/swagger.json -l typescript -o ./generated-client
```

## Solución de problemas

### Swagger no aparece en `/api-docs`

Verifica que:
1. Las dependencias estén instaladas: `npm ls swagger-ui-express swagger-jsdoc`
2. El archivo `swaggerConfig.js` existe en `src/config/`
3. En `index.js` está importado correctamente

### Los endpoints no aparecen en Swagger UI

Verifica que:
1. Los archivos de rutas tengan los comentarios `@swagger`
2. En `swaggerConfig.js`, la opción `apis` apunte a la carpeta correcta: `./src/routes/*.js`
3. Los comentarios estén bien formados (deben ser comentarios válidos de YAML)

### Los ejemplos de respuesta no aparecen

Asegúrate de que en cada endpoint haya una sección `responses` con:
```yaml
responses:
  200:
    description: Descripción
    content:
      application/json:
        schema:
          $ref: '#/components/schemas/NombreDelEsquema'
```

## Mantener Swagger actualizado

Cada vez que:
- Agregues un nuevo endpoint
- Cambies parámetros de un endpoint
- Cambies respuestas

**Debes actualizar los comentarios `@swagger`** en el archivo de rutas correspondiente.

Swagger se regenera automáticamente cuando reinicies el servidor.

## Recursos útiles

- [Documentación oficial de OpenAPI 3.0](https://spec.openapis.org/oas/v3.0.3)
- [Swagger Editor (para editar especificaciones)](https://editor.swagger.io)
- [swagger-jsdoc en NPM](https://www.npmjs.com/package/swagger-jsdoc)
- [swagger-ui-express en NPM](https://www.npmjs.com/package/swagger-ui-express)

## Próximos pasos

Ahora que tienes Swagger configurado:

1. Haz pruebas de todos los endpoints en `/api-docs`
2. Asegúrate de que todas las respuestas coincidan con lo documentado
3. Usa Swagger para encontrar bugs o endpoints que falten documentar
4. Comparte la URL `/api-docs` con tu equipo para que todos puedan entender el API

# Quick Start para Desarrolladores

Guía mínima para empezar a trabajar en el proyecto.

---

## 5 Minutos: Levantar el Proyecto

### Terminal 1: Backend

```bash
cd backend
npm install
npm run dev
```

Debería ver:
```
✅ Base de datos conectada
✅ Modelos sincronizados
🚀 Servidor en http://localhost:3000
📚 Swagger UI en http://localhost:3000/api-docs
```

### Terminal 2: Frontend

```bash
cd frontend
npm install
npm run dev
```

Debería ver:
```
VITE ready in X ms
Local: http://localhost:5173/
```

---

## Estructura Mental

```
[React Frontend] ←→ [Express API] ←→ [PostgreSQL BD]
   (5173)              (3000)
```

- **Frontend**: Juego fullscreen. Envía requests a API. Autenticación con JWT.
- **Backend**: Expone endpoints REST. Valida. Interactúa con BD. Genera documentación Swagger.
- **BD**: PostgreSQL. Tablas: users, game_slots, captured_pokemon, rankings, game_replays, refresh_tokens.

---

## Tareas Comunes

### Agregar nuevo endpoint

**1. Controlador** (`backend/src/controllers/`)
```javascript
export async function myAction(req, res) {
  res.json({ message: 'OK' });
}
```

**2. Ruta** (`backend/src/routes/`)
```javascript
router.get('/my-endpoint', myAction);
```

**3. Servicio** (`backend/src/services/`) - Lógica de negocio
```javascript
export async function myLogic() {
  // ...
}
```

**4. JSDoc para Swagger**
```javascript
/**
 * @swagger
 * /api/my-endpoint:
 *   get:
 *     summary: Mi acción
 *     responses:
 *       200:
 *         description: Exitoso
 */
```

### Llamar API desde Frontend

```javascript
// frontend/src/services/api/custom.js
export async function myApiCall() {
  return request('GET', '/api/my-endpoint');
}

// En componente
const result = await myApiCall();
```

### Cambiar Modelos BD

```javascript
// backend/src/models/myModel.js
const MyModel = sequelize.define('MyModel', {
  id: { type: INTEGER, primaryKey: true },
  name: { type: STRING, allowNull: false }
}, { tableName: 'my_models' });

// En models/index.js
export { MyModel };
```

Sequelize sincroniza automáticamente en `npm run dev`.

---

## Debugging

### Backend
```bash
# Con console.log
console.log('Debug:', variable);

# Con debugger en Node
node --inspect backend/src/index.js

# Luego abrir chrome://inspect
```

### Frontend
```bash
# DevTools del navegador (F12)
# Console, Network, Sources

# React DevTools (extensión Chrome)
```

### Base de Datos
```bash
# Conectarse directamente
psql -U pokesector_user -d pokesector_db

# Ver tabla
SELECT * FROM users LIMIT 5;

# Ver estructura
\d game_slots
```

---

## Flujo de Git (Recomendado)

```bash
# Feature branch
git checkout -b feature/new-endpoint

# Hacer cambios
git add .
git commit -m "feat: agregar nuevo endpoint"

# Push
git push origin feature/new-endpoint

# Pull request en GitHub/GitLab
```

---

## Testing Manual con cURL

### Registrar usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Test1","password":"test123"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"Test1","password":"test123"}'
```

Copiar el `access_token` de la respuesta.

### Endpoint protegido
```bash
curl -X GET http://localhost:3000/api/users/1 \
  -H "Authorization: Bearer {access_token}"
```

---

## Documentación

Acceder a:
- **API interactiva**: http://localhost:3000/api-docs
- **Documentación técnica**: `/docs` en raíz del proyecto
- **README**: `/README.md`

---

## Problemas Comunes

### "Puerto 3000 en uso"
```bash
lsof -ti:3000 | xargs kill -9
```

### "Base de datos no conecta"
```bash
# Verificar que PostgreSQL está corriendo
psql -U pokesector_user -d pokesector_db

# Si no existe BD, crearla
createdb pokesector_db -O pokesector_user
```

### "npm ERR: eacces"
```bash
# Cambiar permisos si es necesario
sudo chown -R $(whoami) ~/.npm
```

### "Token expirado en desarrollo"
```javascript
// Frontend maneja automáticamente con refresh_token
// Si necesitas testear sin eso, agregar en .env:
JWT_EXPIRY=24h
```

---

## Variables Útiles

**Backend `.env`**
```env
PORT=3000
DB_HOST=localhost
JWT_SECRET=your-super-secret-key
NODE_ENV=development
```

**Frontend `.env`**
```env
VITE_API_URL=http://localhost:3000
```

---

## Recursos Útiles

- **Documentación completa**: Carpeta `/docs`
- **Swagger OpenAPI**: http://localhost:3000/api-docs
- **Sequelize ORM**: https://sequelize.org/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/

---

## Siguiente

Leer [ARQUITECTURA.md](./ARQUITECTURA.md) para entender flujos completos.

---

**¿Necesitas ayuda?** Consulta los docs específicos en `/docs`.

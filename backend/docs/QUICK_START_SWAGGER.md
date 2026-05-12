# Quick Start: Swagger en 5 Minutos

Guía rápida para tener Swagger funcionando en tu proyecto PokéSector 35.

## 1️⃣ Instalar (1 minuto)

```bash
npm install swagger-jsdoc swagger-ui-express
```

## 2️⃣ Copiar archivos (2 minutos)

**Archivo de configuración:**
```
swaggerConfig.js → src/config/swaggerConfig.js
```

**Archivos de rutas (reemplaza los existentes):**
```
authRoutesSwagger.js           → src/routes/authRoutes.js
userRoutesSwagger.js           → src/routes/userRoutes.js
gameSlotRoutesSwagger.js       → src/routes/gameSlotRoutes.js
rankingRoutesSwagger.js        → src/routes/rankingRoutes.js
capturedPokemonRoutesSwagger.js → src/routes/capturedPokemonRoutes.js
replayRoutesSwagger.js         → src/routes/replayRoutes.js
```

**Archivo principal:**
```
indexWithSwagger.js → src/index.js (reemplazar el existente)
```

## 3️⃣ Iniciar servidor (1 minuto)

```bash
npm start
```

Deberías ver algo como:
```
🚀 PokéSector 35 Backend ejecutándose en http://localhost:3000
📚 Swagger UI disponible en http://localhost:3000/api-docs
```

## 4️⃣ Abrir Swagger en el navegador (1 minuto)

Abre: **http://localhost:3000/api-docs**

¡Listo! Ya tienes la documentación interactiva.

---

## 🎯 Probar un endpoint en Swagger

1. Abre http://localhost:3000/api-docs
2. Busca `POST /api/auth/login`
3. Haz click en él (se expande)
4. Haz click en `Try it out`
5. Rellena:
   - username: `Ash`
   - password: `testpass123`
6. Haz click en `Execute`
7. ¡Ves la respuesta en vivo!

---

## 🔐 Usar endpoints con autenticación

Algunos endpoints requieren token JWT.

1. Primero, haz login y obtén el token
2. En Swagger, en la parte superior derecha, haz click en `Authorize`
3. Pega el `access_token` que obtuviste
4. Ahora puedes probar todos los endpoints protegidos

---

## 📝 Actualizar documentación

Si cambias un endpoint, actualiza su comentario `@swagger` en el archivo de rutas.

Ejemplo: Si cambias `POST /api/users/{id}/change-password`, edita el comentario `@swagger` en `src/routes/userRoutes.js`:

```javascript
/**
 * @swagger
 * /api/users/{id}/change-password:
 *   put:
 *     summary: Tu nueva descripción
 *     ...
 */
```

Reinicia el servidor y los cambios se actualizan automáticamente.

---

## 🐛 Solucionar problemas

### Swagger no aparece
- ✓ ¿Instalaste las dependencias? → `npm install swagger-jsdoc swagger-ui-express`
- ✓ ¿Copiaste `swaggerConfig.js` a `src/config/`?
- ✓ ¿Reiniciaste el servidor?

### Los endpoints no aparecen
- ✓ ¿Reemplazaste los archivos de `src/routes/`?
- ✓ ¿Reemplazaste `src/index.js`?
- ✓ ¿Hay errores en la consola?

### No puedo autenticarme
- ✓ ¿Copiaste el token sin espacios?
- ✓ ¿El token no ha expirado? (expira en 15 minutos)
- ✓ ¿Hiciste login primero?

---

## 📚 Archivos clave

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| swaggerConfig.js | src/config/ | Configuración central de Swagger |
| authRoutes.js | src/routes/ | Endpoints de autenticación + @swagger |
| userRoutes.js | src/routes/ | Endpoints de usuarios + @swagger |
| ... | src/routes/ | Otros endpoints + @swagger |
| index.js | src/ | Servidor Express con Swagger UI |

---

## ✅ Checklist

- [ ] Instalé `swagger-jsdoc` y `swagger-ui-express`
- [ ] Copié `swaggerConfig.js` a `src/config/`
- [ ] Reemplacé los 6 archivos de `src/routes/`
- [ ] Reemplacé `src/index.js`
- [ ] Inicié el servidor con `npm start`
- [ ] Abrí http://localhost:3000/api-docs en el navegador
- [ ] Probé un endpoint (ej: login)
- [ ] Usé autenticación para probar un endpoint protegido

¡Si todos los checkboxes están marcados, ¡Swagger está funcionando! 🎉

---

## 🎓 Siguientes pasos

1. Explora todos los endpoints en Swagger
2. Prueba diferentes casos (éxito y error)
3. Verifica que los ejemplos de respuesta sean realistas
4. Si encuentras algo que no funciona, actualiza el comentario @swagger
5. Comparte la URL `/api-docs` con tu equipo

---

## 💡 Ejemplo de flujo completo

```bash
# 1. Instalar
npm install swagger-jsdoc swagger-ui-express

# 2. Copiar archivos (desde /mnt/user-data/outputs/)
cp swaggerConfig.js src/config/
cp *RoutesSwagger.js src/routes/
cp indexWithSwagger.js src/index.js

# 3. Iniciar
npm start

# 4. Abrir navegador
# http://localhost:3000/api-docs

# 5. ¡Listo! Swagger está activo
```

---

## 🚀 Para tu Pull Request

Cuando hagas el PR con Swagger, recuerda:

```bash
git add src/config/swaggerConfig.js
git add src/routes/*.js
git add src/index.js
git add docs/SWAGGER_SUMMARY.md
git add docs/SWAGGER_SETUP.md
git commit -m "docs: add comprehensive Swagger/OpenAPI documentation with interactive UI"
git push origin feature/docs
```

---

**¡Ya está! Ahora tienes documentación profesional, interactiva y siempre actualizada.** ✨

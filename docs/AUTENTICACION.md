# Autenticación y Seguridad - PokéSector 35

Sistema de autenticación JWT con tokens refresh, rate limiting y validaciones anti-bot.

---

## JWT (JSON Web Tokens)

### Access Token

- **Duración**: 1 hora
- **Almacenamiento**: localStorage (cliente)
- **Uso**: Incluir en header `Authorization: Bearer {token}`
- **Payload**: user_id, username, role
- **Validación**: Se verifica firma con JWT_SECRET

**Ejemplo decodificado**
```json
{
  "user_id": 1,
  "username": "Ash",
  "role": "user",
  "iat": 1715945400,
  "exp": 1715949000
}
```

### Refresh Token

- **Duración**: 7 días
- **Almacenamiento**: BD (tabla refresh_tokens)
- **Uso**: POST /api/auth/refresh para obtener nuevo access_token
- **Validación**: Se verifica existencia en BD + firma

**Flujo**
```
[Cliente intenta request con access_token expirado]
              ⬇
       [401 Unauthorized]
              ⬇
[POST /api/auth/refresh con refresh_token]
              ⬇
[Verifica refresh_token en BD]
              ⬇
[Genera nuevo access_token]
              ⬇
[Retorna nuevo token]
              ⬇
[Cliente reintenta original request]
```

---

## Generación de Tokens

### generateAccessToken(user)

```javascript
// En authService.js
export function generateAccessToken(user) {
  const payload = {
    user_id: user.id,
    username: user.username,
    role: user.role
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY || '1h'
  });
}
```

**Ejecución**:
1. Extrae datos relevantes del usuario
2. Crea payload
3. Firma con JWT_SECRET
4. Establece expiración

---

### generateRefreshToken(user)

```javascript
export async function generateRefreshToken(user) {
  const token = jwt.sign(
    { user_id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_EXPIRY || '7d' }
  );

  // Almacenar en BD para validación posterior
  await RefreshToken.create({
    user_id: user.id,
    token,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  });

  return token;
}
```

**Ejecución**:
1. Firma token con REFRESH_SECRET
2. Almacena en BD
3. Retorna token para cliente

---

## Validación de Tokens

### authMiddleware

Se ejecuta antes de controladores protegidos.

```javascript
// En authMiddleware.js
export function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Sin token' });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Asigna datos al request
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}
```

**Pasos**:
1. Extrae token del header Authorization
2. Intenta verificar la firma
3. Si falla: error 401
4. Si válido: asigna `req.user` para controlador

### Ejemplo de uso en ruta

```javascript
// En gameSlotRoutes.js
router.post('/:id/capture', authMiddleware, captureController);

// En captureController
export async function captureController(req, res) {
  const userId = req.user.user_id; // Disponible gracias a authMiddleware
  // ... resto del código
}
```

---

## Flujos de Autenticación

### Registro

```
Usuario envía username + password
        ⬇
POST /api/auth/register
        ⬇
Validar username (no existe, sin SQL/XSS)
Validar password (mín 6 chars)
        ⬇
Hash password con bcrypt (10 rounds)
        ⬇
INSERT en usuarios
        ⬇
Generar access_token (1h)
Generar refresh_token (7d) + guardar en BD
        ⬇
Retorna: access_token, refresh_token, user_id, username
        ⬇
Cliente almacena en localStorage
```

### Login

```
Usuario envía username + password
        ⬇
POST /api/auth/login
        ⬇
SELECT usuario WHERE username
        ⬇
Comparar password con hash bcrypt
        ⬇
Si válido: generar tokens
Si inválido: error 400 + incrementar rate limit
        ⬇
Retorna: access_token, refresh_token, user_id
        ⬇
Cliente almacena en localStorage
```

### Refresh Token

```
Cliente con access_token expirado
        ⬇
Recibe 401 de API
        ⬇
POST /api/auth/refresh con refresh_token
        ⬇
SELECT de refresh_tokens WHERE token
        ⬇
Validar:
  - Token existe en BD
  - No ha expirado (expires_at > NOW)
  - Firma JWT válida
        ⬇
Si válido: generar nuevo access_token
Si inválido: error 401 (reautenticar)
        ⬇
Retorna: nuevo access_token
        ⬇
Cliente reintenta request original
```

---

## Bcrypt para Contraseñas

### Hashing

```javascript
import bcrypt from 'bcryptjs';

const password = 'pikachu123';
const hashedPassword = await bcrypt.hash(password, 10); // 10 = rounds
// Resultado: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36QJsSFm

// Almacenar hashedPassword en BD
```

### Verificación

```javascript
const isMatch = await bcrypt.compare(password, hashedPassword);
// isMatch = true si contraseña coincide
```

**Ventajas**
- Irreversible (no se puede recuperar)
- Lento por diseño (protege fuerza bruta)
- Cada hash es diferente (salt aleatorio)

---

## Rate Limiting

Protege contra ataques de fuerza bruta.

### Configuración

```javascript
// En rateLimitMiddleware.js
const MAX_ATTEMPTS = 5;
const TIME_WINDOW = 15 * 1000; // 15 segundos
const BLOCK_TIME = 60 * 1000; // 1 minuto

const loginAttempts = new Map(); // { ip: { count, resetTime } }
```

### Login Attempts

```javascript
export function incrementLoginAttempts(req) {
  const ip = req.ip;
  const current = loginAttempts.get(ip) || { count: 0, resetTime: Date.now() };
  
  // Reset si pasó la ventana de tiempo
  if (Date.now() - current.resetTime > TIME_WINDOW) {
    current.count = 0;
    current.resetTime = Date.now();
  }
  
  current.count++;
  loginAttempts.set(ip, current);
}

export function getLoginAttemptsRemaining(req) {
  const ip = req.ip;
  const current = loginAttempts.get(ip);
  
  if (!current || Date.now() - current.resetTime > TIME_WINDOW) {
    return { remaining: MAX_ATTEMPTS, resetTime: null };
  }
  
  return {
    remaining: Math.max(0, MAX_ATTEMPTS - current.count),
    resetTime: new Date(current.resetTime + TIME_WINDOW)
  };
}
```

### Uso en Controller

```javascript
export async function login(req, res) {
  const remaining = getLoginAttemptsRemaining(req);
  
  if (remaining.remaining === 0) {
    return res.status(429).json({
      error: 'Demasiados intentos',
      resetTime: remaining.resetTime
    });
  }

  try {
    const user = await loginUser(username, password);
    // ... login exitoso, no incrementar
  } catch (error) {
    incrementLoginAttempts(req); // Incrementar en error
    return res.status(400).json({ error: 'Usuario o contraseña inválidos' });
  }
}
```

---

## Validaciones Anti-Spam

### Username Validation

```javascript
// En usernameValidation.js
export function validateUsername(username) {
  // No vacío
  if (!username || username.length < 3) {
    return { valid: false, reason: 'Username mín 3 caracteres' };
  }

  // Max longitud
  if (username.length > 15) {
    return { valid: false, reason: 'Username máx 15 caracteres' };
  }

  // SQL injection patterns
  if (hasSQL(username)) {
    return { valid: false, reason: 'Username contiene caracteres no permitidos' };
  }

  // XSS patterns
  if (hasXSS(username)) {
    return { valid: false, reason: 'Username contiene caracteres no permitidos' };
  }

  // URLs
  if (hasURL(username)) {
    return { valid: false, reason: 'Username no puede contener URLs' };
  }

  return { valid: true };
}

function hasSQL(str) {
  return /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|WHERE)\b)/i.test(str);
}

function hasXSS(str) {
  return /[<>\"\'`]/i.test(str);
}

function hasURL(str) {
  return /(https?:|www\.)/i.test(str);
}
```

### Password Validation

```javascript
export function validatePassword(password) {
  if (!password || password.length < 6) {
    return { valid: false, reason: 'Contraseña mín 6 caracteres' };
  }

  // Contraseñas comunes
  const commonPasswords = [
    '123456', 'password', '12345678', 'qwerty', 
    'abc123', 'monkey', '1234567', 'letmein',
    'trustno1', 'dragon', 'baseball', '111111'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, reason: 'Contraseña demasiado común' };
  }

  return { valid: true };
}
```

---

## CORS (Cross-Origin Resource Sharing)

```javascript
// En index.js
import cors from 'cors';

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Configuración**:
- Permite requests desde dominio frontend
- Incluir credentials (cookies, headers)
- Solo métodos necesarios
- Headers: Content-Type y Authorization

---

## Headers de Seguridad

```javascript
// Middleware adicional recomendado
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

---

## Checklist de Seguridad

- ✅ Contraseñas hasheadas con bcrypt (10+ rounds)
- ✅ JWT con secretos fuertes y únicos
- ✅ Rate limiting en login/register
- ✅ Validación de entrada (SQL injection, XSS)
- ✅ CORS configurado
- ✅ HTTPS en producción (recomendado)
- ✅ Tokens con expiración
- ✅ Refresh tokens almacenados en BD
- ✅ Error messages genéricos (no revelar si usuario existe)
- ⚠️ **TODO**: Implementar CSRF tokens para formularios
- ⚠️ **TODO**: 2FA (autenticación de dos factores)

---

**Próximo**: [FRONTEND.md](./FRONTEND.md) para arquitectura del cliente

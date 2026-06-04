# Auth — Contratos de Interfaz

> Este documento describe los contratos HTTP del módulo de autenticación, independientemente de la implementación del backend. Todos los endpoints están bajo el prefijo `/api/auth`.

---

## Convenciones generales

### Autenticación

Los tokens se transmiten exclusivamente mediante **cookies HTTP-only** (`SameSite=Lax`, `Secure` en producción):

| Cookie | Descripción |
|---|---|
| `accessToken` | Token de acceso de corta duración (JWT) |
| `refreshToken` | Token de refresco de larga duración (JWT) |

Los endpoints protegidos requieren que `accessToken` esté presente y sea válido.

### Formato de respuesta

Todas las respuestas siguen la misma estructura base:

```json
{
  "status": "success" | "error",
  "message": "string",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": { ... } | null
}
```

### Rate Limiting

Los endpoints marcados con 🔒 aplican rate limiting: **10 peticiones por hora por IP**.

---

## Endpoints

### POST `/api/auth/register` 🔒

Registra un nuevo usuario. Acepta opcionalmente un avatar como archivo `multipart/form-data`.

**Content-Type**: `multipart/form-data` o `application/json`

**Request body**:

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `email` | `string` | ✅ | Email único del usuario |
| `password` | `string` | ✅ | Mínimo 8 caracteres, al menos una mayúscula, número y símbolo |
| `username` | `string` | ✅ | Único, sin espacios, 3-50 caracteres |
| `first_name` | `string` | ✅ | Nombre |
| `last_name` | `string` | ✅ | Apellido |
| `bio` | `string` | ❌ | Descripción del perfil |
| `avatar` | `file` | ❌ | Imagen de perfil (jpg, png, webp) |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `201` | Usuario registrado | Setea cookies `accessToken` y `refreshToken` |
| `400` | Validación fallida | Campos inválidos o faltantes |
| `409` | Conflicto | El email o username ya existen |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Error interno | - |

**Ejemplo de respuesta exitosa (201)**:
```json
{
  "status": "success",
  "message": "User registered successfully",
  "statusCode": 201,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "usertest",
      "first_name": "John",
      "last_name": "Doe",
      "bio": null,
      "avatar_url": null,
      "is_active": true,
      "email_verified": false,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "last_login_at": null
    }
  }
}
```

---

### POST `/api/auth/login` 🔒

Inicia sesión con credenciales.

**Content-Type**: `application/json`

**Request body**:

| Campo | Tipo | Requerido |
|---|---|---|
| `email` | `string` | ✅ |
| `password` | `string` | ✅ |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Login exitoso | Setea cookies `accessToken` y `refreshToken` |
| `400` | Validación fallida | Campos faltantes o mal formados |
| `401` | Credenciales inválidas | Email o contraseña incorrectos |
| `429` | Too Many Requests | Rate limit excedido |
| `500` | Error interno | - |

---

### POST `/api/auth/logout` 🔐

Cierra la sesión del usuario autenticado. Invalida los tokens en cache.

**Requiere autenticación**: Sí (cookie `accessToken`)

**Request body**: vacío

**Respuestas**:

| Código | Descripción |
|---|---|
| `200` | Sesión cerrada correctamente |
| `401` | Token inválido o expirado |

---

### POST `/api/auth/refresh`

Renueva el par de tokens usando el `refreshToken` de la cookie.

**Request body**: vacío (el token se lee de la cookie)

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Tokens renovados | Setea nuevas cookies `accessToken` y `refreshToken` |
| `400` | Sin refresh token | Cookie no presente |
| `401` | Token inválido o expirado | - |

---

### GET `/api/auth/profile` 🔐

Obtiene el perfil del usuario autenticado.

**Requiere autenticación**: Sí

**Respuestas**:

| Código | Descripción |
|---|---|
| `200` | Perfil del usuario (sin `password_hash`) |
| `401` | No autenticado |

---

### POST `/api/auth/verify-email`

Verifica el email del usuario usando el token enviado por correo.

**Query params**:

| Parámetro | Tipo | Requerido |
|---|---|---|
| `token` | `string` | ✅ |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Email verificado | - |
| `401` | Token inválido o expirado | - |
| `404` | Token no encontrado | - |

---

### POST `/api/auth/resend-verification`

Reenvía el email de verificación.

**Request body**:

| Campo | Tipo | Requerido |
|---|---|---|
| `email` | `string` | ✅ |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Email reenviado | - |
| `400` | Email ya verificado o no existe | - |

---

### POST `/api/auth/forgot-password` 🔒

Inicia el flujo de recuperación de contraseña. Envía un email con el token.

**Request body**:

| Campo | Tipo | Requerido |
|---|---|---|
| `email` | `string` | ✅ |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Email enviado (siempre, por seguridad) | No revela si el email existe |
| `429` | Rate limit excedido | - |

---

### POST `/api/auth/validate-token`

Valida si un token de reseteo de contraseña es vigente.

**Request body**:

| Campo | Tipo | Requerido |
|---|---|---|
| `token` | `string` | ✅ |

**Respuestas**:

| Código | Descripción |
|---|---|
| `200` | Token válido |
| `400` | Token inválido o expirado |

---

### POST `/api/auth/reset-password`

Establece una nueva contraseña usando el token de recuperación.

**Query params**:

| Parámetro | Tipo | Requerido |
|---|---|---|
| `token` | `string` | ✅ |

**Request body**:

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `password` | `string` | ✅ | Nueva contraseña |
| `password_confirmation` | `string` | ✅ | Debe coincidir con `password` |

**Respuestas**:

| Código | Descripción |
|---|---|
| `200` | Contraseña actualizada |
| `400` | Token inválido, expirado o contraseñas no coinciden |

---

## Casos de error comunes

| Situación | Código HTTP | Mensaje típico |
|---|---|---|
| Token JWT expirado | `401` | `Token expired` |
| Token JWT malformado | `401` | `Invalid token` |
| Sin cookie de acceso | `401` | `Unauthorized` |
| Email ya registrado | `409` | `Email already exists` |
| Username ya registrado | `409` | `Username already exists` |
| Rate limit superado | `429` | `Too many requests` |
| Campo requerido faltante | `400` | mensaje de Zod |
| Error de servidor | `500` | `Internal server error` |

# Profile — Contratos de Interfaz

> Este documento describe los contratos HTTP del módulo de perfil, independientemente de la implementación del backend. Todos los endpoints están bajo el prefijo `/api/profile`.

---

## Convenciones generales

Todos los endpoints de este módulo requieren autenticación mediante cookie `accessToken`.

### Formato de respuesta base

```json
{
  "status": "success" | "error",
  "message": "string",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": { ... } | null
}
```

### Modelo `User` (sin `password_hash`)

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "usertest",
  "first_name": "John",
  "last_name": "Doe",
  "bio": "Desarrollador full stack",
  "avatar_url": "https://res.cloudinary.com/.../avatar.jpg",
  "is_active": true,
  "email_verified": true,
  "created_at": "2024-01-01T00:00:00.000Z",
  "updated_at": "2024-01-01T00:00:00.000Z",
  "last_login_at": "2024-01-01T00:00:00.000Z"
}
```

---

## Endpoints

### GET `/api/profile/me` 🔐

Obtiene el perfil completo del usuario autenticado.

**Requiere autenticación**: Sí

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Perfil del usuario | Puede servirse desde caché (Redis) |
| `401` | No autenticado | Token ausente o inválido |
| `500` | Error interno | - |

**Ejemplo de respuesta exitosa (200)**:
```json
{
  "status": "success",
  "message": "Profile retrieved successfully",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "usertest",
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Desarrollador full stack",
    "avatar_url": "https://res.cloudinary.com/.../avatar.jpg",
    "is_active": true,
    "email_verified": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "last_login_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/api/profile/me` 🔐

Actualiza los datos del perfil del usuario autenticado. Sólo se actualizan los campos enviados.

**Requiere autenticación**: Sí

**Content-Type**: `application/json`

**Request body** (todos los campos son opcionales):

| Campo | Tipo | Validación | Descripción |
|---|---|---|---|
| `first_name` | `string` | No vacío | Nombre |
| `last_name` | `string` | No vacío | Apellido |
| `bio` | `string` | Max 160 chars | Descripción del perfil |
| `username` | `string` | Único, 3-50 chars, sin espacios | Nombre de usuario público |

> **Nota**: El email **no** puede actualizarse desde este endpoint. El avatar se gestiona en `/api/profile/avatar`.

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Perfil actualizado | Retorna el perfil actualizado. Invalida caché. |
| `400` | Validación fallida | Campo inválido |
| `401` | No autenticado | - |
| `409` | Conflicto | El nuevo username ya está en uso |
| `500` | Error interno | - |

---

### PATCH `/api/profile/avatar` 🔐

Sube o reemplaza el avatar del usuario. Acepta un archivo de imagen via `multipart/form-data`.

**Requiere autenticación**: Sí

**Content-Type**: `multipart/form-data`

**Form fields**:

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `avatar` | `file` | ✅ | Imagen (jpg, png, webp). Máx. según config de Multer. |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Avatar actualizado | Retorna el perfil con la nueva `avatar_url`. Invalida caché. |
| `400` | Archivo inválido | Tipo MIME no permitido o archivo faltante |
| `401` | No autenticado | - |
| `500` | Error interno | Error en Cloudinary o BD |

**Ejemplo de respuesta exitosa (200)**:
```json
{
  "status": "success",
  "message": "Avatar updated successfully",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "avatar_url": "https://res.cloudinary.com/.../new-avatar.jpg",
    "...": "resto del perfil"
  }
}
```

---

### DELETE `/api/profile/avatar` 🔐

Elimina el avatar actual del usuario (lo pone en `null`).

**Requiere autenticación**: Sí

**Request body**: vacío

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Avatar eliminado | `avatar_url` queda en `null`. Invalida caché. |
| `401` | No autenticado | - |
| `404` | Sin avatar | El usuario no tiene avatar que eliminar |
| `500` | Error interno | Error en Cloudinary o BD |

---

## Casos de error comunes

| Situación | Código HTTP | Mensaje típico |
|---|---|---|
| Token ausente o inválido | `401` | `Unauthorized` |
| Token expirado | `401` | `Token expired` |
| Username ya en uso | `409` | `Username already taken` |
| Tipo de archivo no permitido | `400` | `Invalid file type` |
| Archivo demasiado grande | `400` | `File too large` |
| Usuario sin avatar al intentar eliminar | `404` | `Avatar not found` |
| Error al subir a Cloudinary | `500` | `Internal server error` |
| Error de BD | `500` | `Internal server error` |

> **Nota sobre caché**: `GET /api/profile/me` puede servirse desde Redis. Las mutaciones (`PATCH /me`, `PATCH /avatar`, `DELETE /avatar`) invalidan la caché del perfil del usuario y la del perfil público.

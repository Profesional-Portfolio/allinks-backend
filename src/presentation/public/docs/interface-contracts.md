# Public — Contratos de Interfaz

> Este documento describe los contratos HTTP del módulo de acceso público, independientemente de la implementación del backend. Todos los endpoints están bajo el prefijo `/api/public`.

---

## Convenciones generales

Los endpoints de este módulo son **completamente públicos**: no requieren autenticación. Están diseñados para ser consumidos por visitantes que acceden al perfil de un usuario mediante su username.

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

### Modelo `UserWithLinks`

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
  "last_login_at": "2024-01-01T00:00:00.000Z",
  "links": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "url": "https://github.com/usuario",
      "platform": "github",
      "title": "Mi GitHub",
      "display_order": 0,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Endpoints

### GET `/api/public/:username`

Obtiene el perfil público de un usuario y sus enlaces activos.

**Autenticación**: No requerida (endpoint público)

**Path params**:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `username` | `string` | Nombre de usuario del perfil a consultar |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Perfil público con enlaces activos | Puede servirse desde caché (Redis). Solo incluye enlaces con `is_active = true`, ordenados por `display_order`. |
| `404` | Usuario no encontrado | El username no existe en el sistema |
| `500` | Error interno | - |

**Ejemplo de respuesta exitosa (200)**:
```json
{
  "status": "success",
  "message": "Public profile retrieved successfully",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "username": "usertest",
    "first_name": "John",
    "last_name": "Doe",
    "bio": "Desarrollador full stack",
    "avatar_url": "https://res.cloudinary.com/.../avatar.jpg",
    "links": [
      {
        "id": "uuid",
        "url": "https://github.com/usertest",
        "platform": "github",
        "title": "Mi GitHub",
        "display_order": 0,
        "is_active": true
      },
      {
        "id": "uuid",
        "url": "https://linkedin.com/in/usertest",
        "platform": "linkedin",
        "title": "Mi LinkedIn",
        "display_order": 1,
        "is_active": true
      }
    ]
  }
}
```

**Ejemplo de respuesta cuando el usuario no existe (404)**:
```json
{
  "status": "error",
  "message": "User not found",
  "statusCode": 404,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": null
}
```

---

### GET `/api/public/check-availability/:username`

Verifica si un username está disponible para ser usado en el registro o en la actualización de perfil.

**Autenticación**: No requerida

**Path params**:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `username` | `string` | Username a verificar |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Username disponible | El username no está en uso |
| `409` | Username no disponible | Ya existe un usuario con ese username |
| `500` | Error interno | - |

**Ejemplo de respuesta cuando está disponible (200)**:
```json
{
  "status": "success",
  "message": "Username is available",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "available": true,
    "username": "nuevo_usuario"
  }
}
```

**Ejemplo de respuesta cuando no está disponible (409)**:
```json
{
  "status": "error",
  "message": "Username already taken",
  "statusCode": 409,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": null
}
```

---

## Casos de error comunes

| Situación | Código HTTP | Mensaje típico |
|---|---|---|
| Username no encontrado | `404` | `User not found` |
| Username ya en uso | `409` | `Username already taken` |
| Error de base de datos | `500` | `Internal server error` |
| Error de caché | `500` | `Internal server error` (el sistema intenta recuperarse y consulta la BD directamente) |

> **Nota sobre caché**: Las respuestas de `GET /api/public/:username` se cachean en Redis con la clave del username. La caché se invalida automáticamente cuando el usuario modifica su perfil, sus enlaces o su avatar.

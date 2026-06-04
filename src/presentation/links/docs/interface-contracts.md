# Links — Contratos de Interfaz

> Este documento describe los contratos HTTP del módulo de gestión de enlaces, independientemente de la implementación del backend. Todos los endpoints están bajo el prefijo `/api/links`.

---

## Convenciones generales

Todos los endpoints de este módulo requieren autenticación mediante cookie `accessToken`. El sistema valida además que el usuario sea propietario del recurso antes de permitir modificaciones (autorización a nivel de recurso).

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

### Modelo `Link`

```json
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
```

---

## Endpoints

### GET `/api/links` 🔐

Obtiene todos los enlaces del usuario autenticado.

**Requiere autenticación**: Sí

**Query params**: ninguno

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Lista de enlaces del usuario | Ordenados por `display_order` ASC |
| `401` | No autenticado | Token inválido o ausente |
| `500` | Error interno | - |

**Ejemplo de respuesta exitosa (200)**:
```json
{
  "status": "success",
  "message": "Links retrieved successfully",
  "statusCode": 200,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": [
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

### POST `/api/links` 🔐

Crea un nuevo enlace para el usuario autenticado.

**Requiere autenticación**: Sí

**Content-Type**: `application/json`

**Request body**:

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `title` | `string` | ✅ | Título visible del enlace |
| `url` | `string` | ✅ | URL completa (debe ser válida) |
| `platform` | `string` | ✅ | Identificador de la plataforma (ej. `github`, `linkedin`) |
| `is_active` | `boolean` | ❌ | Por defecto `true` |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `201` | Enlace creado | Retorna el enlace creado |
| `400` | Validación fallida | URL inválida, campos faltantes |
| `401` | No autenticado | - |
| `500` | Error interno | - |

**Ejemplo de respuesta exitosa (201)**:
```json
{
  "status": "success",
  "message": "Link created successfully",
  "statusCode": 201,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "url": "https://github.com/usuario",
    "platform": "github",
    "title": "Mi GitHub",
    "display_order": 3,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### PATCH `/api/links/:id` 🔐🛡️

Actualiza los datos de un enlace existente.

**Requiere autenticación**: Sí  
**Requiere autorización**: Sí — el usuario debe ser propietario del enlace (`AuthorizeLinkOwnerMiddleware`)

**Path params**:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string (uuid)` | ID del enlace a actualizar |

**Request body** (todos los campos son opcionales):

| Campo | Tipo | Descripción |
|---|---|---|
| `title` | `string` | Nuevo título |
| `url` | `string` | Nueva URL (debe ser válida) |
| `platform` | `string` | Nueva plataforma |
| `is_active` | `boolean` | Activar o desactivar el enlace |

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Enlace actualizado | Retorna el enlace actualizado |
| `400` | Validación fallida | URL inválida |
| `401` | No autenticado | - |
| `403` | Prohibido | El enlace no pertenece al usuario |
| `404` | No encontrado | El enlace no existe |
| `500` | Error interno | - |

---

### DELETE `/api/links/:id` 🔐🛡️

Elimina un enlace del usuario.

**Requiere autenticación**: Sí  
**Requiere autorización**: Sí — propietario del enlace

**Path params**:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string (uuid)` | ID del enlace a eliminar |

**Respuestas**:

| Código | Descripción |
|---|---|
| `200` | Enlace eliminado correctamente |
| `401` | No autenticado |
| `403` | El enlace no pertenece al usuario |
| `404` | Enlace no encontrado |
| `500` | Error interno |

---

### PATCH `/api/links/visibility/:id` 🔐🛡️

Alterna la visibilidad (`is_active`) de un enlace.

**Requiere autenticación**: Sí  
**Requiere autorización**: Sí — propietario del enlace

**Path params**:

| Parámetro | Tipo | Descripción |
|---|---|---|
| `id` | `string (uuid)` | ID del enlace |

**Request body**:

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `visibility` | `boolean` | ✅ | `true` = activo, `false` = oculto |

**Respuestas**:

| Código | Descripción |
|---|---|
| `200` | Visibilidad actualizada |
| `401` | No autenticado |
| `403` | No autorizado |
| `404` | Enlace no encontrado |
| `500` | Error interno |

---

### PATCH `/api/links/update/reorder` 🔐🛡️

Reordena múltiples enlaces en una sola operación.

**Requiere autenticación**: Sí  
**Requiere autorización**: Sí — todos los enlaces del array deben pertenecer al usuario (`AuthorizeBulkLinksMiddleware`)

**Content-Type**: `application/json`

**Request body**:

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `links` | `Array<{ id: string, display_order: number }>` | ✅ | Array con los IDs y sus nuevos órdenes |

**Ejemplo**:
```json
{
  "links": [
    { "id": "uuid-1", "display_order": 0 },
    { "id": "uuid-2", "display_order": 1 },
    { "id": "uuid-3", "display_order": 2 }
  ]
}
```

**Respuestas**:

| Código | Descripción | Notas |
|---|---|---|
| `200` | Links reordenados | Retorna la lista actualizada |
| `400` | Array vacío o mal formado | - |
| `401` | No autenticado | - |
| `403` | Algún enlace no pertenece al usuario | - |
| `500` | Error interno | - |

---

## Casos de error comunes

| Situación | Código HTTP | Mensaje típico |
|---|---|---|
| Token ausente o inválido | `401` | `Unauthorized` |
| Token expirado | `401` | `Token expired` |
| Enlace de otro usuario | `403` | `Forbidden` |
| Enlace no encontrado | `404` | `Link not found` |
| URL mal formada | `400` | mensaje de Zod |
| Campo requerido faltante | `400` | mensaje de Zod |
| Error de base de datos | `500` | `Internal server error` |

> **Nota sobre caché**: Las respuestas de `GET /api/links` pueden servirse desde Redis. Las mutaciones (crear, actualizar, eliminar, reordenar, cambiar visibilidad) invalidan la caché correspondiente del usuario automáticamente.

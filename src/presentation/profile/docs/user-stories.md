# Profile — Historias de Usuario y Reglas de Negocio

> Este documento describe las historias de usuario y las reglas de negocio que rigen el módulo de gestión de perfil.

---

## Historias de usuario

### HU-PROFILE-01: Ver mi perfil

**Como** usuario autenticado,  
**quiero** ver todos mis datos de perfil en el panel,  
**para** conocer qué información es visible y poder actualizarla.

**Criterios de aceptación**:
- El perfil muestra: id, email, username, nombre, apellido, bio, avatar_url, estado de verificación de email, fecha de registro y último login.
- El campo `password_hash` nunca se expone en la respuesta.
- La respuesta puede servirse desde caché para reducir la latencia.

---

### HU-PROFILE-02: Actualizar mis datos de perfil

**Como** usuario autenticado,  
**quiero** modificar mi nombre, apellido, bio o username,  
**para** mantener mi información pública actualizada.

**Criterios de aceptación**:
- El usuario puede actualizar uno o varios campos en una sola petición.
- Si intenta cambiar el username a uno ya existente, el sistema informa del conflicto.
- El email **no** puede cambiarse desde este flujo.
- La caché del perfil se invalida tras cualquier actualización.
- El perfil actualizado se retorna en la respuesta.

---

### HU-PROFILE-03: Subir o reemplazar mi avatar

**Como** usuario autenticado,  
**quiero** subir una foto de perfil (o reemplazar la existente),  
**para** personalizar la apariencia de mi perfil público.

**Criterios de aceptación**:
- El usuario puede subir una imagen en formato jpg, png o webp.
- La imagen se sube a Cloudinary y se almacena la URL pública resultante.
- Si ya tenía avatar, la URL anterior se reemplaza (la imagen antigua se elimina de Cloudinary).
- El perfil actualizado con la nueva `avatar_url` se retorna en la respuesta.
- La caché del perfil se invalida tras la subida.

---

### HU-PROFILE-04: Eliminar mi avatar

**Como** usuario autenticado,  
**quiero** quitar mi foto de perfil,  
**para** dejar mi perfil sin imagen (usando el avatar por defecto de la plataforma).

**Criterios de aceptación**:
- Al eliminar el avatar, el campo `avatar_url` se establece en `null`.
- La imagen se elimina de Cloudinary para no acumular recursos sin uso.
- Si el usuario no tiene avatar, el sistema lo indica con un error apropiado.
- La caché del perfil se invalida tras la eliminación.

---

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-PROFILE-01 | El campo `password_hash` **nunca** se retorna en ninguna respuesta de perfil. El mapper de usuarios lo excluye siempre. |
| RN-PROFILE-02 | El email no puede modificarse a través del endpoint de actualización de perfil. Requeriría un flujo independiente de verificación. |
| RN-PROFILE-03 | El username debe ser único globalmente. Si se intenta actualizar a uno ya existente, se retorna `409 Conflict`. |
| RN-PROFILE-04 | El username no puede contener espacios ni caracteres especiales excepto guión bajo (`_`) y guión (`-`). Longitud: 3-50 caracteres. |
| RN-PROFILE-05 | La bio tiene un máximo de 160 caracteres. |
| RN-PROFILE-06 | El avatar se almacena en Cloudinary. El sistema guarda únicamente la URL pública resultante, no el archivo en la BD. |
| RN-PROFILE-07 | Al reemplazar un avatar, el sistema **debe** eliminar la imagen anterior de Cloudinary para liberar espacio. |
| RN-PROFILE-08 | Cualquier mutación del perfil (actualizar datos, subir/eliminar avatar) invalida la caché del perfil privado y del perfil público en Redis. |
| RN-PROFILE-09 | El campo `is_active` sólo puede modificarse por administración interna; el usuario no puede desactivar su propia cuenta desde el perfil. |
| RN-PROFILE-10 | Un usuario inactivo (`is_active = false`) no puede autenticarse ni acceder a sus endpoints de perfil. |

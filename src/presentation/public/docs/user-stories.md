# Public — Historias de Usuario y Reglas de Negocio

> Este documento describe las historias de usuario y las reglas de negocio que rigen el módulo de acceso público al perfil de los usuarios.

---

## Historias de usuario

### HU-PUBLIC-01: Ver el perfil público de un usuario

**Como** visitante (sin cuenta ni sesión),  
**quiero** acceder al perfil de un usuario usando su username en la URL,  
**para** ver sus enlaces y contactarle o seguirle en sus plataformas.

**Criterios de aceptación**:
- La URL del perfil sigue el patrón `/users/:username` (en el frontend) que llama a `/api/public/:username` en el backend.
- El perfil muestra: nombre, apellido, bio, avatar y lista de enlaces activos.
- Los enlaces se muestran ordenados por `display_order` (ascendente).
- Los enlaces con `is_active = false` **no** aparecen en el perfil público.
- Si el username no existe, se muestra una página de error 404.
- La respuesta se sirve desde caché (Redis) para máxima velocidad de carga.

---

### HU-PUBLIC-02: Verificar disponibilidad de username

**Como** visitante que está registrándose  
**o** usuario que quiere cambiar su username,  
**quiero** saber si el username que deseo está disponible antes de intentar usarlo,  
**para** no recibir un error innecesario al enviar el formulario.

**Criterios de aceptación**:
- El endpoint no requiere autenticación (es consultable desde el formulario de registro).
- La verificación es en tiempo real (se puede llamar mientras el usuario escribe).
- Si está disponible, se responde `200` con `available: true`.
- Si está en uso, se responde `409`.

---

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-PUBLIC-01 | El perfil público es de **acceso libre**: no requiere autenticación ni ningún tipo de sesión. |
| RN-PUBLIC-02 | El perfil público **no expone** el `password_hash`, `email` ni tokens internos del usuario. Sólo información pública. |
| RN-PUBLIC-03 | Sólo se muestran los enlaces con `is_active = true`. Los enlaces ocultos son completamente invisibles para los visitantes. |
| RN-PUBLIC-04 | Los enlaces en el perfil público se ordenan por `display_order` de menor a mayor, igual que en el panel privado. |
| RN-PUBLIC-05 | Si el usuario no existe, el sistema retorna `404 Not Found`. No se diferencia entre "usuario no existe" y "usuario inactivo" para evitar enumeración. |
| RN-PUBLIC-06 | El perfil público se cachea en Redis usando el username como clave. Esto evita consultas innecesarias a la BD en perfiles con alta demanda. |
| RN-PUBLIC-07 | La caché del perfil público se invalida automáticamente cuando el usuario: modifica su perfil, cambia su avatar, crea/edita/elimina/reordena un enlace, o cambia la visibilidad de un enlace. |
| RN-PUBLIC-08 | La verificación de disponibilidad de username es **case-insensitive**: `Usuario` y `usuario` se consideran el mismo username. |
| RN-PUBLIC-09 | El endpoint de perfil público puede ser indexado por motores de búsqueda (no tiene headers de `noindex` por defecto). |
| RN-PUBLIC-10 | No existe límite de tasa en el endpoint de perfil público, pero se recomienda aplicar rate limiting en producción para prevenir scraping masivo. |

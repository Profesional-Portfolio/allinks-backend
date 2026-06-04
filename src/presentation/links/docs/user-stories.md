# Links — Historias de Usuario y Reglas de Negocio

> Este documento describe las historias de usuario y las reglas de negocio que rigen el módulo de gestión de enlaces.

---

## Historias de usuario

### HU-LINKS-01: Ver mis enlaces

**Como** usuario autenticado,  
**quiero** ver una lista de todos mis enlaces,  
**para** conocer el estado actual de mi perfil público.

**Criterios de aceptación**:
- La lista muestra todos los enlaces del usuario (activos e inactivos).
- Los enlaces se presentan ordenados por `display_order` de menor a mayor.
- Si el usuario no tiene enlaces, se devuelve una lista vacía.
- La respuesta puede servirse desde caché (Redis) para reducir latencia.

---

### HU-LINKS-02: Crear un enlace

**Como** usuario autenticado,  
**quiero** añadir un nuevo enlace a mi perfil,  
**para** compartirlo con mis visitantes.

**Criterios de aceptación**:
- El usuario proporciona título, URL y plataforma.
- La URL debe ser válida y accesible (formato correcto).
- El nuevo enlace se añade al final de la lista (mayor `display_order` existente + 1).
- El enlace queda activo por defecto.
- La caché de enlaces del usuario se invalida tras la creación.

---

### HU-LINKS-03: Editar un enlace

**Como** usuario autenticado,  
**quiero** modificar el título, URL o plataforma de un enlace existente,  
**para** mantener mi perfil actualizado.

**Criterios de aceptación**:
- El usuario puede actualizar uno o varios campos a la vez.
- Sólo el propietario del enlace puede editarlo.
- Si la URL se modifica, debe seguir siendo válida.
- La caché del usuario se invalida tras la edición.

---

### HU-LINKS-04: Eliminar un enlace

**Como** usuario autenticado,  
**quiero** eliminar un enlace de mi perfil,  
**para** quitarlo de mi página pública de forma permanente.

**Criterios de aceptación**:
- Sólo el propietario del enlace puede eliminarlo.
- La eliminación es permanente (no hay papelera).
- La caché del usuario se invalida tras la eliminación.

---

### HU-LINKS-05: Activar o desactivar un enlace

**Como** usuario autenticado,  
**quiero** ocultar temporalmente un enlace sin eliminarlo,  
**para** controlar qué se muestra en mi página pública en cada momento.

**Criterios de aceptación**:
- El usuario puede alternar la visibilidad de un enlace (`is_active`).
- Los enlaces con `is_active = false` no aparecen en el perfil público.
- Los enlaces inactivos siguen siendo visibles en el panel privado (con indicador visual).
- La caché del usuario y del perfil público se invalidan tras el cambio.

---

### HU-LINKS-06: Reordenar los enlaces

**Como** usuario autenticado,  
**quiero** arrastrar y reordenar mis enlaces,  
**para** controlar el orden en que aparecen en mi página pública.

**Criterios de aceptación**:
- El usuario puede enviar un array de IDs con sus nuevos `display_order`.
- La operación es atómica: todos los enlaces se actualizan o ninguno.
- Sólo se pueden reordenar enlaces que pertenezcan al usuario.
- La caché del usuario y del perfil público se invalidan tras el reordenamiento.

---

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-LINKS-01 | Un enlace siempre pertenece a un usuario. La relación `user_id → User` tiene eliminación en cascada. |
| RN-LINKS-02 | Sólo el propietario de un enlace puede modificarlo o eliminarlo. El sistema verifica la propiedad en el middleware `AuthorizeLinkOwnerMiddleware`. |
| RN-LINKS-03 | La URL de un enlace debe ser una URL válida (protocolo `http://` o `https://` obligatorio). |
| RN-LINKS-04 | El campo `platform` debe corresponder a una plataforma registrada en el catálogo (`Platform`). |
| RN-LINKS-05 | El `display_order` determina el orden de aparición en el perfil público. A menor valor, aparece primero. |
| RN-LINKS-06 | Al crear un enlace, su `display_order` se asigna automáticamente como `max(display_order) + 1` del usuario. |
| RN-LINKS-07 | Las operaciones de reordenamiento en bulk verifican que **todos** los IDs del array pertenezcan al usuario antes de procesar (`AuthorizeBulkLinksMiddleware`). |
| RN-LINKS-08 | Cualquier mutación (crear, actualizar, eliminar, reordenar) invalida la caché de la lista de enlaces del usuario y la del perfil público. |
| RN-LINKS-09 | Los enlaces con `is_active = false` son excluidos automáticamente en las consultas del perfil público (`GetPublicProfileUseCase`). |
| RN-LINKS-10 | Un usuario no tiene límite de enlaces por defecto, pero la plataforma puede imponer uno en el futuro según plan. |

# Auth — Historias de Usuario y Reglas de Negocio

> Este documento describe las historias de usuario y las reglas de negocio que rigen el módulo de autenticación.

---

## Historias de usuario

### HU-AUTH-01: Registro de usuario

**Como** visitante de la plataforma,  
**quiero** crear una cuenta con mi email y contraseña,  
**para** acceder al panel y gestionar mis enlaces.

**Criterios de aceptación**:
- El sistema acepta: email, contraseña, username, nombre, apellido y opcionalmente bio y avatar.
- Al registrarse correctamente, el usuario queda autenticado de inmediato (recibe tokens en cookies).
- Se envía un email de verificación al correo proporcionado.
- El usuario puede acceder al panel aunque su email no esté verificado aún.

---

### HU-AUTH-02: Verificación de email

**Como** usuario recién registrado,  
**quiero** verificar mi dirección de email,  
**para** confirmar la titularidad de mi cuenta.

**Criterios de aceptación**:
- El sistema envía un email con un enlace que contiene un token único de verificación.
- El token tiene vigencia de tiempo limitada.
- Al hacer clic en el enlace, el sistema marca el email como verificado.
- Si el token expiró, el usuario puede solicitar un nuevo email de verificación.

---

### HU-AUTH-03: Reenvío de verificación

**Como** usuario con email sin verificar,  
**quiero** solicitar que me reenvíen el email de verificación,  
**para** poder completar el proceso si perdí el correo original.

**Criterios de aceptación**:
- El usuario puede solicitar el reenvío proporcionando su email.
- Si el email ya está verificado, el sistema informa que no es necesario.
- Si el email no existe, el sistema no revela esta información (por seguridad devuelve siempre 200).

---

### HU-AUTH-04: Inicio de sesión

**Como** usuario registrado,  
**quiero** iniciar sesión con mi email y contraseña,  
**para** acceder a mi panel de gestión de enlaces.

**Criterios de aceptación**:
- El sistema autentica con email + contraseña.
- Al autenticarse, se generan un `accessToken` (corta duración) y un `refreshToken` (larga duración), almacenados en cookies HTTP-only.
- Si las credenciales son incorrectas, el sistema devuelve un error genérico (no revela si el email existe).
- Se actualiza el campo `last_login_at` del usuario.

---

### HU-AUTH-05: Cierre de sesión

**Como** usuario autenticado,  
**quiero** cerrar sesión,  
**para** proteger mi cuenta al alejarme del dispositivo.

**Criterios de aceptación**:
- Al cerrar sesión, los tokens son invalidados en el cache (Redis).
- Las cookies son limpiadas en el navegador.
- Cualquier petición posterior con los tokens invalidados es rechazada.

---

### HU-AUTH-06: Renovación de tokens

**Como** usuario con sesión activa,  
**quiero** que mi sesión se renueve automáticamente,  
**para** no tener que volver a iniciar sesión constantemente.

**Criterios de aceptación**:
- Cuando el `accessToken` expira, el cliente puede usar el `refreshToken` para obtener un nuevo par de tokens.
- Si el `refreshToken` también está expirado o fue invalidado, el usuario debe volver a autenticarse.
- El nuevo par de tokens reemplaza las cookies anteriores.

---

### HU-AUTH-07: Recuperación de contraseña

**Como** usuario que olvidó su contraseña,  
**quiero** recibir un email con instrucciones para restablecerla,  
**para** recuperar el acceso a mi cuenta.

**Criterios de aceptación**:
- El usuario proporciona su email y el sistema envía un email con un token de recuperación.
- Por seguridad, la respuesta es siempre exitosa (no revela si el email existe).
- El token tiene vigencia limitada.
- El flujo está protegido por rate limiting para prevenir abuso.

---

### HU-AUTH-08: Restablecimiento de contraseña

**Como** usuario que solicitó recuperar su contraseña,  
**quiero** establecer una nueva contraseña usando el token del email,  
**para** recuperar el acceso a mi cuenta.

**Criterios de aceptación**:
- El token debe ser válido y no expirado.
- La nueva contraseña y su confirmación deben coincidir.
- La contraseña cumple los requisitos de seguridad (mínimo 8 caracteres, mayúscula, número y símbolo).
- Tras el reset, el token queda marcado como usado y no puede reutilizarse.
- Se envía un email de confirmación del cambio.

---

### HU-AUTH-09: Subida de avatar en registro

**Como** visitante registrándome,  
**quiero** subir una foto de perfil durante el registro,  
**para** personalizar mi cuenta desde el primer momento.

**Criterios de aceptación**:
- El registro acepta un archivo de imagen (jpg, png, webp).
- La imagen se sube a Cloudinary y se almacena la URL pública.
- Si no se sube imagen, el campo `avatar_url` queda en null.

---

## Reglas de negocio

| ID | Regla |
|---|---|
| RN-AUTH-01 | El email debe ser único en el sistema. No se permiten duplicados (case-insensitive). |
| RN-AUTH-02 | El username debe ser único y no puede contener espacios. Longitud: 3-50 caracteres. |
| RN-AUTH-03 | La contraseña se hashea con bcrypt antes de persistirse. Nunca se almacena en texto plano. |
| RN-AUTH-04 | Los tokens JWT se almacenan en cookies HTTP-only. No se exponen en el body ni en headers visibles. |
| RN-AUTH-05 | El `accessToken` tiene una duración corta (ej. 15 minutos). El `refreshToken` tiene duración larga (ej. 7 días). |
| RN-AUTH-06 | Al cerrar sesión, el token de acceso se añade a una blocklist en Redis para invalidarlo antes de su expiración natural. |
| RN-AUTH-07 | Los tokens de verificación de email y reseteo de contraseña se generan con `crypto.randomBytes` y tienen expiración definida. |
| RN-AUTH-08 | Un token de reseteo de contraseña sólo puede usarse una vez. Tras su uso, se marca `used_at` y se rechaza para usos posteriores. |
| RN-AUTH-09 | Los endpoints `/register`, `/login` y `/forgot-password` tienen rate limiting de 10 peticiones por hora por IP. |
| RN-AUTH-10 | La respuesta a `/forgot-password` es siempre 200, independientemente de si el email existe, para evitar enumeración de cuentas. |
| RN-AUTH-11 | Un usuario inactivo (`is_active = false`) no puede iniciar sesión. |
| RN-AUTH-12 | Al crear un nuevo token de verificación (reenvío), cualquier token anterior del usuario queda invalidado. |

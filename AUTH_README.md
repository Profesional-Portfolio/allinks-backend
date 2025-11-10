# Sistema de Autenticación y Autorización

## Arquitectura Desacoplada

Este sistema de autenticación está diseñado siguiendo los principios de **Clean Architecture** y **Dependency Inversion**, lo que permite cambiar fácilmente entre diferentes implementaciones (JWT, sessions, OAuth, etc.) sin afectar la lógica de negocio.

## Estructura del Sistema

### 1. **Domain Layer** (Lógica de Negocio)

#### Interfaces (`src/domain/interfaces/`)
- **`TokenProvider`**: Interfaz agnóstica para gestión de tokens
  - `generateAccessToken()`
  - `generateRefreshToken()`
  - `generateTokenPair()`
  - `verifyAccessToken()`
  - `verifyRefreshToken()`

- **`PasswordHasher`**: Interfaz para hash de contraseñas
  - `hash(password)`
  - `compare(password, hashedPassword)`

#### Use Cases (`src/domain/use-cases/auth/`)
- **`RegisterUserUseCase`**: Registra usuario y genera tokens
- **`LoginUserUseCase`**: Autentica usuario y genera tokens
- **`RefreshTokenUseCase`**: Renueva tokens usando refresh token

### 2. **Infrastructure Layer** (Implementaciones)

#### Adapters (`src/infraestructure/adapters/`)
- **`JwtTokenProviderAdapter`**: Implementación JWT del `TokenProvider`
- **`BcryptPasswordHasherAdapter`**: Implementación Bcrypt del `PasswordHasher`

Estas son las implementaciones **intercambiables**. Para cambiar a otro sistema (ej: sessions), solo creas un nuevo adapter.

### 3. **Presentation Layer** (API)

#### Middleware (`src/presentation/middlewares/`)
- **`AuthMiddleware`**: Middleware de autenticación desacoplado
  - `authenticate()`: Requiere token válido
  - `optionalAuthenticate()`: Token opcional

#### Controller & Routes (`src/presentation/auth/`)
- **POST** `/auth/register` - Registrar usuario (establece cookies)
- **POST** `/auth/login` - Iniciar sesión (establece cookies)
- **POST** `/auth/refresh` - Renovar tokens (actualiza cookies)
- **POST** `/auth/logout` - Cerrar sesión (elimina cookies)
- **GET** `/auth/profile` - Obtener perfil (protegido)

## Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# JWT Configuration
JWT_ACCESS_SECRET=tu-secreto-super-seguro-de-acceso
JWT_REFRESH_SECRET=tu-secreto-super-seguro-de-refresh
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Node Environment
NODE_ENV=development  # o 'production'

# Cookies Configuration (opcional - para subdominios)
# COOKIE_DOMAIN=.yourdomain.com
```

### Configuración de Cookies

Los tokens se almacenan en cookies **httpOnly** con las siguientes características:

- **httpOnly**: `true` - No accesible desde JavaScript del cliente (protección XSS)
- **secure**: `true` en producción - Solo HTTPS
- **sameSite**: `strict` en producción, `lax` en desarrollo - Protección CSRF
- **maxAge**: 15 minutos para access token, 7 días para refresh token
- **domain**: Configurable para compartir entre subdominios

## Uso

### Ejemplo: Registro de Usuario

```typescript
// POST /auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "johndoe",
  "first_name": "John",
  "last_name": "Doe"
}

// Response (los tokens se establecen en cookies httpOnly)
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}

// Cookies establecidas:
// - accessToken (httpOnly, secure en prod, expires en 15m)
// - refreshToken (httpOnly, secure en prod, expires en 7d)
```

### Ejemplo: Login

```typescript
// POST /auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Response (igual que register - tokens en cookies)
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe"
    }
  }
}
```

### Ejemplo: Refresh Token

```typescript
// POST /auth/refresh
// No requiere body - el refresh token se lee automáticamente de las cookies

// Response
{
  "message": "Tokens refreshed successfully"
}

// Cookies actualizadas con nuevos tokens
```

### Ejemplo: Logout

```typescript
// POST /auth/logout

// Response
{
  "message": "Logged out successfully"
}

// Cookies eliminadas
```

### Ejemplo: Ruta Protegida

```typescript
// GET /auth/profile
// No requiere headers - el token se lee automáticamente de las cookies
// (También acepta Authorization header como fallback)

// Response
{
  "data": {
    "userId": "uuid",
    "email": "user@example.com"
  }
}
```

## Proteger Rutas

### Opción 1: Usar middleware en rutas específicas

```typescript
router.get('/protected', authMiddleware.authenticate, controller.protectedMethod);
```

### Opción 2: Proteger todas las rutas de un router

```typescript
router.use(authMiddleware.authenticate);
router.get('/resource1', controller.method1);
router.get('/resource2', controller.method2);
```

### Opción 3: Autenticación opcional

```typescript
router.get('/public-or-private', authMiddleware.optionalAuthenticate, controller.method);
// req.user estará presente si hay token válido, undefined si no
```

## Acceder al Usuario Autenticado

En tus controllers, usa `AuthenticatedRequest`:

```typescript
import { AuthenticatedRequest } from '@/presentation/middlewares';

someMethod = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  const email = req.user?.email;
  // ...
};
```

## Cambiar de JWT a Otro Sistema

Para cambiar a sessions, OAuth, etc:

1. **Crea un nuevo adapter** que implemente `TokenProvider`:
   ```typescript
   export class SessionTokenProvider implements TokenProvider {
     // Implementa los métodos usando sessions
   }
   ```

2. **Reemplaza el adapter en las routes**:
   ```typescript
   // En auth.routes.ts
   const tokenProvider = new SessionTokenProvider(); // En lugar de JwtTokenProviderAdapter
   ```

3. **¡Listo!** No necesitas tocar:
   - Use cases
   - Controller
   - Middleware
   - Domain layer

## Ventajas de Esta Arquitectura

✅ **Desacoplamiento**: El dominio no depende de JWT  
✅ **Testeable**: Fácil mockear interfaces  
✅ **Flexible**: Cambiar implementación sin tocar lógica de negocio  
✅ **Escalable**: Agregar nuevos métodos de auth es simple  
✅ **SOLID**: Sigue principios de diseño sólidos  

## Testing

Ejemplo de test con mock:

```typescript
const mockTokenProvider: TokenProvider = {
  generateAccessToken: jest.fn().mockReturnValue('mock-token'),
  generateRefreshToken: jest.fn().mockReturnValue('mock-refresh'),
  generateTokenPair: jest.fn().mockReturnValue({
    accessToken: 'mock-access',
    refreshToken: 'mock-refresh'
  }),
  verifyAccessToken: jest.fn().mockReturnValue({ userId: '123', email: 'test@test.com' }),
  verifyRefreshToken: jest.fn().mockReturnValue({ userId: '123', email: 'test@test.com' })
};

const loginUseCase = new LoginUserUseCase(mockRepository, mockTokenProvider);
```

## Próximos Pasos Sugeridos

1. ✅ Implementar rate limiting con Arcjet (ya configurado)
2. 🔄 Agregar blacklist de tokens (para logout)
3. 🔄 Implementar verificación de email
4. 🔄 Agregar recuperación de contraseña
5. 🔄 Implementar OAuth providers (Google, GitHub)
6. 🔄 Agregar 2FA (Two-Factor Authentication)

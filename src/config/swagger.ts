import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    components: {
      securitySchemes: {
        // auth controller set access and refresh token in cookies
        cookieAccessToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'accessToken',
        },
        cookieRefreshToken: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'refreshToken',
        },
      },
    },
    security: [
      {
        cookieAccessToken: [],
        cookieRefreshToken: [],
      },
    ],
    info: {
      title: 'AllLinks API documentation',
      description: 'API documentation for AllLinks',
      version: '1.0.0',
    },
    tags: [
      {
        name: 'Auth',
        description: 'Authentication endpoints',
      },
      {
        name: 'Links',
        description: 'Links endpoints',
      },
      {
        name: 'Profile',
        description: 'Profile endpoints',
      },
      {
        name: 'Public',
        description: 'Public endpoints',
      },
    ],
  },
  apis: [
    './src/presentation/auth/auth.routes.ts',
    './src/presentation/links/links.routes.ts',
    './src/presentation/profile/profile.routes.ts',
    './src/presentation/public/public.routes.ts',
  ],
};

export const swaggerSpec = swaggerJSDoc(options);

import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  apis: [
    './src/presentation/auth/auth.routes.ts',
    './src/presentation/links/links.routes.ts',
    './src/presentation/profile/profile.routes.ts',
    './src/presentation/public/public.routes.ts',
  ],
  swaggerDefinition: {
    components: {
      securitySchemes: {
        // auth controller set access and refresh token in cookies
        cookieAccessToken: {
          bearerFormat: 'JWT',
          name: 'accessToken',
          scheme: 'bearer',
          type: 'http',
        },
        cookieRefreshToken: {
          bearerFormat: 'JWT',
          name: 'refreshToken',
          scheme: 'bearer',
          type: 'http',
        },
      },
    },
    info: {
      description: 'API documentation for AllLinks',
      title: 'AllLinks API documentation',
      version: '1.0.0',
    },
    openapi: '3.0.0',
    security: [
      {
        cookieAccessToken: [],
        cookieRefreshToken: [],
      },
    ],
    tags: [
      {
        description: 'Authentication endpoints',
        name: 'Auth',
      },
      {
        description: 'Links endpoints',
        name: 'Links',
      },
      {
        description: 'Profile endpoints',
        name: 'Profile',
      },
      {
        description: 'Public endpoints',
        name: 'Public',
      },
    ],
  },
};

export const swaggerSpec = swaggerJSDoc(options);

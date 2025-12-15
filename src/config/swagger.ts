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
    ],
  },
  apis: ['./src/presentation/auth/auth.routes.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);

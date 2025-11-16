import swaggerJSDoc from 'swagger-jsdoc';

const options: swaggerJSDoc.Options = {
  swaggerDefinition: {
    openapi: '3.0.0',
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

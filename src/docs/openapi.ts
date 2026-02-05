export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Campus Marketplace API',
    version: '1.0.0',
    description: 'Authentication and seller onboarding API for Campus Marketplace.',
  },
  servers: [{ url: 'http://localhost:3000' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      TelegramLoginRequest: {
        type: 'object',
        required: ['telegram_username'],
        properties: {
          telegram_username: { type: 'string', example: 'campus_user' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              username: { type: 'string' },
              role: { type: 'string' },
              sellerStatus: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
      SellerRequest: {
        type: 'object',
        required: ['shopName', 'categories', 'mainPhone', 'idImage', 'agreedToRules'],
        properties: {
          shopName: { type: 'string', example: 'Campus Tech Store' },
          campusLocation: { type: 'string', example: 'North Campus' },
          categories: { type: 'array', items: { type: 'string' } },
          mainPhone: { type: 'string', example: '+233555555' },
          secondaryPhone: { type: 'string' },
          idImage: { type: 'string', example: 'https://cdn.example.com/id.png' },
          agreedToRules: { type: 'boolean', example: true },
        },
      },
      SellerRequestResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          sellerStatus: { type: 'string' },
        },
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          status: { type: 'string' },
          statusCode: { type: 'number' },
          message: { type: 'string' },
          requestId: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { ok: { type: 'boolean' } },
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Login or signup using Telegram username',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TelegramLoginRequest' },
            },
          },
        },
        responses: {
          200: {
            description: 'Authenticated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' },
              },
            },
          },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          403: { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/me': {
      get: {
        summary: 'Get current user info',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User info returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/seller-request': {
      post: {
        summary: 'Submit seller request',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SellerRequest' },
            },
          },
        },
        responses: {
          201: {
            description: 'Seller request submitted',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SellerRequestResponse' },
              },
            },
          },
          400: { description: 'Validation error' },
          409: { description: 'Conflict' },
        },
      },
    },
    '/admin/seller-requests/{userId}/approve': {
      post: {
        summary: 'Approve seller request',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Seller request approved' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          409: { description: 'Conflict' },
        },
      },
    },
    '/admin/seller-requests/{userId}/reject': {
      post: {
        summary: 'Reject seller request',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'userId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Seller request rejected' },
          401: { description: 'Unauthorized' },
          403: { description: 'Forbidden' },
          409: { description: 'Conflict' },
        },
      },
    },
  },
};

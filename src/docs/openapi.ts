export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Campus Marketplace API',
    version: '1.0.0',
    description: 'Campus Marketplace backend API.',
  },
  servers: [{ url: 'https://backend-ikou.onrender.com' }],
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
        required: ['telegram_username', 'telegram_id', 'telegram_chat_id'],
        properties: {
          telegram_username: { type: 'string', example: 'campus_user' },
          telegram_id: { type: 'string', example: '123456789' },
          telegram_chat_id: { type: 'string', example: '123456789' },
        },
      },
      TelegramInitDataRequest: {
        type: 'object',
        required: ['initData'],
        properties: {
          initData: { type: 'string', example: 'query_id=AAHdF6IQAAAAAN0XohDhrOrc&user=%7B%22id%22%3A123456789%7D&auth_date=1710000000&hash=...' },
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
              telegram_id: { type: 'string' },
              username: { type: 'string' },
              role: { type: 'string' },
              telegramChatId: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
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
      CategoryCreateRequest: {
        type: 'object',
        required: ['name'],
        properties: {
          name: { type: 'string', example: 'Electronics' },
        },
      },
      SellerRequestForm: {
        type: 'object',
        required: ['shopName', 'discription', 'campusLocation', 'mainPhone', 'agreedToRules', 'categoryId', 'image', 'profileImage'],
        properties: {
          shopName: { type: 'string', example: 'Campus Tech Store' },
          discription: { type: 'string', example: 'Quality gadgets and accessories' },
          campusLocation: { type: 'string', example: 'block-12' },
          mainPhone: { type: 'string', example: '+233555555' },
          secondaryPhone: { type: 'string' },
          categoryId: { type: 'string', example: 'uuid' },
          agreedToRules: { type: 'string', enum: ['1'], example: '1' },
          instagram: { type: 'string' },
          telegram: { type: 'string' },
          tiktok: { type: 'string' },
          other: { type: 'string' },
          image: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
            description: 'Two images (front/back ID)'
          },
          profileImage: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
            description: 'One profile image'
          },
        },
      },
      SellerProfileUpdateRequest: {
        type: 'object',
        properties: {
          shopName: { type: 'string', example: 'Campus Tech Store' },
          discription: { type: 'string', example: 'Updated shop bio' },
          campusLocation: { type: 'string', example: 'block-12' },
          mainPhone: { type: 'string', example: '+233555555' },
          secondaryPhone: { type: 'string' },
          categoryId: { type: 'string', example: 'uuid' },
          agreedToRules: { oneOf: [{ type: 'string', example: '1' }, { type: 'boolean', example: true }] },
          instagram: { type: 'string' },
          telegram: { type: 'string' },
          tiktok: { type: 'string' },
          other: {
            oneOf: [
              { type: 'string', example: 'snapchat' },
              { type: 'array', items: { type: 'string' }, example: ['snapchat', 'website'] },
            ],
          },
        },
      },
      ProductCreateForm: {
        type: 'object',
        required: ['name', 'description', 'price', 'categoryId', 'image'],
        properties: {
          name: { type: 'string', example: 'Bluetooth Headphones' },
          description: { type: 'string', example: 'Noise cancelling' },
          price: { type: 'string', example: '120' },
          categoryId: { type: 'string', example: 'uuid' },
          image: {
            type: 'array',
            items: { type: 'string', format: 'binary' },
            description: 'Up to 5 images'
          },
        },
      },
      ProductActiveStatusRequest: {
        type: 'object',
        required: ['isActive'],
        properties: {
          isActive: { type: 'boolean', example: true },
        },
      },
      ReviewRequest: {
        type: 'object',
        required: ['rating'],
        properties: {
          rating: { type: 'number', example: 5 },
          comment: { type: 'string', example: 'Great product' },
        },
      },
      ReportRequest: {
        type: 'object',
        required: ['reason'],
        properties: {
          reason: {
            type: 'string',
            enum: [
              'Inappropriate Content',
              'Spam or Scam',
              'Harassment or Bullying',
              'Intellectual Property Violation',
              'Other'
            ],
          },
        },
      },
      SaveProductRequest: {
        type: 'object',
        required: ['shopId', 'productId'],
        properties: {
          shopId: { type: 'string', example: 'uuid' },
          productId: { type: 'string', example: 'uuid' },
        },
      },
      UnsaveProductRequest: {
        type: 'object',
        required: ['productId'],
        properties: {
          productId: { type: 'string', example: 'uuid' },
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
    '/auth/telegram': {
      post: {
        summary: 'Login using Telegram Web App init data',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/TelegramInitDataRequest' },
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
          401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
        },
      },
    },
    '/api/me': {
      get: {
        summary: 'Get current user info',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User info returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/seller-request': {
      post: {
        summary: 'Submit seller request',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/SellerRequestForm' },
            },
          },
        },
        responses: {
          201: { description: 'Seller request submitted' },
          400: { description: 'Validation error' },
          409: { description: 'Conflict' },
        },
      },
    },
    '/api/seller-profile': {
      get: {
        summary: 'Get seller profile',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Seller profile returned' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
      patch: {
        summary: 'Update seller profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SellerProfileUpdateRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Seller profile updated' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/shop/{shopId}': {
      get: {
        summary: 'Get shop profile',
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Shop profile returned' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/categories': {
      post: {
        summary: 'Create category',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CategoryCreateRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Category created' },
          400: { description: 'Validation error' },
        },
      },
      get: {
        summary: 'Get categories',
        responses: {
          200: { description: 'Categories returned' },
        },
      },
    },
    '/api/categories/{id}': {
      delete: {
        summary: 'Delete category',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          204: { description: 'Category deleted' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/products/{shopId}': {
      post: {
        summary: 'Create product',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { $ref: '#/components/schemas/ProductCreateForm' },
            },
          },
        },
        responses: {
          201: { description: 'Product created' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/products/{categoryId}': {
      get: {
        summary: 'Get products by category',
        parameters: [
          { name: 'categoryId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'string', example: '1' } },
          { name: 'limit', in: 'query', schema: { type: 'string', example: '20' } },
        ],
        responses: {
          200: { description: 'Products returned' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/products/details/{id}': {
      get: {
        summary: 'Get product details',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Product details returned' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/products/{id}': {
      delete: {
        summary: 'Delete product',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Product deleted' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/products/{productId}': {
      put: {
        summary: 'Update product active status',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductActiveStatusRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Product status updated' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/follow/{shopId}': {
      post: {
        summary: 'Follow or unfollow shop',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Follow status updated' },
        },
      },
      get: {
        summary: 'Get shop followers (seller)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Followers returned' },
        },
      },
    },
    '/api/report/{shopId}': {
      post: {
        summary: 'Create report for shop',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReportRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Report created' },
        },
      },
      get: {
        summary: 'Get reports for shop (seller)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Reports returned' },
        },
      },
    },
    '/api/save_product/': {
      post: {
        summary: 'Save product',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SaveProductRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Product saved' },
        },
      },
      get: {
        summary: 'Get saved products',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Saved products returned' },
        },
      },
      delete: {
        summary: 'Unsave product',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UnsaveProductRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Product unsaved' },
        },
      },
    },
    '/api/review/{shopId}/{productId}': {
      post: {
        summary: 'Create review',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ReviewRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Review created' },
        },
      },
    },
    '/api/review/{productId}': {
      get: {
        summary: 'Get reviews by product',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'string', example: '1' } },
          { name: 'limit', in: 'query', schema: { type: 'string', example: '10' } },
        ],
        responses: {
          200: { description: 'Reviews returned' },
        },
      },
    },
    '/api/review/{shopId}': {
      get: {
        summary: 'Get reviews by shop (seller)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'string', example: '1' } },
          { name: 'limit', in: 'query', schema: { type: 'string', example: '10' } },
        ],
        responses: {
          200: { description: 'Reviews returned' },
        },
      },
    },
    '/api/products/shop/{shopId}': {
      get: {
        summary: 'Get products by shop (seller)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
          { name: 'page', in: 'query', schema: { type: 'string', example: '1' } },
          { name: 'limit', in: 'query', schema: { type: 'string', example: '20' } },
        ],
        responses: {
          200: { description: 'Products returned' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/engagement/{shopId}/view': {
      post: {
        summary: 'Track shop view',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'View tracked successfully' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/engagement/{shopId}/social-media-click': {
      post: {
        summary: 'Track shop social media click',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Social media click tracked successfully' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/engagement/{shopId}/contact-click': {
      post: {
        summary: 'Track shop contact click',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'Contact click tracked successfully' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
    },
    '/api/engagement/{shopId}/statistics': {
      get: {
        summary: 'Get shop engagement statistics',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'shopId', in: 'path', required: true, schema: { type: 'string' } },
          {
            name: 'timeFrame',
            in: 'query',
            required: false,
            schema: { type: 'string', enum: ['day', 'week', 'month', 'year'], example: 'day' },
          },
        ],
        responses: {
          200: { description: 'Statistics returned' },
          400: { description: 'Validation error' },
          401: { description: 'Unauthorized' },
          404: { description: 'Not found' },
        },
      },
    },
  },
};

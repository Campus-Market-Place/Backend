export declare const openApiSpec: {
    openapi: string;
    info: {
        title: string;
        version: string;
        description: string;
    };
    servers: {
        url: string;
    }[];
    components: {
        securitySchemes: {
            bearerAuth: {
                type: string;
                scheme: string;
                bearerFormat: string;
            };
        };
        schemas: {
            TelegramLoginRequest: {
                type: string;
                required: string[];
                properties: {
                    telegram_username: {
                        type: string;
                        example: string;
                    };
                    telegram_id: {
                        type: string;
                        example: string;
                    };
                    telegram_chat_id: {
                        type: string;
                        example: string;
                    };
                };
            };
            TelegramInitDataRequest: {
                type: string;
                required: string[];
                properties: {
                    initData: {
                        type: string;
                        example: string;
                    };
                };
            };
            AuthResponse: {
                type: string;
                properties: {
                    token: {
                        type: string;
                    };
                    user: {
                        type: string;
                        properties: {
                            id: {
                                type: string;
                            };
                            telegram_id: {
                                type: string;
                            };
                            username: {
                                type: string;
                            };
                            role: {
                                type: string;
                            };
                            telegramChatId: {
                                type: string;
                            };
                            createdAt: {
                                type: string;
                                format: string;
                            };
                            updatedAt: {
                                type: string;
                                format: string;
                            };
                        };
                    };
                };
            };
            ErrorResponse: {
                type: string;
                properties: {
                    status: {
                        type: string;
                    };
                    statusCode: {
                        type: string;
                    };
                    message: {
                        type: string;
                    };
                    requestId: {
                        type: string;
                    };
                };
            };
            CategoryCreateRequest: {
                type: string;
                required: string[];
                properties: {
                    name: {
                        type: string;
                        example: string;
                    };
                };
            };
            SellerRequestForm: {
                type: string;
                required: string[];
                properties: {
                    shopName: {
                        type: string;
                        example: string;
                    };
                    discription: {
                        type: string;
                        example: string;
                    };
                    campusLocation: {
                        type: string;
                        example: string;
                    };
                    mainPhone: {
                        type: string;
                        example: string;
                    };
                    secondaryPhone: {
                        type: string;
                    };
                    categoryId: {
                        type: string;
                        example: string;
                    };
                    agreedToRules: {
                        type: string;
                        enum: string[];
                        example: string;
                    };
                    instagram: {
                        type: string;
                    };
                    telegram: {
                        type: string;
                    };
                    tiktok: {
                        type: string;
                    };
                    other: {
                        type: string;
                    };
                    image: {
                        type: string;
                        items: {
                            type: string;
                            format: string;
                        };
                        description: string;
                    };
                    profileImage: {
                        type: string;
                        items: {
                            type: string;
                            format: string;
                        };
                        description: string;
                    };
                };
            };
            SellerProfileUpdateRequest: {
                type: string;
                properties: {
                    shopName: {
                        type: string;
                        example: string;
                    };
                    discription: {
                        type: string;
                        example: string;
                    };
                    campusLocation: {
                        type: string;
                        example: string;
                    };
                    mainPhone: {
                        type: string;
                        example: string;
                    };
                    secondaryPhone: {
                        type: string;
                    };
                    categoryId: {
                        type: string;
                        example: string;
                    };
                    agreedToRules: {
                        oneOf: ({
                            type: string;
                            example: string;
                        } | {
                            type: string;
                            example: boolean;
                        })[];
                    };
                    instagram: {
                        type: string;
                    };
                    telegram: {
                        type: string;
                    };
                    tiktok: {
                        type: string;
                    };
                    other: {
                        oneOf: ({
                            type: string;
                            example: string;
                            items?: never;
                        } | {
                            type: string;
                            items: {
                                type: string;
                            };
                            example: string[];
                        })[];
                    };
                };
            };
            ProductCreateForm: {
                type: string;
                required: string[];
                properties: {
                    name: {
                        type: string;
                        example: string;
                    };
                    description: {
                        type: string;
                        example: string;
                    };
                    price: {
                        type: string;
                        example: string;
                    };
                    categoryId: {
                        type: string;
                        example: string;
                    };
                    image: {
                        type: string;
                        items: {
                            type: string;
                            format: string;
                        };
                        description: string;
                    };
                };
            };
            ProductActiveStatusRequest: {
                type: string;
                required: string[];
                properties: {
                    isActive: {
                        type: string;
                        example: boolean;
                    };
                };
            };
            ReviewRequest: {
                type: string;
                required: string[];
                properties: {
                    rating: {
                        type: string;
                        example: number;
                    };
                    comment: {
                        type: string;
                        example: string;
                    };
                };
            };
            ReportRequest: {
                type: string;
                required: string[];
                properties: {
                    reason: {
                        type: string;
                        enum: string[];
                    };
                };
            };
            SaveProductRequest: {
                type: string;
                required: string[];
                properties: {
                    shopId: {
                        type: string;
                        example: string;
                    };
                    productId: {
                        type: string;
                        example: string;
                    };
                };
            };
            UnsaveProductRequest: {
                type: string;
                required: string[];
                properties: {
                    productId: {
                        type: string;
                        example: string;
                    };
                };
            };
            AppealRequest: {
                type: string;
                required: string[];
                properties: {
                    reason: {
                        type: string;
                        example: string;
                    };
                };
            };
            HandleAppealRequest: {
                type: string;
                required: string[];
                properties: {
                    action: {
                        type: string;
                        enum: string[];
                        example: string;
                    };
                };
            };
        };
    };
    paths: {
        '/health': {
            get: {
                summary: string;
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    type: string;
                                    properties: {
                                        ok: {
                                            type: string;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        '/auth/login': {
            post: {
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    400: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    403: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/auth/telegram': {
            post: {
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    400: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                    401: {
                        description: string;
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: string;
                                };
                            };
                        };
                    };
                };
            };
        };
        '/api/me': {
            get: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                };
            };
        };
        '/api/seller-request': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'multipart/form-data': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                    };
                    400: {
                        description: string;
                    };
                    409: {
                        description: string;
                    };
                };
            };
        };
        '/api/seller-profile': {
            get: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
            patch: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                    };
                    400: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/shop/{shopId}': {
            get: {
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/categories': {
            post: {
                summary: string;
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                    };
                    400: {
                        description: string;
                    };
                };
            };
            get: {
                summary: string;
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/categories/{id}': {
            delete: {
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    204: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/products/{shopId}': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'multipart/form-data': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                    };
                    400: {
                        description: string;
                    };
                };
            };
        };
        '/api/products/{categoryId}': {
            get: {
                summary: string;
                parameters: ({
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        example?: never;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        example: string;
                    };
                    required?: never;
                })[];
                responses: {
                    200: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/products/details/{id}': {
            get: {
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/products/search': {
            get: {
                summary: string;
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                    description: string;
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                    409: {
                        description: string;
                    };
                };
            };
        };
        '/api/products/{id}': {
            delete: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/products/{productId}': {
            put: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                    };
                    400: {
                        description: string;
                    };
                };
            };
        };
        '/api/follow/{shopId}': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
            get: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/report/{shopId}': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                    };
                };
            };
            get: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/report/appeal/{shopId}': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                    };
                    400: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/report/appeal/{id}/handle': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                    };
                    400: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/save_product/': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
            get: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
            delete: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/review/{shopId}/{productId}': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                requestBody: {
                    required: boolean;
                    content: {
                        'application/json': {
                            schema: {
                                $ref: string;
                            };
                        };
                    };
                };
                responses: {
                    201: {
                        description: string;
                    };
                };
            };
        };
        '/api/review/{productId}': {
            get: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: ({
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        example?: never;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        example: string;
                    };
                    required?: never;
                })[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/review/{shopId}': {
            get: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: ({
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        example?: never;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        example: string;
                    };
                    required?: never;
                })[];
                responses: {
                    200: {
                        description: string;
                    };
                };
            };
        };
        '/api/products/shop/{shopId}': {
            get: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: ({
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        example?: never;
                    };
                } | {
                    name: string;
                    in: string;
                    schema: {
                        type: string;
                        example: string;
                    };
                    required?: never;
                })[];
                responses: {
                    200: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/engagement/{shopId}/view': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/engagement/{shopId}/social-media-click': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/engagement/{shopId}/contact-click': {
            post: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                    };
                }[];
                responses: {
                    200: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
        '/api/engagement/{shopId}/statistics': {
            get: {
                summary: string;
                security: {
                    bearerAuth: never[];
                }[];
                parameters: ({
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        enum?: never;
                        example?: never;
                    };
                } | {
                    name: string;
                    in: string;
                    required: boolean;
                    schema: {
                        type: string;
                        enum: string[];
                        example: string;
                    };
                })[];
                responses: {
                    200: {
                        description: string;
                    };
                    400: {
                        description: string;
                    };
                    401: {
                        description: string;
                    };
                    404: {
                        description: string;
                    };
                };
            };
        };
    };
};
//# sourceMappingURL=openapi.d.ts.map
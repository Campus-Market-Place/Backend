# Campus Marketplace Backend

> Professional backend for a campus marketplace project.

---

## **Table of Contents**
- [Campus Marketplace Backend](#campus-marketplace-backend)
  - [**Table of Contents**](#table-of-contents)
  - [**Project Overview**](#project-overview)
  - [**Tech Stack**](#tech-stack)
  - [**Getting Started**](#getting-started)
    - [**Prerequisites**](#prerequisites)
    - [**Installation**](#installation)
  - [**API Endpoints**](#api-endpoints)
  - [**Database Schema**](#database-schema)
  - [**Features**](#features)
  - [**Contributing**](#contributing)
  - [**License**](#license)

---

## **Project Overview**
This project provides a robust backend solution for a campus marketplace with Telegram-based authentication, role-based access, and seller onboarding workflows.

## **Tech Stack**
- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL
- Zod
- JWT
- Swagger/OpenAPI

## **Getting Started**
To get a local copy up and running follow these simple steps.

### **Prerequisites**
- Node.js installed
- PostgreSQL installed

### **Installation**
1. Clone the repo
   ```bash
   git clone https://github.com/Campus-Market-Place/Backend.git
   ```
2. Install NPM packages
   ```bash
   npm install
   ```
3. Set up your database and update the `.env` file with your database credentials.

### **Environment Variables**
Create a `.env` file with the following values:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB
JWT_SECRET=change-me
JWT_EXPIRES_IN=7d
ADMIN_USERNAMES=admin_username_1,admin_username_2
```

### **Database Setup**
Generate the Prisma client and run migrations:

```bash
npm run prisma:generate
npm run prisma:migrate
```

## **API Endpoints**
- `POST /auth/login` - Login or signup with Telegram username
- `GET /me` - Current user info
- `POST /seller-request` - Submit seller request
- `POST /admin/seller-requests/:userId/approve` - Approve seller request
- `POST /admin/seller-requests/:userId/reject` - Reject seller request
- `GET /health` - Health check
- `GET /docs` - Swagger/OpenAPI docs

## **Database Schema**
Refer to the `schema.prisma` file for the database schema.

## **Architecture Overview**
- **Controllers** handle business logic
- **Middleware** provides auth, validation, and request logging
- **Prisma** manages database access
- **Swagger/OpenAPI** documents the public API

## **Features**
- Telegram-based authentication (username only)
- Role-based access control (user/seller)
- Seller request workflow with admin approval
- JWT-protected endpoints
- Zod validation
- Structured logging with request IDs
- Swagger/OpenAPI documentation
- Soft deletes and timestamps

## **Contributing**
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**!

## **License**
Distributed under the MIT License. See `LICENSE` for more information.


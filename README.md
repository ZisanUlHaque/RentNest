# 🏠 RentNest Backend

<p align="center">
  <h3 align="center">Find & List Rental Properties with Ease</h3>
  <p align="center">
    A robust RESTful Backend API for a Rental Property Marketplace built with Express, TypeScript, Prisma, PostgreSQL, and Stripe.
  </p>
</p>

---

![Node.js](https://img.shields.io/badge/Node.js-20.x-green)
![Express](https://img.shields.io/badge/Express-5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF)
![License](https://img.shields.io/badge/License-MIT-success)

---

# 📌 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [System Architecture](#-system-architecture)
- [Database Design](#-database-design)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Roles & Permissions](#-roles--permissions)
- [API Endpoints](#-api-endpoints)
- [Payment Flow](#-payment-flow)
- [Rental Flow](#-rental-request-flow)
- [Project Structure](#-project-structure)
- [Security](#-security)
- [Future Improvements](#-future-improvements)
- [License](#-license)

---

# 📖 Overview

RentNest is a modern rental property marketplace backend where:

- 🏠 Landlords can publish rental properties.
- 👤 Tenants can browse and request rentals.
- 💳 Payments are securely processed using Stripe Checkout.
- ⭐ Tenants can review completed rentals.
- 🛡️ Admins manage the whole platform.

The API follows a modular architecture with authentication, authorization, validation, and clean separation of concerns.

---

# ✨ Features

## 🌍 Public

- Browse all available properties
- View property details
- Search properties
- Filter by
  - Category
  - Location
  - Bedrooms
  - Price
- Read property reviews

---

## 👤 Tenant

- Register/Login
- JWT Authentication
- Browse listings
- Submit rental requests
- Track request status
- Pay securely using Stripe
- Payment history
- Leave reviews
- Update profile

---

## 🏠 Landlord

- Register/Login
- Create property listings
- Update properties
- Delete properties
- View rental requests
- Approve requests
- Reject requests
- Manage own listings
- View tenant reviews

---

## 🛡️ Admin

- Manage users
- Ban/Unban users
- Manage categories
- View every property
- View all rental requests
- Monitor platform activity

---

# 🛠 Tech Stack

| Area | Technology |
|------|------------|
| Runtime | Node.js |
| Language | TypeScript |
| Framework | Express.js |
| ORM | Prisma ORM |
| Database | PostgreSQL |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Validation | Zod |
| Payment | Stripe Checkout |
| Deployment | Render / Vercel |

---

# 🏗 System Architecture

```
Client
   │
   ▼
Express API
   │
Authentication Middleware
   │
Controllers
   │
Services
   │
Prisma ORM
   │
PostgreSQL
```

---

# 🗄 Database Design

> Replace the image below with your DrawSQL diagram.

```md
![Database Diagram](./database-diagram.png)
```

### Core Tables

| Table | Description |
|-------|-------------|
| Users | Application users |
| Categories | Property categories |
| Properties | Rental listings |
| RentalRequests | Rental requests |
| Payments | Stripe payments |
| Reviews | Property reviews |

---

## Enums

### Role

```
ADMIN
LANDLORD
TENANT
```

### User Status

```
ACTIVE
BANNED
```

### Property Status

```
AVAILABLE
PENDING
RENTED
```

### Rental Status

```
PENDING
APPROVED
REJECTED
PAYMENT_PENDING
ACTIVE
COMPLETED
```

### Payment Status

```
PENDING
COMPLETED
FAILED
```

---

# 🚀 Getting Started

## Prerequisites

- Node.js 18+
- PostgreSQL
- Stripe Account
- Stripe CLI

---

## Clone Repository

```bash
git clone https://github.com/your-username/rentnest-backend.git

cd rentnest-backend
```

---

## Install Dependencies

```bash
npm install
```

---

## Setup Environment Variables

```bash
cp .env.example .env
```

---

## Run Prisma Migration

```bash
npx prisma migrate dev
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Seed Database (Optional)

```bash
npx prisma db seed
```

---

## Start Development Server

```bash
npm run dev
```

---

# 🔐 Environment Variables

```env
PORT=5000

NODE_ENV=development

DATABASE_URL=

JWT_ACCESS_SECRET=

JWT_ACCESS_EXPIRES_IN=7d

JWT_REFRESH_SECRET=

JWT_REFRESH_EXPIRES_IN=30d

BCRYPT_SALT_ROUNDS=10

STRIPE_SECRET_KEY=

STRIPE_WEBHOOK_SECRET=

CLIENT_URL=http://localhost:3000
```

---

# 👥 Roles & Permissions

| Feature | Public | Tenant | Landlord | Admin |
|---------|:------:|:------:|:---------:|:-----:|
| Browse Properties | ✅ | ✅ | ✅ | ✅ |
| View Property | ✅ | ✅ | ✅ | ✅ |
| Register | ✅ | ✅ | ✅ | ❌ |
| Login | ✅ | ✅ | ✅ | ✅ |
| Rental Request | ❌ | ✅ | ❌ | ✅ |
| Payment | ❌ | ✅ | ❌ | ✅ |
| Leave Review | ❌ | ✅ | ❌ | ✅ |
| Create Property | ❌ | ❌ | ✅ | ✅ |
| Edit Property | ❌ | ❌ | ✅ | ✅ |
| Delete Property | ❌ | ❌ | ✅ | ✅ |
| Approve Request | ❌ | ❌ | ✅ | ✅ |
| Ban Users | ❌ | ❌ | ❌ | ✅ |
| Manage Categories | ❌ | ❌ | ❌ | ✅ |

---

# 📡 API Endpoints

## Authentication

| Method | Endpoint |
|---------|----------|
| POST | /api/v1/auth/login |
| POST | /api/v1/auth/refresh-token |

---

## Users

| Method | Endpoint |
|---------|----------|
| POST | /api/v1/users/register |
| GET | /api/v1/users/me |
| PATCH | /api/v1/users/profile |
| GET | /api/v1/users |
| PATCH | /api/v1/users/:id/status |

---

## Categories

| Method | Endpoint |
|---------|----------|
| POST | /api/v1/categories |
| GET | /api/v1/categories |
| PATCH | /api/v1/categories/:id |
| DELETE | /api/v1/categories/:id |

---

## Properties

| Method | Endpoint |
|---------|----------|
| POST | /api/v1/properties |
| GET | /api/v1/properties |
| GET | /api/v1/properties/:id |
| PATCH | /api/v1/properties/:id |
| DELETE | /api/v1/properties/:id |

---

## Rental Requests

| Method | Endpoint |
|---------|----------|
| POST | /api/v1/rentals |
| GET | /api/v1/rentals |
| PATCH | /api/v1/rentals/:id/status |

---

## Payments

| Method | Endpoint |
|---------|----------|
| POST | /api/v1/payments/create-checkout-session |
| POST | /api/v1/payments/webhook |
| GET | /api/v1/payments/history |

---

## Reviews

| Method | Endpoint |
|---------|----------|
| POST | /api/v1/reviews |
| GET | /api/v1/properties/:id/reviews |

---

# 💳 Payment Flow

```
Tenant

    │

    ▼

Rental Approved

    │

    ▼

Create Stripe Checkout Session

    │

    ▼

Stripe Hosted Checkout

    │

    ▼

Webhook

    │

    ▼

Payment Completed

    │

    ▼

Rental Status = ACTIVE
```

---

# 📊 Rental Request Flow

```
PENDING

     │

     ▼

Landlord Approves

     │

     ▼

PAYMENT_PENDING

     │

     ▼

Stripe Payment

     │

     ▼

ACTIVE

     │

     ▼

COMPLETED
```

---

# 🧭 User Journey

## 👤 Tenant

```
Register

↓

Login

↓

Browse Properties

↓

View Details

↓

Submit Rental Request

↓

Wait for Approval

↓

Stripe Payment

↓

Move In

↓

Leave Review
```

---

## 🏠 Landlord

```
Register

↓

Login

↓

Create Property

↓

Receive Rental Requests

↓

Approve / Reject

↓

Manage Listings

↓

Track Rental History
```

---

# 📂 Project Structure

```
rentnest-backend/

├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── config/
│   ├── lib/
│   ├── middlewares/
│   ├── modules/
│   │
│   ├── auth/
│   ├── user/
│   ├── property/
│   ├── category/
│   ├── rental/
│   ├── payment/
│   └── review/
│
│   ├── utils/
│   ├── app.ts
│   └── server.ts
│
├── generated/
├── .env.example
├── package.json
├── tsconfig.json
├── vercel.json
└── README.md
```

---

# 🔒 Security

- JWT Authentication
- Password Hashing (bcrypt)
- Role-Based Authorization
- Input Validation
- Global Error Handler
- Prisma ORM Protection
- Stripe Webhook Signature Verification
- Environment Variable Protection
- CORS Configuration

---

# 🚀 Future Improvements

- Email Notifications
- Google OAuth
- Image Upload with Cloudinary
- Property Wishlist
- Real-time Chat
- Analytics Dashboard
- Admin Reports
- SSLCommerz Integration
- Docker Support
- CI/CD Pipeline

---

# 👨‍💻 Author

**Jisan Haque**

Software Engineer

---

# 📄 License

This project is licensed under the **MIT License**.

---

## ⭐ Support

If you like this project, don't forget to **⭐ Star the repository** on GitHub.

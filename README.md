# 🏠 RentNest Backend

> **Find & List Rental Properties with Ease**

A robust backend API for a rental property marketplace built with **Express**, **TypeScript**, **Prisma**, and **PostgreSQL**. Landlords list properties, tenants browse and request rentals, payments are processed via **Stripe**, and admins oversee the entire platform.

---

## 📌 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Database Design](#-database-design)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Roles & Permissions](#-roles--permissions)
- [Payment Flow](#-payment-flow-stripe)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## ✨ Features

### Public
- Browse all available rental properties
- Search and filter by location, price, bedrooms, category
- View property details with reviews

### Tenant
- Register and login with role selection
- Submit rental requests for properties
- Make secure payments via **Stripe Checkout**
- View payment history and status
- Leave reviews after completed rentals
- Manage profile

### Landlord
- Create, edit, and remove property listings
- Set property availability status
- Approve or reject rental requests
- View rental history and tenant reviews
- Manage own properties

### Admin
- View and manage all users (ban/unban)
- View all listings and rental requests
- Manage property categories
- Full platform oversight

---

## 🛠️ Tech Stack

| Area | Technology |
|------|------------|
| **Runtime** | Node.js |
| **Language** | TypeScript (Strict mode) |
| **Framework** | Express 5 |
| **ORM** | Prisma |
| **Database** | PostgreSQL |
| **Authentication** | JWT + bcrypt |
| **Payment** | Stripe Checkout |
| **Deployment** | Vercel / Render |

---

## 🗄️ Database Design

<img width="2113" height="1604" alt="drawSQL-image-export-2026-07-09" src="https://github.com/user-attachments/assets/b1b46c98-c86e-4cba-b78d-12758032938c" />


> The database consists of 6 core tables: **Users**, **Categories**, **Properties**, **RentalRequests**, **Payments**, and **Reviews** — all connected through foreign key relationships with proper cascading.

### Table Summary

| Table | Description |
|-------|-------------|
| **Users** | Stores user info, roles (TENANT/LANDLORD/ADMIN), and status |
| **Categories** | Property type categories (Apartment, Studio, House, etc.) |
| **Properties** | Rental property listings linked to landlords |
| **RentalRequests** | Rental requests between tenants and landlords |
| **Payments** | Stripe payment transactions with status tracking |
| **Reviews** | Tenant reviews for completed rentals |

### Key Enums
Role → TENANT | LANDLORD | ADMIN
UserStatus → ACTIVE | BANNED
PropertyStatus → AVAILABLE | PENDING | RENTED
RentalStatus → PENDING | APPROVED | REJECTED | PAYMENT_PENDING | ACTIVE | COMPLETED
PaymentStatus → PENDING | COMPLETED | FAILED


---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [PostgreSQL](https://www.postgresql.org/)
- [Stripe Account](https://stripe.com/) (for payment testing)
- [Stripe CLI](https://stripe.com/docs/stripe-cli) (for webhook testing)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rentnest-backend.git
cd rentnest-backend

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your values

# 4. Run database migrations
pnpm db:migrate

# 5. Generate Prisma client
npm db:generate

# 6. Start development server
npm dev

### Flow Diagrams
##🏠 Tenant Journey
                              ┌──────────────┐
                              │   Register   │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   Browse     │
                              │  Properties  │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │View Property │
                              │   Details    │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   Submit     │
                              │   Request    │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Wait for    │
                              │  Approval    │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  Make Payment│
                              │(Stripe/SSLC) │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │ Leave Review │
                              └──────────────┘
##🏘️ Landlord Journey
                              ┌──────────────┐
                              │   Register   │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   Create     │
                              │  Listings    │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │    View      │
                              │  Requests    │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   Approve/   │
                              │   Reject     │
                              └──────────────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │   Manage     │
                              │  Properties  │
                              └──────────────┘
##📊 Rental Request Status
                              ┌──────────────┐
                              │   PENDING    │
                              └──────────────┘
                               /            \
                              /              \
                       (landlord)       (landlord)
                        approves        rejects
                            /                \
                           ▼                  ▼
                   ┌──────────────┐   ┌──────────────┐
                   │   APPROVED   │   │   REJECTED   │
                   └──────────────┘   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │   PAYMENT    │
                   │  (Stripe/    │
                   │  SSLCommerz) │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │    ACTIVE    │
                   │  (move-in)   │
                   └──────────────┘
                          │
                          ▼
                   ┌──────────────┐
                   │  COMPLETED   │
                   └──────────────┘

                   
## 📁 Project Structure
basafinder-backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Seed data
├── src/
│   ├── app/
│   │   ├── config/             # Configuration
│   │   ├── lib/                # Utilities (Prisma, Stripe)
│   │   ├── middlewares/        # Auth, error handlers
│   │   ├── modules/
│   │   │   ├── auth/           # Authentication
│   │   │   ├── user/           # User management
│   │   │   ├── property/       # Property CRUD
│   │   │   ├── category/       # Categories
│   │   │   ├── rental/         # Rental requests
│   │   │   ├── payment/        # Stripe payments
│   │   │   └── review/         # Reviews
│   │   └── utils/              # Helper functions
│   ├── app.ts                  # Express app
│   └── server.ts               # Entry point
├── generated/
│   └── prisma/                 # Generated Prisma client
├── .env.example                # Env template
├── vercel.json                 # Vercel config
├── tsconfig.json               # TypeScript config
├── package.json
└── README.md

                   

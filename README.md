
# Brighte Eats: Expression of Interest System Backend

## 🍽️ Project Overview

Brighte Eats is a new product line from Brighte, Australia's #1 provider of sustainable upgrade solutions. This repository contains the backend GraphQL API that powers the Expression of Interest (EOI) system and administrative dashboard for the Brighte Eats initiative.

### Business Context

Brighte is expanding beyond home improvement financing into the food sector with "Brighte Eats." This system:
- Captures expressions of interest from potential customers
- Provides tools for lead management and qualification
- Delivers insights to refine the Brighte Eats offering before full launch
- Supports the business team in converting leads into customers

## 🔧 Technology Stack

- **Framework**: [NestJS](https://nestjs.com/) - A progressive Node.js framework
- **API**: [GraphQL](https://graphql.org/) via [@nestjs/apollo](https://docs.nestjs.com/graphql/quick-start) - Flexible API with exactly the data needed
- **Database ORM**: [Prisma](https://www.prisma.io/) - Type-safe database access
- **Validation**: class-validator & class-transformer for input validation
- **Configuration**: @nestjs/config with Joi validation for environment configuration
- **Logging**: Winston with daily-rotate-file for comprehensive logging
- **Testing**: Jest for unit and integration testing

## 🏗️ Project Structure

```
backend-brighte-eats/
├── prisma/                 # Database schema and migrations
│   ├── migrations/         # Database change history
│   │   ├── 20250405004057_create_lead_and_service_interest_table
│   │   └── 20250405013909_add_cascade_delete_on_lead
│   └── schema.prisma       # Prisma schema definition
├── src/
│   ├── leads/              # Leads feature module
│   │   ├── dto/            # Data transfer objects for lead operations
│   │   ├── enums/          # Lead-related enumerations (status, service types)
│   │   ├── models/         # GraphQL and domain models for leads
│   │   ├── repositories/   # Data access repositories
│   │   ├── resolvers/      # GraphQL resolvers for lead operations
│   │   └── services/       # Business logic for lead management
│   ├── shared/             # Shared modules and utilities
│   │   ├── common/         # Common utilities and helpers
│   │   ├── config/         # Application configuration
│   │   ├── logger/         # Logging infrastructure
│   │   ├── prisma/         # Prisma service and utilities
│   │   └── utilities/      # General utility functions
│   ├── app.module.ts       # Main application module
│   ├── main.ts             # Application entry point
│   └── schema.gql          # Generated GraphQL schema
└── test/                   # End-to-end tests
```

## 📦 Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and other settings

# Generate Prisma client
npx prisma generate

# Apply database migrations
npx prisma migrate deploy
```

## 🛠️ Development

```bash
# Start the development server with hot reload
npm run start:dev

# Run linting
npm run lint

# Format code
npm run format
```

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Generate test coverage report
npm run test:cov
```

## 🚀 Deployment

### Requirements
- Node.js 18 or later
- PostgreSQL database
- Environment configured according to `.env.example`

### Production Build
```bash
# Generate production build
npm run build

# Start production server
npm run start:prod
```


## 📋 Business Requirements Implementation

This backend API directly supports the Brighte Eats BRD requirements:

| Business Requirement | Technical Implementation |
|----------------------|--------------------------|
| Customer Interest Capture | GraphQL mutations for EOI submission with data validation |
| Lead Management | Comprehensive lead CRUD operations with filtering and sorting |
| Reporting & Analytics | Aggregation queries for trends, geographic distribution, and service preferences |
| Security & Compliance | Data validation, authorization, and secure storage |
| User Experience | Fast, reliable API responses for both customer and admin interfaces |

## 🤝 Contributing

1. Branch naming convention: `feature/[feature-name]`, `bugfix/[bug-name]`
2. Commit message format: `[type]: [description]` (types: feat, fix, docs, style, refactor, test, chore)
3. Pull requests require reviews and passing tests
4. Follow the existing code style and patterns

## 📚 Additional Documentation

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [GraphQL Documentation](https://graphql.org/learn/)
- [Project Wiki](./wiki) - Internal documentation
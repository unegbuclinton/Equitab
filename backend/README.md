# Equity Ledger Backend

Backend API for the shared investment ledger application.

## Features

- ✅ User authentication with JWT
- ✅ Role-based access control (Admin/User)
- ✅ Contribution management with verification workflow
- ✅ Automatic unit minting on verification
- ✅ Real-time equity calculation
- ✅ Month management with closure system
- ✅ Comprehensive audit logging
- ✅ Type-safe with TypeScript and Prisma

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update `DATABASE_URL` with your PostgreSQL connection string.

3. **Generate Prisma client:**
   ```bash
   npm run prisma:generate
   ```

4. **Run database migrations:**
   ```bash
   npm run prisma:migrate
   ```

5. **Start development server:**
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001/api`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user profile

### Contributions
- `POST /api/contributions` - Create contribution
- `GET /api/contributions` - List all contributions (with filters)
- `GET /api/contributions/:id` - Get single contribution

### Verification (Admin only)
- `GET /api/verification/pending` - Get pending contributions
- `POST /api/verification/:id/verify` - Verify contribution
- `POST /api/verification/:id/reject` - Reject contribution

### Equity
- `GET /api/equity` - Get full equity snapshot
- `GET /api/equity/member/:userId` - Get member equity

### Months (Admin for create/close)
- `POST /api/months` - Create month
- `GET /api/months` - List all months
- `GET /api/months/current` - Get current month
- `GET /api/months/:id` - Get month details
- `PUT /api/months/:id/close` - Close month
- `PUT /api/months/:id/reopen` - Reopen month

## Scripts

- `npm run dev` - Start development server with auto-reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)

## Project Structure

```
src/
├── config/          # Configuration files
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # API routes
├── services/        # Business logic
├── types/           # TypeScript types
└── index.ts         # Application entry point
```

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

Key models:
- **User**: All user accounts
- **Admin**: Admin role assignments
- **Contribution**: Contribution records with verification status
- **Unit**: Ownership units (immutable)
- **Month**: Monthly periods
- **AuditLog**: Audit trail (append-only)
- **GroupConfig**: System configuration

## Security

- JWT-based authentication
- Role-based access control
- Database-level immutability (triggers prevent deletion)
- Audit logging for all critical actions
- Password hashing with bcrypt

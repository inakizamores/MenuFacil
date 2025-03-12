# MenúFácil - Interactive Restaurant Menu Platform

MenúFácil is a comprehensive platform that allows restaurant owners to create, manage, and share digital menus with their customers. The platform includes QR code generation, subscription management, and a user-friendly interface for both restaurant owners and customers.

## Features

- **User Authentication**: Secure login and registration system
- **Restaurant Management**: Create and manage multiple restaurants
- **Menu Creation**: Build interactive digital menus with categories and items
- **QR Code Generation**: Generate QR codes for each menu to share with customers
- **Subscription Management**: Handle restaurant subscriptions with Stripe integration
- **Public Menu View**: Mobile-friendly public menu view for customers
- **Profile Management**: User profile management with avatar upload
- **Dashboard**: Overview of restaurants and subscriptions

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Supabase Auth Helpers

### Backend
- Supabase (PostgreSQL)
- Supabase Auth
- Supabase Storage
- Stripe for payments

## Project Structure

```
MenuFacil/
├── frontend/               # Next.js frontend application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Next.js app router
│   │   │   ├── api/        # API routes
│   │   │   ├── auth/       # Authentication pages
│   │   │   ├── dashboard/  # Dashboard pages
│   │   │   └── menu/       # Public menu pages
│   │   ├── components/     # Reusable React components
│   │   ├── lib/            # Utility functions and API clients
│   │   └── types/          # TypeScript type definitions
│   ├── tailwind.config.js  # Tailwind CSS configuration
│   └── package.json        # Frontend dependencies
├── backend/                # Supabase backend
│   └── supabase/
│       ├── migrations/     # Database migrations
│       ├── functions/      # Supabase Edge Functions
│       └── seed.sql        # Database seed data
├── docs/                   # Documentation
│   ├── api-endpoints.md    # API documentation
│   ├── migrations/         # Migration documentation
│   ├── supabase-deployment.md      # Supabase deployment guide
│   └── supabase-deployment-checklist.md # Deployment checklist
└── scripts/               # Utility scripts
    ├── setup-local-supabase.sh  # Unix/Mac setup script
    └── setup-local-supabase.bat # Windows setup script
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Stripe account (for payment processing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/inakizamores/MenuFacil.git
   cd MenuFacil
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the frontend directory with the following variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. Set up local Supabase for development (optional):
   ```bash
   # For Mac/Linux
   ./scripts/setup-local-supabase.sh
   
   # For Windows
   scripts\setup-local-supabase.bat
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Supabase Deployment

For deploying the backend to Supabase, please refer to the following documents:

1. [Supabase Deployment Guide](docs/supabase-deployment.md) - Step-by-step instructions for deploying to Supabase
2. [Supabase Deployment Checklist](docs/supabase-deployment-checklist.md) - Verify your deployment readiness

The deployment involves:
- Setting up a Supabase project
- Running database migrations
- Configuring storage buckets
- Deploying Edge Functions
- Setting up authentication

### Vercel Deployment

The project is configured for deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set up the environment variables in Vercel
3. Deploy the project

## API Documentation

See [API Endpoints Documentation](docs/api-endpoints.md) for detailed information about the available API endpoints.

## Database Schema

The database schema is defined in the migration files located in `backend/supabase/migrations/`. The initial schema includes tables for:

- Users and profiles
- Restaurants
- Menus
- Categories
- Items
- Item options
- Subscriptions

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Contact

Iñaki Zamores - [GitHub](https://github.com/inakizamores)

Project Link: [https://github.com/inakizamores/MenuFacil](https://github.com/inakizamores/MenuFacil) 
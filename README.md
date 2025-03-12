# MenúFácil - Restaurant Menu Management Platform

MenúFácil is a comprehensive platform that helps restaurant owners create, manage, and share digital menus with their customers. The platform offers a subscription-based model, allowing restaurant owners to showcase their offerings in an attractive, easy-to-update digital format.

## Features

- **User Authentication**: Secure login and registration system using Supabase Auth
- **Restaurant Management**: Create and manage multiple restaurants
- **Menu Creation**: Build beautiful digital menus with categories and items
- **Image Upload**: Upload images for restaurants, menu categories, and items
- **Subscription Management**: Handle restaurant subscriptions using Stripe
- **Responsive Design**: Works on all devices from mobile to desktop
- **Dashboard**: Monitor restaurants and subscriptions from a central dashboard

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **Payment Processing**: Stripe
- **Deployment**: Vercel (Frontend), Supabase (Backend)

## Project Structure

```
MenuFacil/
├── frontend/                  # Next.js application
│   ├── public/                # Static assets
│   ├── src/                   # Source code
│   │   ├── app/               # Next.js app router
│   │   │   ├── api/           # API routes
│   │   │   ├── auth/          # Authentication pages
│   │   │   ├── dashboard/     # Dashboard pages
│   │   │   └── ...            # Other app routes
│   │   ├── components/        # React components
│   │   ├── lib/               # Utility functions and hooks
│   │   └── types/             # TypeScript type definitions
│   ├── scripts/               # Utility scripts
│   └── docs/                  # Documentation
└── backend/                   # Backend code
    └── supabase/              # Supabase configuration
        ├── functions/         # Edge Functions
        └── migrations/        # Database migrations
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase CLI (for local development)
- Stripe CLI (for webhook testing)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/menufacil.git
   cd menufacil
   ```

2. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the frontend directory with the following variables:
   ```
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   
   # Stripe Configuration
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   
   # Application Configuration
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_SUBSCRIPTION_PRICE=9.99
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Set up local Supabase (optional):
   ```bash
   # For Unix/Mac
   ./scripts/setup-local-supabase.sh
   
   # For Windows
   .\scripts\setup-local-supabase.bat
   ```

## Deployment

### Supabase Deployment

For detailed instructions on deploying the backend to Supabase, see [Supabase Deployment Guide](./frontend/docs/supabase-deployment-guide.md).

Quick steps:
1. Create a Supabase project
2. Apply database migrations
3. Configure storage buckets
4. Deploy Edge Functions
5. Set up authentication

### Vercel Deployment

For detailed instructions on deploying the frontend to Vercel, see [Vercel Deployment Guide](./frontend/docs/vercel-deployment-guide-final.md).

Quick steps:
1. Prepare your project using the provided script:
   ```bash
   cd frontend
   node scripts/prepare-for-vercel.js
   ```
2. Deploy to Vercel using Git integration or Vercel CLI
3. Configure environment variables in Vercel dashboard
4. Update Supabase authentication settings with production URL

### Deployment Checklist

Use the [Deployment Checklist](./frontend/docs/deployment-checklist.md) to track your progress during deployment.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Stripe](https://stripe.com/)
- [Vercel](https://vercel.com/)

## Contact

Iñaki Zamores - [GitHub](https://github.com/inakizamores)

Project Link: [https://github.com/inakizamores/MenuFacil](https://github.com/inakizamores/MenuFacil) 
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

### API Keys and Secure Handling

This project requires Supabase API keys to function. For security reasons, these keys are not included in the repository.

1. **Environment Setup**:
   - Copy `frontend/.env.example` to `frontend/.env.local`
   - Copy `scripts/config.example.js` to `scripts/config.js`
   - Add your Supabase URL, anon key, and service role key

2. **Security Best Practices**:
   - Never commit `.env.local` or `config.js` files to Git
   - Keep your service role key private and secure
   - Use environment variables in deployment environments
   - See `docs/secure-key-handling.md` for detailed security instructions

> ⚠️ **Important**: The service role key has administrative access to your Supabase project. Never expose it in client-side code or public repositories.

### Installation

1. Clone the repository:
   ```
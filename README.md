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
   - Add your Supabase URL and anon key

2. **Security Best Practices**:
   - Never commit `.env.local` files to Git
   - Keep your service role key private and secure
   - Use environment variables in deployment environments

> ⚠️ **Important**: The service role key has administrative access to your Supabase project. Never expose it in client-side code or public repositories.

### Installation

1. Clone the repository
2. Install dependencies
3. Set up environment variables
4. Run the development server

## Test Users

This project includes a GitHub workflow to easily create test users in your Supabase database. The workflow will automatically generate a markdown file with the test user credentials.

### Creating Test Users

1. Go to the "Actions" tab in your GitHub repository
2. Select the "Create Test Users" workflow
3. Click "Run workflow"
4. Choose the type of users you want to create:
   - `standard`: Creates basic customer, restaurant owner, and admin users
   - `restaurant`: Creates additional restaurant owners and staff members
   - `all`: Creates all types of users
5. Click "Run workflow" to start the process
6. Once complete, a new commit will be created with a `test-users.md` file containing all user credentials

### Available User Types

- **Customer**: Regular users who can browse menus
- **Restaurant Owners**: Users who can create and manage restaurants and menus
- **Staff Members**: Users with limited access to restaurant functions (managers, waiters, kitchen staff)
- **Administrators**: Users with full system access

## Deployment

For deployment instructions, please refer to the documentation in the `docs` directory.
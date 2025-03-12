# MenúFácil Frontend

This directory contains the frontend components of the MenúFácil application, built with Next.js.

## Structure

- `src/` - Source code
  - `app/` - Next.js app router pages and layouts
  - `components/` - Reusable React components
  - `lib/` - Utility libraries and API clients
  - `hooks/` - Custom React hooks
  - `styles/` - Global styles and Tailwind configuration
  - `types/` - TypeScript type definitions
  - `utils/` - Helper functions
- `public/` - Static assets

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your Supabase and Stripe credentials.

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## Deployment to Vercel

The frontend is designed to be deployed to Vercel.

### Automatic Deployment

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend` in your Vercel project settings
3. Configure environment variables in the Vercel dashboard
4. Deploy the application

### Manual Deployment

1. Install the Vercel CLI:

```bash
npm install -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy to production:

```bash
vercel --prod
```

## Environment Variables

The following environment variables need to be set:

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your-stripe-publishable-key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-app-url.com
NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID=your-stripe-price-id
```

## Features

- User authentication with Supabase Auth
- Restaurant management
- Menu creation and customization
- Subscription management with Stripe
- Responsive design with Tailwind CSS

## Code Quality

To run linting:

```bash
npm run lint
# or
yarn lint
```

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Stripe Documentation](https://stripe.com/docs) 
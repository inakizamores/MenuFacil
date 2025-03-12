# MenúFácil Backend

This directory contains the backend components of the MenúFácil application, powered by Supabase.

## Structure

- `supabase/` - Supabase configuration and assets
  - `migrations/` - Database migration scripts
  - `functions/` - Edge Functions (serverless functions)
  - `config.toml` - Supabase project configuration

## Getting Started

### Prerequisites

- [Supabase CLI](https://supabase.com/docs/guides/cli)
- [Supabase Account](https://supabase.com)
- [Stripe Account](https://stripe.com) (for payments)

### Local Development

1. Install the Supabase CLI:

```bash
npm install -g supabase
```

2. Initialize Supabase locally:

```bash
supabase init
```

3. Start the local Supabase stack:

```bash
supabase start
```

This will start a local Postgres database, Supabase API, and other services on your machine.

### Database Migrations

To apply database migrations:

```bash
supabase db reset
```

This will reset your local database and apply all migrations in the `migrations` directory.

### Edge Functions

To serve edge functions locally:

```bash
supabase functions serve
```

This will start all edge functions in development mode.

## Deployment

### Creating a Supabase Project

1. Create a new project in the [Supabase Dashboard](https://app.supabase.com)

2. Link your local project to the remote project:

```bash
supabase link --project-ref your-project-ref
```

### Deploying Database Schema

To deploy your database schema to your Supabase project:

```bash
supabase db push
```

### Deploying Edge Functions

To deploy an edge function:

```bash
supabase functions deploy stripe-webhook
```

### Setting Environment Variables

For edge functions that require environment variables:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_...
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

## Database Schema

The database schema is defined in the migration files in the `migrations/` directory. The main tables include:

- `profiles` - User profiles
- `restaurants` - Restaurant information
- `menus` - Restaurant menus
- `categories` - Menu categories
- `items` - Menu items
- `item_options` - Item options/modifications
- `subscriptions` - Subscription information

For detailed schema information, see the `migrations/` directory.

## Security

The application uses Supabase's Row Level Security (RLS) policies to ensure data security. These policies are defined in the migration files.

## Edge Functions

- `stripe-webhook` - Handles Stripe webhook events for subscription management

## Monitoring

You can monitor your Supabase project through the Supabase Dashboard, which provides logs, metrics, and other tools for debugging and performance monitoring. 
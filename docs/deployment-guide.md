# MenúFácil Deployment Guide

This guide provides step-by-step instructions for deploying the MenúFácil application to Vercel (frontend) and Supabase (backend).

## Prerequisites

Before you begin, make sure you have:

1. A [GitHub](https://github.com/) account
2. A [Vercel](https://vercel.com/) account
3. A [Supabase](https://supabase.com/) account
4. A [Stripe](https://stripe.com/) account (for payment processing)

## Deploying the Backend (Supabase)

### Step 1: Create a Supabase Project

1. Log in to your Supabase account
2. Click "New Project"
3. Enter a name for your project (e.g., "menufacil")
4. Choose a database password (save this for later)
5. Select a region closest to your target users
6. Click "Create new project"

### Step 2: Set Up the Database Schema

1. Once your project is created, navigate to the SQL Editor
2. Copy the contents of `backend/supabase/migrations/20250312123000_initial_schema.sql`
3. Paste it into the SQL Editor and click "Run"
4. This will create all the necessary tables, functions, and triggers

### Step 3: Seed the Database (Optional)

If you want to populate the database with test data:

1. Navigate to the SQL Editor
2. Copy the contents of `backend/supabase/seed.sql`
3. Paste it into the SQL Editor and click "Run"

### Step 4: Configure Authentication

1. Go to Authentication > Settings
2. Under "Site URL", enter your frontend URL (e.g., `https://menufacil.vercel.app`)
3. Under "Redirect URLs", add:
   - `https://menufacil.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)
4. Save changes

### Step 5: Configure Storage

1. Go to Storage
2. Create the following buckets:
   - `avatars` (for user profile pictures)
   - `restaurant-images` (for restaurant images)
   - `menu-images` (for menu item images)
3. Set the privacy settings for each bucket:
   - `avatars`: Public (read)
   - `restaurant-images`: Public (read)
   - `menu-images`: Public (read)

### Step 6: Get API Keys

1. Go to Project Settings > API
2. Note down the following values:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

## Deploying the Frontend (Vercel)

### Step 1: Connect Your Repository

1. Fork or clone the MenúFácil repository to your GitHub account
2. Log in to your Vercel account
3. Click "New Project"
4. Import your GitHub repository
5. Select the "frontend" directory as the root directory

### Step 2: Configure Environment Variables

Add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
NEXT_PUBLIC_APP_URL=https://your-vercel-app-url.vercel.app
NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID=your_stripe_price_id
NEXT_PUBLIC_SUBSCRIPTION_PRICE=9.99
```

### Step 3: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your application should now be live at the provided URL

## Setting Up Stripe Integration

### Step 1: Create a Stripe Account

1. Sign up for a Stripe account if you don't have one
2. Navigate to the Stripe Dashboard

### Step 2: Configure Products and Prices

1. Go to Products > Add Product
2. Create a product for your subscription:
   - Name: "MenúFácil Premium"
   - Description: "Unlimited restaurants and menus"
3. Add a recurring price:
   - Price: $9.99
   - Billing period: Monthly
4. Save the product
5. Note the Price ID (starts with "price_")

### Step 3: Configure Webhook

1. Go to Developers > Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-vercel-app-url.vercel.app/api/webhooks/stripe`
4. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click "Add endpoint"
6. Reveal the signing secret and note it down (this is your `STRIPE_WEBHOOK_SECRET`)

### Step 4: Update Environment Variables

1. Go back to your Vercel project
2. Update the following environment variables:
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_WEBHOOK_SECRET`: The webhook signing secret
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
   - `NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID`: The Price ID from Step 2

## Testing the Deployment

1. Visit your deployed application
2. Create a new account
3. Log in and verify that you can access the dashboard
4. Create a restaurant and menu
5. Test the subscription process
6. Generate a QR code and test the public menu view

## Troubleshooting

### Database Connection Issues

- Verify that your Supabase URL and API keys are correct
- Check that your IP is not blocked in Supabase

### Authentication Problems

- Ensure the redirect URLs are correctly configured in Supabase
- Check that the site URL matches your deployed frontend URL

### Stripe Integration Issues

- Verify that all Stripe environment variables are correctly set
- Check the Stripe webhook logs for any errors
- Test with Stripe's test mode before going live

## Maintenance and Updates

### Database Migrations

When updating the database schema:

1. Create a new migration file in `backend/supabase/migrations/`
2. Apply the migration in the Supabase SQL Editor

### Frontend Updates

1. Push changes to your GitHub repository
2. Vercel will automatically deploy the updates

## Security Considerations

- Keep your `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY` secure
- Regularly rotate your API keys
- Monitor your Supabase and Stripe dashboards for unusual activity
- Set up appropriate Row Level Security (RLS) policies in Supabase

## Support

If you encounter any issues during deployment, please:

1. Check the documentation
2. Review the troubleshooting section
3. Open an issue on the GitHub repository
4. Contact support at support@menufacil.com 
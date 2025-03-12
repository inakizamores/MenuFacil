# Supabase Deployment Guide for MenúFácil

This guide provides step-by-step instructions for deploying the MenúFácil backend to Supabase.

## Prerequisites

Before you begin, make sure you have:

1. A [Supabase](https://supabase.com/) account
2. [Supabase CLI](https://supabase.com/docs/guides/cli) installed

## Step 1: Create a New Supabase Project

1. Log in to the [Supabase Dashboard](https://app.supabase.com/)
2. Click "New Project"
3. Enter a name for your project (e.g., "menufacil")
4. Set a secure database password
5. Choose a region closest to your users
6. Click "Create new project"

## Step 2: Set Up Local Development

1. Install the Supabase CLI if you haven't already:
   ```bash
   npm install -g supabase
   ```

2. Log in to the Supabase CLI:
   ```bash
   supabase login
   ```

3. Initialize Supabase in your project (if not already initialized):
   ```bash
   cd /path/to/MenuFacil
   supabase init
   ```

4. Link your local project to your Supabase project:
   ```bash
   supabase link --project-ref <project-ref>
   ```
   Replace `<project-ref>` with your Supabase project reference ID, which you can find in the Project Settings in the Supabase Dashboard.

## Step 3: Deploy Database Schema

1. Apply the database migration:
   ```bash
   cd /path/to/MenuFacil
   supabase db push
   ```

   Alternatively, you can manually run the migration script:
   1. In the Supabase Dashboard, go to the "SQL Editor"
   2. Copy the contents of `backend/supabase/migrations/20250312123000_initial_schema.sql`
   3. Paste into the SQL Editor and execute

2. Verify that all tables and policies have been created correctly in the "Table Editor"

## Step 4: Seed the Database (Optional for Development)

For development purposes, you might want to populate the database with test data:

1. In the Supabase Dashboard, go to the "SQL Editor"
2. Copy the contents of `backend/supabase/seed.sql`
3. Paste into the SQL Editor and execute

## Step 5: Configure Storage Buckets

1. In the Supabase Dashboard, go to "Storage"
2. Create the following buckets:
   - `avatars` - For user profile pictures
   - `restaurant-images` - For restaurant logos and images
   - `menu-images` - For menu item images

3. Set appropriate bucket policies:

   For public read access to the `avatars` bucket:
   ```sql
   CREATE POLICY "Public read access for avatars"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'avatars');
   
   CREATE POLICY "Users can upload their own avatars"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
   
   CREATE POLICY "Users can update their own avatars"
   ON storage.objects FOR UPDATE
   USING (bucket_id = 'avatars' AND auth.uid() = owner);
   
   CREATE POLICY "Users can delete their own avatars"
   ON storage.objects FOR DELETE
   USING (bucket_id = 'avatars' AND auth.uid() = owner);
   ```

   Apply similar policies for `restaurant-images` and `menu-images` buckets.

## Step 6: Deploy Edge Functions

1. Deploy the Stripe webhook function:
   ```bash
   supabase functions deploy stripe-webhook --project-ref <project-ref>
   ```

2. Set the required environment variables:
   ```bash
   supabase secrets set --env production STRIPE_SECRET_KEY=sk_your_stripe_secret_key --project-ref <project-ref>
   supabase secrets set --env production STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret --project-ref <project-ref>
   ```

## Step 7: Configure Authentication

1. In the Supabase Dashboard, go to "Authentication" → "URL Configuration"
2. Set the Site URL to your frontend URL (e.g., `https://menufacil.vercel.app`)
3. Add Redirect URLs:
   - `https://menufacil.vercel.app/auth/callback`
   - `http://localhost:3000/auth/callback` (for local development)

4. Go to "Authentication" → "Email Templates" to customize email templates (optional)
5. Configure any other authentication providers if needed (Google, GitHub, etc.)

## Step 8: Get API Keys for Frontend

1. In the Supabase Dashboard, go to "Project Settings" → "API"
2. Note down the following values:
   - Project URL (`https://<project-ref>.supabase.co`)
   - `anon` public key
   - `service_role` key (keep this secret!)

3. Add these values to your frontend environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
   SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
   ```

## Step 9: Set Up Webhook Integration with Stripe

1. In your Stripe Dashboard, go to "Developers" → "Webhooks"
2. Add a new endpoint:
   - URL: `https://<project-ref>.supabase.co/functions/v1/stripe-webhook`
   - Events to listen for:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. Note down the webhook signing secret and add it to your Supabase functions environment variables.

## Step 10: Testing the Deployment

1. Test authentication by creating a new user account from your frontend
2. Test database operations by creating a restaurant, menus, categories, and items
3. Test Stripe integration by subscribing to a restaurant

## Troubleshooting

### Database Deployment Issues

- Check if there are any SQL syntax errors in your migration files
- Make sure you have the correct permissions to push database changes

### Function Deployment Issues

- Verify that Deno imports are correctly formatted and accessible
- Check if environment variables are properly set
- Examine function logs in the Supabase Dashboard under "Edge Functions" → "Logs"

### Authentication Issues

- Make sure the Site URL and Redirect URLs are correctly configured
- Verify that the sign-up and sign-in flows correctly handle redirect URLs

### Storage Issues

- Check if bucket policies allow the intended operations
- Verify that storage paths are correctly formatted in your application code

## Automated CI/CD (Optional)

For continuous deployment, you can set up a GitHub Actions workflow:

```yaml
name: Deploy Migrations to Supabase

on:
  push:
    branches: [ main ]
    paths:
      - 'backend/supabase/migrations/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: supabase/setup-cli@v1
      - name: Deploy migrations
        run: supabase db push
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
```

## Monitoring and Maintenance

- Regularly check the Supabase Dashboard for usage metrics and potential issues
- Set up database backups (available on paid plans)
- Monitor Stripe webhook deliveries for any failures
- Keep an eye on storage usage to avoid hitting limits 
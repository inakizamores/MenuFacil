# Supabase Deployment Readiness Checklist

Use this checklist to verify that your backend is ready for deployment to Supabase.

## Database Structure

- [x] Database migration file exists (`backend/supabase/migrations/20250312123000_initial_schema.sql`)
- [x] Migration file includes all necessary tables (profiles, restaurants, menus, categories, items, item_options, subscriptions)
- [x] Row Level Security (RLS) policies are defined for all tables
- [x] Indexes are created for performance optimization
- [x] Foreign key relationships are properly defined
- [x] Triggers are set up (e.g., for creating profiles when users sign up)
- [x] Seed data exists for testing (`backend/supabase/seed.sql`)

## Authentication

- [ ] Email authentication is configured
- [ ] Email templates are ready (optional)
- [ ] Additional authentication providers are configured (optional)
- [ ] Redirect URLs are planned (`/auth/callback`)

## Storage

- [ ] Required storage buckets are identified:
  - [x] `avatars` for user profile pictures
  - [x] `restaurant-images` for restaurant logos and images
  - [x] `menu-images` for menu item images
- [ ] Storage bucket policies are planned for:
  - [ ] Public read access
  - [ ] Authenticated user uploads
  - [ ] Owner-only updates and deletes

## Edge Functions

- [x] Stripe webhook function is implemented (`backend/supabase/functions/stripe-webhook/index.ts`)
- [ ] Environment variables for functions are identified:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`

## Frontend Integration

- [x] Frontend code uses Supabase client
- [x] Environment variables are defined:
  - [x] `NEXT_PUBLIC_SUPABASE_URL`
  - [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [x] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Authentication flows handle redirects correctly

## External Services Integration

- [x] Stripe integration is implemented
- [ ] Webhook endpoint URL is planned
- [ ] Stripe events to listen for are identified:
  - [x] `customer.subscription.created`
  - [x] `customer.subscription.updated`
  - [x] `customer.subscription.deleted`

## Local Development Setup

- [ ] Supabase CLI is installed
- [ ] Local development configuration is ready (`supabase init`)
- [ ] Project linking command is ready (`supabase link --project-ref <project-ref>`)

## Deployment Plan

- [x] Step-by-step deployment guide exists (`frontend/docs/supabase-deployment-guide.md`)
- [ ] Rollback strategy is defined (in case of deployment issues)
- [ ] Testing plan after deployment is prepared

## Security Considerations

- [x] Secrets management strategy is defined (using Supabase secrets)
- [x] Row Level Security policies enforce proper data access control
- [ ] Service role key is secured and only used where necessary
- [ ] Storage bucket policies enforce proper access control

## Monitoring and Maintenance

- [ ] Plan for monitoring database usage
- [ ] Plan for monitoring function executions
- [ ] Plan for regular backups (if applicable)
- [ ] Update strategy for future schema changes

## Final Pre-Deployment Tasks

- [ ] Review all SQL scripts for errors
- [ ] Verify all RLS policies work as expected
- [ ] Ensure all required environment variables are documented
- [ ] Test authentication flows locally 
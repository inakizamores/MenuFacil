# MenúFácil Deployment Checklist

This checklist will help you track your progress as you deploy the MenúFácil application to Supabase and Vercel.

## Supabase Deployment

### Initial Setup
- [ ] Create a Supabase account
- [ ] Create a new Supabase project
- [ ] Note down Project URL, `anon` public key, and `service_role` key

### Database Setup
- [ ] Apply database migrations using SQL Editor or Supabase CLI
- [ ] Verify tables are created correctly in Table Editor

### Storage Setup
- [ ] Create `avatars` bucket
- [ ] Create `restaurant-images` bucket
- [ ] Create `menu-images` bucket
- [ ] Configure appropriate bucket policies

### Authentication Setup
- [ ] Configure Site URL in Authentication settings
- [ ] Add redirect URLs for local development and production
- [ ] Customize email templates (optional)

### Edge Functions
- [ ] Deploy Stripe webhook function
- [ ] Test webhook function with Stripe CLI

## Vercel Deployment

### Project Preparation
- [ ] Run the preparation script: `node scripts/prepare-for-vercel.js`
- [ ] Verify all client components have `'use client'` directive
- [ ] Verify all API routes have `export const dynamic = 'force-dynamic'`
- [ ] Create `.env.production` file with production values

### Environment Variables
- [ ] Set up Supabase environment variables in Vercel
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Set up Stripe environment variables in Vercel
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] Set up application environment variables in Vercel
  - [ ] `NEXT_PUBLIC_APP_URL` (production URL)
  - [ ] `NEXT_PUBLIC_SUBSCRIPTION_PRICE`

### Deployment
- [ ] Deploy to Vercel using Git integration or Vercel CLI
- [ ] Verify build completes successfully
- [ ] Test application functionality in production

### Post-Deployment
- [ ] Update Supabase authentication settings with production URL
- [ ] Test user registration and login
- [ ] Test restaurant creation and management
- [ ] Test subscription creation and management
- [ ] Set up custom domain (optional)

## Troubleshooting

If you encounter issues during deployment, refer to:
- [Supabase Deployment Guide](./supabase-deployment-guide.md)
- [Vercel Deployment Guide](./vercel-deployment-guide-final.md)

## Final Verification

- [ ] User authentication works in production
- [ ] Restaurant creation and management works in production
- [ ] Menu creation and management works in production
- [ ] Subscription creation and management works in production
- [ ] Images upload and display correctly in production 
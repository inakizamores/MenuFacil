# MenúFácil Deployment Checklist

Use this checklist to ensure your application is ready for deployment to Vercel.

## Pre-Deployment Checks

- [ ] All environment variables are properly set
- [ ] Next.js configuration is updated with Supabase storage domain
- [ ] Application builds successfully locally (`npm run build`)
- [ ] All dependencies are up to date
- [ ] No linting errors (`npm run lint`)
- [ ] Supabase authentication settings are configured for production URLs
- [ ] Static assets (images, fonts, etc.) are properly handled
- [ ] API routes are tested and functioning
- [ ] Responsive design is tested on multiple devices

## Supabase Configuration

- [ ] Supabase project is created and configured
- [ ] Database schema is applied
- [ ] Storage buckets are created
- [ ] Bucket policies are properly set
- [ ] Authentication settings are updated for production
  - [ ] Site URL points to your production domain
  - [ ] Redirect URLs are properly configured
  - [ ] Email templates are customized (optional)

## Environment Variables

Ensure the following environment variables are set in Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `NEXT_PUBLIC_APP_URL`
- [ ] `NEXT_PUBLIC_SUBSCRIPTION_PRICE`
- [ ] `NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID` (if using Stripe)
- [ ] `STRIPE_SECRET_KEY` (if using Stripe)
- [ ] `STRIPE_WEBHOOK_SECRET` (if using Stripe)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (if using Stripe)

## Vercel Project Configuration

- [ ] Root directory is set correctly (if using monorepo)
- [ ] Build command is set to `npm run build`
- [ ] Output directory is set to `.next`
- [ ] Framework preset is set to Next.js
- [ ] Node.js version is set to appropriate version (e.g., 18.x)
- [ ] Serverless functions region is set appropriately

## Post-Deployment Checks

- [ ] Application loads without errors
- [ ] Authentication flow works correctly
- [ ] Images from Supabase storage load properly
- [ ] Forms work and submit data correctly
- [ ] API routes return expected responses
- [ ] Navigation works as expected
- [ ] Application is responsive on different devices
- [ ] Error pages (404, 500) are properly configured

## Performance Considerations

- [ ] Use Next.js Image component for optimized images
- [ ] Lazy load components when appropriate
- [ ] Minimize JavaScript bundle size
- [ ] Set appropriate cache headers for static assets
- [ ] Use incremental static regeneration where appropriate

## Security Considerations

- [ ] No sensitive information is exposed in client-side code
- [ ] API routes are properly authenticated
- [ ] Content Security Policy headers are configured
- [ ] CORS settings are configured correctly
- [ ] Rate limiting is implemented on sensitive endpoints

## Monitoring Setup

- [ ] Error tracking is configured (e.g., Sentry)
- [ ] Analytics is set up (e.g., Google Analytics, Vercel Analytics)
- [ ] Logging is configured for server-side functions
- [ ] Performance monitoring is enabled 
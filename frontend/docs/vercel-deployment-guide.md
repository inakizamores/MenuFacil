# Vercel Deployment Guide for MenúFácil

This guide will walk you through deploying the MenúFácil frontend application to Vercel.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. Your Supabase project set up and configured
3. Your Stripe account set up (if using payment features)
4. A GitHub, GitLab, or Bitbucket repository containing your project

## Step 1: Update Configuration Files

### 1. Update Next.js Configuration

Update your `next.config.js` file to include your Supabase storage domain:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'menufacil.com.mx',
      // Replace with your Supabase storage domain
      'aejxheybvxbwvjuyfhfh.supabase.co',
    ],
  },
  experimental: {
    // serverActions: true,
  },
};

module.exports = nextConfig;
```

### 2. Prepare Environment Variables

Create a `.env.production` file in your project root (this won't be committed to your repository, it's just for reference):

```
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://aejxheybvxbwvjuyfhfh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Stripe Configuration
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-production-domain.vercel.app
NEXT_PUBLIC_SUBSCRIPTION_PRICE_ID=your_subscription_price_id
NEXT_PUBLIC_SUBSCRIPTION_PRICE=9.99
```

## Step 2: Configure Supabase for Production

1. Go to your Supabase dashboard: [https://app.supabase.com/](https://app.supabase.com/)
2. Select your project
3. Go to Authentication → Settings → URL Configuration
4. Update the Site URL to your Vercel production URL (e.g., `https://menufacil.vercel.app`)
5. Add Redirect URLs:
   - `https://your-production-domain.vercel.app/auth/callback`
   - `https://your-production-domain.vercel.app/auth/reset-password`

## Step 3: Deploy to Vercel

### Option 1: Deploy from Git Repository

1. Push your code to your Git repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Import your repository
5. Configure the project:
   - Set the Framework Preset to "Next.js"
   - Set the Root Directory to "frontend" if your project is in a monorepo
   - Set Build Command to `npm run build`
   - Set Output Directory to `.next`

6. Add Environment Variables:
   - Click "Environment Variables"
   - Add all variables from your `.env.production` file
   - Ensure all sensitive keys (like `SUPABASE_SERVICE_ROLE_KEY` and `STRIPE_SECRET_KEY`) are added

7. Click "Deploy"

### Option 2: Deploy with Vercel CLI

1. Install Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Navigate to your project directory:
   ```
   cd frontend
   ```

4. Deploy to Vercel:
   ```
   vercel
   ```

5. Follow the prompts to configure your deployment:
   - Set up and deploy?: `Y`
   - Which scope?: Select your account or team
   - Link to existing project?: `N` if it's a new project
   - What's your project's name?: `menufacil` (or your preferred name)
   - In which directory is your code located?: `./` (or your frontend directory path)
   - Want to override the settings?: `Y`
   - Which settings would you like to override?: Select "Environment Variables"
   - Add all your environment variables from `.env.production`

## Step 4: Verify Deployment

1. Once deployed, Vercel will provide you with a URL to access your application
2. Visit the URL and verify that:
   - The application loads without errors
   - Authentication with Supabase works
   - All API routes are functioning correctly
   - Storage access is working properly

## Step 5: Set Up Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click on "Domains"
3. Enter your custom domain and click "Add"
4. Follow the instructions to configure your DNS settings
5. Update your Supabase authentication settings with the new custom domain

## Troubleshooting

### Authentication Issues

If you experience authentication problems:

1. Check that your site URL and redirect URLs are correctly set in the Supabase dashboard
2. Verify that your environment variables are correctly set in Vercel
3. Check browser console for any errors

### Build Errors

If your build fails:

1. Check the build logs in Vercel
2. Ensure all dependencies are correctly installed
3. Verify that your Next.js configuration is correct

### Image Loading Issues

If images from Supabase storage don't load:

1. Check that your Supabase domain is added to the `images.domains` array in `next.config.js`
2. Verify that your storage buckets have the correct permissions

## Maintenance

### Updating Your Deployment

When you push changes to your Git repository, Vercel will automatically rebuild and redeploy your application.

### Environment Variable Updates

If you need to update environment variables:

1. Go to your project in the Vercel dashboard
2. Click on "Settings" → "Environment Variables"
3. Update the necessary variables
4. Redeploy your application for the changes to take effect

## Performance Optimization

1. **Enable Caching**: Configure appropriate cache headers for static assets
2. **Use Edge Functions**: Consider using Vercel Edge Functions for APIs that need to be close to users
3. **Image Optimization**: Use Next.js Image component for automatic image optimization

## Security Considerations

1. **Environment Variables**: Never expose sensitive keys in client-side code
2. **API Routes**: Implement proper authentication for all API routes
3. **Content Security Policy**: Configure appropriate CSP headers in `vercel.json`
4. **Rate Limiting**: Implement rate limiting for API routes to prevent abuse 
# MenúFácil Vercel Deployment Guide

This guide provides detailed instructions for deploying the MenúFácil frontend application to Vercel, including troubleshooting steps for common issues.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. Your Supabase project set up and configured
3. Your Stripe account set up (if using payment features)
4. A GitHub, GitLab, or Bitbucket repository containing your project

## Step 1: Prepare Your Project for Deployment

### 1. Update Next.js Configuration

Ensure your `next.config.js` file includes your Supabase storage domain:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'localhost',
      'menufacil.com.mx',
      // Supabase storage domain
      'aejxheybvxbwvjuyfhfh.supabase.co',
    ],
  },
  // Enable experimental features if needed
  experimental: {
    // serverActions: true,
  },
};

module.exports = nextConfig;
```

### 2. Add 'use client' Directive to Client Components

Ensure all components that use React hooks have the 'use client' directive at the top of the file:

```tsx
'use client';

import React, { useState, useEffect } from 'react';
// Rest of the component code
```

### 3. Fix Tailwind CSS Configuration

Ensure your `tailwind.config.js` includes all necessary color definitions:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          // Other primary color shades
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          // Other secondary color shades
        },
        // Other color definitions
      },
      // Other theme extensions
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
```

### 4. Add Dynamic Export to API Routes

For all API routes, add the `dynamic` export to ensure proper handling:

```ts
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
  // Route handler code
}
```

### 5. Prepare Environment Variables

Create a `.env.production` file with your production environment variables:

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

### Option 1: Deploy from Git Repository (Recommended)

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

5. Follow the prompts to configure your deployment

## Step 4: Troubleshooting Common Issues

### TypeScript Errors in API Routes

If you encounter TypeScript errors in API routes, try these solutions:

1. Add the `dynamic` export to the route:
   ```ts
   export const dynamic = 'force-dynamic';
   ```

2. If you're still having issues, you can temporarily bypass TypeScript checks during build:
   ```
   NEXT_SKIP_TYPE_CHECK=true npm run build
   ```

### Tailwind CSS Issues

If you encounter Tailwind CSS issues:

1. Ensure you have the correct versions of Tailwind CSS packages:
   ```
   npm install tailwindcss@3.3.0 postcss@8.4.35 autoprefixer@10.4.16 --legacy-peer-deps
   ```

2. Check your `tailwind.config.js` for missing color definitions

3. Verify your `postcss.config.js` is correctly configured:
   ```js
   module.exports = {
     plugins: {
       tailwindcss: {},
       autoprefixer: {},
     },
   }
   ```

### Client Component Errors

If you see errors about React hooks only working in client components:

1. Add the 'use client' directive to the top of any component file that uses React hooks:
   ```tsx
   'use client';
   
   import React, { useState, useEffect } from 'react';
   ```

### Environment Variable Issues

If your application can't access environment variables:

1. Verify they are correctly set in the Vercel dashboard
2. Ensure client-side variables are prefixed with `NEXT_PUBLIC_`
3. Check for typos in variable names

## Step 5: Post-Deployment Verification

After deployment, verify:

1. The application loads without errors
2. Authentication with Supabase works correctly
3. API routes return expected responses
4. Images from Supabase storage load properly
5. Forms submit data correctly

## Step 6: Set Up Custom Domain (Optional)

1. In your Vercel dashboard, go to your project
2. Click on "Domains"
3. Enter your custom domain and click "Add"
4. Follow the instructions to configure your DNS settings
5. Update your Supabase authentication settings with the new custom domain

## Conclusion

By following this guide, you should have successfully deployed your MenúFácil application to Vercel. If you encounter any issues not covered in this guide, refer to the [Vercel documentation](https://vercel.com/docs) or the [Next.js documentation](https://nextjs.org/docs) for additional help. 
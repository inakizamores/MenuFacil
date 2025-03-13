# GitHub and Vercel Integration Guide

This guide explains how to set up the MenúFácil application for continuous deployment using GitHub and Vercel without exposing sensitive credentials.

## Prerequisites

- A GitHub repository for your MenúFácil project
- A Vercel account linked to your GitHub account
- Your Supabase project and credentials

## Setting Up GitHub Secrets

GitHub Secrets allow you to store sensitive information securely for use in GitHub Actions:

1. **Navigate to your GitHub repository**
2. **Go to Settings > Secrets and variables > Actions**
3. **Add the following repository secrets**:
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
   - `VERCEL_TOKEN`: Your Vercel API token (from Vercel dashboard)
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

## Setting Up Vercel Environment Variables

1. **Go to the Vercel Dashboard**
2. **Select your MenúFácil project**
3. **Navigate to Settings > Environment Variables**
4. **Add the following environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL (not secret)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key (not secret)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (secret)
   - `ADMIN_API_KEY`: A custom key for protecting admin API routes (secret)

## GitHub Actions Workflows

The project includes two GitHub Actions workflows:

1. **Test Secret** (`.github/workflows/test-secret.yml`):
   - A manual workflow to verify that GitHub secrets are configured correctly
   - Trigger it from the Actions tab to test your setup

2. **Deployment** (`.github/workflows/deploy.yml`):
   - Automatically deploys to Vercel when you push to the main branch
   - Uses your GitHub secrets securely

## Code Structure for Secure Deployments

The codebase has been structured to handle environment variables securely:

- `frontend/src/lib/supabase-admin.js`: Server-side utility for admin operations
- `frontend/src/app/api/admin/`: API routes that use the service role key securely
- `scripts/verify-deployment.js`: Verification script for CI/CD environments

## How to Run a Deployment

### Automatic Deployment (Recommended)

1. Push changes to your `main` branch
2. GitHub Actions will automatically deploy to Vercel
3. Check the Actions tab for deployment status

### Manual Deployment

1. Install the Vercel CLI: `npm i -g vercel`
2. Log in to Vercel: `vercel login`
3. Deploy to production: `vercel --prod`

## Security Best Practices

1. **Never commit sensitive keys** to your repository
2. **Regularly rotate your Supabase service role key**
3. **Use environment-specific variables** for development, preview, and production
4. **Add additional validation** to admin API routes
5. **Monitor GitHub Actions logs** for any security issues

## Troubleshooting

- **Deployment failures**: Check GitHub Actions logs for details
- **Missing environment variables**: Verify all required variables are set in Vercel
- **API authentication errors**: Check that your service role key is valid and correctly set

If you encounter persistent issues, check Vercel logs and Supabase logs for more information. 
# Secure API Key Handling

This document explains how to securely handle the Supabase service role key and other sensitive credentials in the MenúFácil project.

## Overview

The Supabase service role key has administrative privileges for your Supabase project. It must be handled securely and never exposed in public repositories or client-side code.

## Local Development

1. **Set up environment files**:
   - Copy `.env.example` to `.env.local` in the `frontend` directory
   - Copy `scripts/config.example.js` to `scripts/config.js`
   - Add your actual Supabase keys to both files

2. **Verify .gitignore**:
   - Ensure `.env.local` and `scripts/config.js` are in your `.gitignore` file
   - Run `git status` to confirm these files will not be committed

## Deployment to Vercel

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to the "Environment Variables" section
3. Add the following environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` (not secret, can be exposed in the client)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (not secret, can be exposed in the client)
   - `SUPABASE_SERVICE_ROLE_KEY` (secret, server-side only)
4. Mark `SUPABASE_SERVICE_ROLE_KEY` as "Production Only" if you want to use a different key for previews

## GitHub Actions

If using GitHub Actions for CI/CD:

1. Go to your GitHub repository settings
2. Select "Secrets and variables" → "Actions"
3. Add the following repository secrets:
   - `SUPABASE_SERVICE_ROLE_KEY`
   - Any other sensitive credentials

4. Reference these secrets in your workflow files:
   ```yaml
   jobs:
     deploy:
       steps:
         - name: Deploy
           env:
             SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
   ```

## Security Best Practices

1. **Never hardcode keys** in your source code
2. **Never log keys** in your application logs
3. **Rotate keys regularly**, especially after team member changes
4. **Use the service key only on the server**, never in client-side code
5. **Limit access** to who knows the service key in your team

## Troubleshooting

If you see the error "Database error creating new user", check that:
1. Your service role key is correctly configured
2. Your service role key has been rotated in the Supabase dashboard
3. All instances of the old key have been updated with the new key 
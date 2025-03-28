# Setting Up Secure Vercel Cron Jobs for MenuFacil

This document explains how to properly configure Vercel cron jobs with authentication for the database backup system.

## Prerequisites

Before you begin, you'll need:

1. Access to the MenuFacil Vercel project
2. Admin permissions to add environment variables

## Step 1: Generate a Secure CRON_SECRET

First, generate a strong, random secret that will be used to authenticate cron job requests:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Alternative using OpenSSL
openssl rand -hex 32
```

Save this value securely - you'll need it in the next steps.

## Step 2: Add CRON_SECRET to Vercel Environment Variables

1. Visit the [Vercel Dashboard](https://vercel.com)
2. Select the MenuFacil project
3. Navigate to "Settings" > "Environment Variables"
4. Add a new environment variable:
   - Name: `CRON_SECRET`
   - Value: [The generated secret from Step 1]
   - Environment: Production (you can also add it to Preview if needed)
5. Click "Save"

## Step 3: Create a Vercel Cron Job

1. In the Vercel Dashboard, go to the MenuFacil project
2. Navigate to "Settings" > "Cron Jobs"
3. Click "Add Cron Job"
4. Configure the cron job:
   - Name: `Database Backup`
   - Description: `Trigger database backup via GitHub Actions`
   - Schedule: `0 0 * * *` (Daily at midnight UTC)
   - HTTP Method: `GET`
   - Path: `/api/cron/backup`
   - Headers: Add a header with:
     - Name: `Authorization`
     - Value: `Bearer [The generated secret from Step 1]`
5. Click "Create"

## Step 4: Verify Cron Job Setup

To verify that your cron job is properly configured and authenticated:

1. Wait for the first scheduled run, or manually run the cron job from the Vercel dashboard
2. Check the function logs in Vercel:
   - Navigate to the MenuFacil project
   - Go to "Functions" tab
   - Look for the `/api/cron/backup` function
   - Check that the logs don't show any warnings about missing or invalid authorization

## Security Considerations

- Never commit the CRON_SECRET to your repository
- Rotate the CRON_SECRET periodically (e.g., every 90 days)
- If you suspect the secret has been compromised, generate a new one immediately
- Monitor the function logs for unauthorized access attempts

## Troubleshooting

If you encounter issues with the cron job:

1. **Job doesn't run**: Verify the cron schedule syntax and check Vercel's cron job limits
2. **Authorization errors**: Ensure the CRON_SECRET environment variable matches the secret in the Authorization header
3. **Function errors**: Check the function logs for detailed error messages

## Additional Resources

- [Vercel Cron Jobs documentation](https://vercel.com/docs/cron-jobs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [MenuFacil Database Backup documentation](./DATABASE_BACKUP.md) 
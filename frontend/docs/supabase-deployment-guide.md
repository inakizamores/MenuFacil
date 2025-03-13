# Supabase Deployment Guide

This document provides step-by-step instructions for deploying and configuring the backend of MenúFácil on Supabase.

## Prerequisites

Before you begin, make sure you have:

- A Supabase account
- Access to the MenúFácil GitHub repository
- Node.js and npm installed
- Supabase CLI installed (optional but recommended)

## Step 1: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com/) and log in to your account.
2. Click "New project" to create a new project.
3. Select your organization (or create one if needed).
4. Enter a name for your project (e.g., "menufacil-prod").
5. Set a strong database password and make note of it.
6. Choose a region closest to your target audience.
7. Click "Create new project" and wait for the project to be created (this may take a few minutes).

## Step 2: Obtain Project Credentials

Once your project is created, you'll need to get the project credentials:

1. In your Supabase dashboard, go to "Project Settings" > "API".
2. Copy the following values:
   - **Project URL**: `https://[YOUR-PROJECT-ID].supabase.co`
   - **anon public** key (for client-side use)
   - **service_role** key (for server-side operations)

These credentials will be needed for your frontend environment variables.

## Step 3: Apply Database Migrations

You can apply the database schema using the Supabase SQL Editor:

1. Navigate to the "SQL Editor" in your Supabase dashboard.
2. Click "New query".
3. Copy the contents of `backend/supabase/migrations/20250312123000_initial_schema.sql` and paste it into the editor.
4. Click "Run" to execute the SQL and set up your database schema.

Alternatively, if you have the Supabase CLI installed:

```bash
supabase link --project-ref [YOUR-PROJECT-ID]
supabase db push
```

## Step 4: Configure Storage Buckets

MenúFácil requires three storage buckets with specific permissions:

1. In your Supabase dashboard, go to "Storage".
2. Create the following buckets:
   - `avatars` - For user profile images
   - `restaurant-images` - For restaurant profile images
   - `menu-images` - For menu item images

3. For each bucket, configure the following RLS (Row Level Security) policies:

#### For the `avatars` bucket:

- **Policy name**: Allow public read
- **Action**: SELECT (read)
- **Definition**: `true`

- **Policy name**: Allow authenticated users to upload their own avatar
- **Action**: INSERT (create)
- **Definition**: `(bucket_id = 'avatars' AND auth.uid() = owner) AND (storage.extension(name) = 'jpg' OR storage.extension(name) = 'png' OR storage.extension(name) = 'jpeg')`

- **Policy name**: Allow users to update their own avatar
- **Action**: UPDATE (update)
- **Definition**: `(bucket_id = 'avatars' AND auth.uid() = owner)`

- **Policy name**: Allow users to delete their own avatar
- **Action**: DELETE (delete)
- **Definition**: `(bucket_id = 'avatars' AND auth.uid() = owner)`

#### Configure similar policies for the other buckets with appropriate owner/access rules.

## Step 5: Deploy Edge Functions (if applicable)

If your project uses Supabase Edge Functions:

1. Navigate to the Functions section in your Supabase dashboard.
2. For each function in `backend/supabase/functions/`:
   - Click "Create a new function"
   - Enter the function name as it appears in the directory
   - Copy the code from the function's `index.ts` file
   - Configure any necessary environment variables
   - Deploy the function

Alternatively, using the Supabase CLI:

```bash
supabase functions deploy --project-ref [YOUR-PROJECT-ID]
```

## Step 6: Configure Authentication

1. Go to "Authentication" > "Settings" in your Supabase dashboard.
2. Under "Site URL", enter your production frontend URL (e.g., `https://menufacil.vercel.app`).
3. Under "Redirect URLs", add:
   - Your production URL: `https://menufacil.vercel.app`
   - Local development URL: `http://localhost:3000`

4. Configure email templates:
   - Go to "Authentication" > "Email Templates"
   - Customize the templates to match your brand (sender name, subject, content)

## Step 7: Update Frontend Environment Variables

After setting up Supabase, update your frontend environment variables:

1. In your Vercel dashboard, go to your project settings.
2. Under "Environment Variables", add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
   SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]
   ```

3. If you're deploying locally, update your `.env.local` file with these values.

## Step 8: Verify Connection

To verify your Supabase connection:

1. Start your frontend application.
2. Try to sign up a new user.
3. Check your Supabase dashboard "Authentication" section to confirm the user appears.
4. Test uploading an image to one of your storage buckets.
5. Test creating a restaurant and menu items.

## Troubleshooting

### Common Issues

1. **Database Errors**: Check for any SQL errors in the migration. You might need to run the migrations in smaller chunks.

2. **Storage Permission Issues**: Review your bucket policies to ensure they're correctly configured.

3. **Authentication Problems**:
   - Verify your Site URL and Redirect URLs are correctly set.
   - Check that your environment variables are correctly set in the frontend.

4. **Edge Function Errors**:
   - Check function logs in the Supabase dashboard.
   - Verify any environment variables needed by the functions.

### Getting Help

If you encounter issues not covered here, check:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase GitHub Repository](https://github.com/supabase/supabase)
- [MenúFácil GitHub Issues](https://github.com/inakizamores/MenuFacil/issues)

## Additional Resources

- [Supabase TypeScript Client Documentation](https://supabase.com/docs/reference/javascript/typescript-support)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth) 
# MenúFácil Test Users and Login Information

This document provides information about test users available in the application and how to use them for testing different privilege levels.

## Available Test Users

The following test users are available for development and testing purposes. These users are automatically created when you run the seed script for your local Supabase instance.

### Restaurant Owner User

This user has restaurant owner privileges and can manage restaurants, menus, and subscriptions:

- **Email**: `restaurant@example.com`
- **Password**: `password123` (default for all test users)
- **Full Name**: Restaurant Owner
- **User ID**: `a1a2a3a4-b1b2-c1c2-d1d2-e1e2f1f2g1g2`

This user owns the following test restaurants:
1. "Test Restaurant" - Has both a main food menu and a drinks menu
2. "Another Restaurant" - Has a single combined menu

### Regular User

This is a standard user without any restaurant ownership:

- **Email**: `test@example.com`
- **Password**: `password123`
- **Full Name**: Test User
- **User ID**: `2ae89af0-4f41-4a13-a684-f1c3e2d349df`

## Login Process

1. Navigate to the login page at `/auth/login`
2. Enter the email and password for one of the test users
3. Click the "Login" button
4. You will be redirected to the dashboard based on your user type

### Notes:

- Restaurant owners will see their restaurant dashboard with options to manage menus
- The system uses Supabase Authentication for user management
- Login sessions are maintained via Supabase Auth tokens
- For local development, these test users are only available if you've run the seed script on your local Supabase instance

## Creating Test Users

If the test users don't exist in your environment, you have two options to create them:

### Option 1: Run the Seed Script (Recommended for Local Development)

```bash
cd scripts
node seed-db.js
```

This script will attempt to populate your database with test users and sample data. However, it may not work in all environments due to API restrictions.

### Option 2: Create Users Manually in Supabase Dashboard

If the automated scripts don't work, follow the instructions in the [Manual User Creation Guide](./manual-user-creation.md) to create the test users through the Supabase dashboard.

## How to Create Admin Users

Currently, the application does not have a dedicated admin role or admin interface. Admin operations are typically performed directly in the Supabase dashboard or using the Supabase Management API.

If you need to perform administrative tasks:

1. Log in to your Supabase project dashboard
2. Use the SQL Editor, Table Editor, or Authentication sections to manage data and users

## Troubleshooting Login Issues

If you're having trouble logging in with the test users:

1. Ensure your Supabase instance is properly configured
2. Check that the seed data has been correctly applied
3. Verify that your frontend is correctly connecting to Supabase using the environment variables
4. Check the browser console for any authentication errors
5. Try creating the users manually as described in the [Manual User Creation Guide](./manual-user-creation.md) 
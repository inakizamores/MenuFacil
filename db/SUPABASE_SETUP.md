# Supabase Setup Guide for MenuFácil

This guide explains how to set up the database in Supabase for the MenuFácil application.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and sign in or create an account.
2. Create a new project with a name like "menufacil" or "menu-facil-[your-name]".
3. Choose a strong password for the database.
4. Select a region closest to your users.
5. Wait for the project to be created.

## 2. Set Up Environment Variables

1. From your Supabase project dashboard, go to "Settings" → "API".
2. Copy the "URL", "anon public" key, and other necessary credentials.
3. Create a `.env.local` file in your project root based on the `.env.example` template.
4. Add your Supabase credentials to the `.env.local` file.

## 3. Execute the Database Schema

1. In your Supabase project, go to "SQL Editor".
2. Create a new query.
3. Copy the contents of `db/schema.sql` from this project.
4. Paste the SQL in the query editor.
5. Run the query.

The schema will create:
- Tables for profiles, restaurants, menus, menu categories, menu items, etc.
- ENUM types for team roles and subscription statuses
- Row Level Security (RLS) policies for proper access control
- Triggers for automatic updates to "updated_at" fields
- Default templates

## 4. Test the Database Connection

To ensure your application can connect to the database:

1. Start your local development server: `npm run dev`
2. Navigate to a protected route (e.g., `/dashboard`)
3. Create a test user account
4. Verify that data is being stored and retrieved correctly

## 5. RLS Policies Explained

The database is secured with Row Level Security policies:

- **Profiles**: Users can only view and update their own profiles.
- **Restaurants**: Users can manage restaurants they own or are members of.
- **Restaurant Members**: Restaurant owners can manage team members.
- **Menus**: Access is controlled based on user roles (owner, admin, editor, viewer).
- **Menu Items**: Access follows the same pattern as menus.

## 6. Troubleshooting

If you encounter issues:

1. **Connection errors**: Verify your environment variables are correct.
2. **Permission errors**: Check RLS policies or ensure you're signed in.
3. **Schema errors**: Check the SQL logs for details.

## 7. Database Maintenance

Best practices for database maintenance:

1. Regularly backup your database.
2. Monitor usage and performance.
3. Use migrations for future schema changes.
4. Keep the schema documentation up to date. 
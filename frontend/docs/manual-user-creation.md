# Creating Test Users in Supabase Dashboard

The automated scripts couldn't create test users due to permission restrictions or authentication configuration. Follow these steps to create test users manually in the Supabase dashboard.

## Prerequisites

- Access to your Supabase project dashboard at https://app.supabase.com
- Your Supabase project credentials
- The MenúFácil database schema has been properly migrated (tables exist)

## Step 1: Access the Authentication Section

1. Log in to the [Supabase Dashboard](https://app.supabase.com)
2. Select your MenúFácil project
3. In the left sidebar, click on "Authentication"
4. Then click on "Users" to see the user management interface

## Step 2: Create the Regular Test User

1. Click the "Add User" button in the top right corner
2. In the dialog that appears, enter the following details:
   - **Email**: `test@example.com`
   - **Password**: `password123`
   - **Email Confirmation**: Check this option to mark the email as confirmed
3. Click "Create User"

## Step 3: Create the Restaurant Owner User

1. Click the "Add User" button again
2. Enter the following details:
   - **Email**: `restaurant@example.com`
   - **Password**: `password123`
   - **Email Confirmation**: Check this option to mark the email as confirmed
3. Click "Create User"

## Step 4: Add User Metadata (Optional)

To add user metadata like full name:

1. Find the user in the user list
2. Click on the user's row to open the user details panel
3. Click on the "Metadata" section
4. In the "user_metadata" JSON field, add:
   ```json
   {
     "full_name": "Test User"
   }
   ```
   (for the test user) or 
   ```json
   {
     "full_name": "Restaurant Owner"
   }
   ```
   (for the restaurant owner user)
5. Click "Save"

## Step 5: Verify Profile Table Records

After creating the users, verify that their profiles were automatically created:

1. In the left sidebar, click on "Table Editor"
2. Select the "profiles" table from the list
3. You should see entries for both users
4. If not, you may need to update the database trigger that creates profiles automatically

## Step 6: Create Test Restaurants and Data (Optional)

If you want to create the test restaurants and menu data:

1. Use the Table Editor to manually add records to the following tables in order:
   - restaurants (linked to the restaurant owner user)
   - menus (linked to the restaurants)
   - categories (linked to the menus)
   - items (linked to the categories)
   - item_options (linked to the items)

## Step 7: Test the Users

After creating the users, you should be able to log in to the MenúFácil application with:

- **Regular user**: Email: `test@example.com`, Password: `password123`
- **Restaurant owner**: Email: `restaurant@example.com`, Password: `password123`

## Troubleshooting

If profiles are not automatically created when you add users, check that:

1. The database trigger is set up correctly
2. The RLS (Row Level Security) policies allow creating profiles
3. The database migrations have been fully applied

If you encounter any issues, you can check the Supabase logs in the dashboard for more details.

## Next Steps

After creating the test users, you can start using the MenúFácil application with these accounts to test different privilege levels and features. 
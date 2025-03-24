# Supabase CLI Guide

This document provides instructions for using the Supabase CLI with the MenuFácil project.

## Setup

The Supabase CLI has been configured for this project. To use it, follow these steps:

1. Ensure you have the dependencies installed:
   ```bash
   npm install
   ```

2. Log in to Supabase CLI (if you haven't already):
   ```bash
   npx supabase login
   ```

## Available Commands

The following npm scripts have been added to make working with Supabase easier:

| Command | Description |
|---------|-------------|
| `npm run supabase:types` | Generate TypeScript types from your Supabase schema |
| `npm run supabase:status` | Check the status of your Supabase project |
| `npm run supabase:migrations:new` | Create a new migration file |
| `npm run supabase:migrations:apply` | Apply migrations to your database |
| `npm run supabase:studio` | Open the Supabase Studio locally |

## Project Structure

```
/supabase
  /migrations       # Database migration files
  config.toml       # Supabase configuration
  .gitignore        # Git ignore rules for Supabase files
/types
  database.types.ts # TypeScript types for the database
```

## Common Workflows

### Adding a New Table

1. Create a new migration file:
   ```bash
   npm run supabase:migrations:new add_new_table
   ```

2. Edit the generated migration file in `supabase/migrations/` with your SQL:
   ```sql
   -- Example: Creating a new table
   CREATE TABLE IF NOT EXISTS my_new_table (
     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
     name TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Enable Row Level Security
   ALTER TABLE my_new_table ENABLE ROW LEVEL SECURITY;
   
   -- Create access policies
   CREATE POLICY "Users can view their own data"
     ON my_new_table FOR SELECT
     USING (auth.uid() = user_id);
   ```

3. Apply the migration:
   ```bash
   npm run supabase:migrations:apply
   ```

4. Update TypeScript types:
   ```bash
   npm run supabase:types
   ```

### Making Schema Changes

1. Create a new migration file:
   ```bash
   npm run supabase:migrations:new alter_existing_table
   ```

2. Add your schema changes to the migration file:
   ```sql
   -- Add a new column
   ALTER TABLE existing_table ADD COLUMN new_column TEXT;
   
   -- Add an index
   CREATE INDEX idx_existing_table_new_column ON existing_table(new_column);
   ```

3. Apply the migration and update types as shown above.

### Viewing Your Database

Open the Supabase Studio to browse your database:

```bash
npm run supabase:studio
```

## Migration Guidelines

1. **Always create migrations for schema changes** - This ensures that all team members and environments have consistent database schemas.

2. **Keep migrations small and focused** - Each migration should handle a specific change to make it easier to understand and troubleshoot.

3. **Include both "up" and "down" logic** - When possible, include how to undo a migration in case it needs to be rolled back.

4. **Test migrations before applying to production** - Always test migrations in a development environment first.

5. **Update TypeScript types after migrations** - Always run `npm run supabase:types` after applying migrations to keep types in sync.

## Working with Remote Data

To interact with the remote database, use the Supabase client in your code. The project uses `@supabase/supabase-js` and `@supabase/ssr` for server-side rendering support.

Example:

```typescript
import { createClient } from '@/lib/supabase/client';

// In browser context
const supabase = createClient();
const { data, error } = await supabase.from('restaurants').select('*');

// In server action (with cookies for auth)
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function getRestaurants() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from('restaurants').select('*');
  return data;
}
```

## Troubleshooting

### Types Not Matching Database

If your TypeScript types don't match your database schema, try:

1. Check if your migration applied successfully:
   ```bash
   npm run supabase:status
   ```

2. Regenerate the types:
   ```bash
   npm run supabase:types
   ```

3. Make sure you're importing types from the correct file:
   ```typescript
   import type { Database } from '@/types/database.types';
   ```

### Connection Issues

If you're having trouble connecting to Supabase:

1. Verify your environment variables in `.env`
2. Ensure you're logged into the Supabase CLI
3. Check that your project reference ID is correct in `supabase/config.toml` 
# MenúFácil Database Schema

This document outlines the database schema for the MenúFácil application using Supabase PostgreSQL.

## Tables

### profiles

Stores user profile information.

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_profile_for_user();
```

### restaurants

Stores restaurant information.

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  address TEXT,
  phone TEXT,
  website TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by owner
CREATE INDEX idx_restaurants_owner_id ON restaurants(owner_id);
```

### menus

Stores menu information.

```sql
CREATE TABLE menus (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure only one default menu per restaurant
  CONSTRAINT unique_default_menu_per_restaurant 
    UNIQUE (restaurant_id, is_default) 
    DEFERRABLE INITIALLY DEFERRED
);

-- Index for faster queries by restaurant
CREATE INDEX idx_menus_restaurant_id ON menus(restaurant_id);
```

### categories

Stores menu categories.

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_id UUID REFERENCES menus(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by menu
CREATE INDEX idx_categories_menu_id ON categories(menu_id);
```

### items

Stores menu items.

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by category
CREATE INDEX idx_items_category_id ON items(category_id);
```

### item_options

Stores optional modifications for menu items (e.g., "Extra cheese", "No onions").

```sql
CREATE TABLE item_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id UUID REFERENCES items(id) NOT NULL,
  name TEXT NOT NULL,
  price_adjustment DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries by item
CREATE INDEX idx_item_options_item_id ON item_options(item_id);
```

### subscriptions

Stores subscription information for restaurants.

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one subscription per restaurant
  CONSTRAINT unique_subscription_per_restaurant UNIQUE (restaurant_id)
);

-- Index for faster queries by profile
CREATE INDEX idx_subscriptions_profile_id ON subscriptions(profile_id);
```

## Row Level Security (RLS) Policies

To secure the data, we'll implement the following RLS policies:

### profiles

```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

### restaurants

```sql
-- Users can read their own restaurants
CREATE POLICY "Users can read own restaurants" ON restaurants
  FOR SELECT USING (auth.uid() = owner_id);

-- Users can insert their own restaurants
CREATE POLICY "Users can insert own restaurants" ON restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can update their own restaurants
CREATE POLICY "Users can update own restaurants" ON restaurants
  FOR UPDATE USING (auth.uid() = owner_id);

-- Users can delete their own restaurants
CREATE POLICY "Users can delete own restaurants" ON restaurants
  FOR DELETE USING (auth.uid() = owner_id);
```

Similar RLS policies will be applied to the other tables to ensure data security.

## Indexes

We've already defined several indexes in the table creation scripts above. These indexes are designed to optimize the most common query patterns in the application.

## Relationships

The database schema follows these relationships:

- One profile can have many restaurants (one-to-many)
- One restaurant can have many menus (one-to-many)
- One menu can have many categories (one-to-many)
- One category can have many items (one-to-many)
- One item can have many options (one-to-many)
- One profile can have many subscriptions (one-to-many)
- One restaurant has one subscription (one-to-one)

This schema provides a solid foundation for the MenúFácil application while allowing for future expansion. 
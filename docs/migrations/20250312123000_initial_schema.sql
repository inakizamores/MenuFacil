-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trigger to automatically create a profile when a new user signs up
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

-- Create restaurants table
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

-- Create menus table
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

-- Create categories table
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

-- Create items table
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

-- Create item_options table
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

-- Create subscriptions table
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

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Restaurants policies
CREATE POLICY "Users can read own restaurants" ON restaurants
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own restaurants" ON restaurants
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own restaurants" ON restaurants
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own restaurants" ON restaurants
  FOR DELETE USING (auth.uid() = owner_id);

-- Menus policies
CREATE POLICY "Users can read own menus" ON menus
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menus.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own menus" ON menus
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menus.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own menus" ON menus
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menus.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own menus" ON menus
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = menus.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Categories policies
CREATE POLICY "Users can read own categories" ON categories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM menus
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE menus.id = categories.menu_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own categories" ON categories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM menus
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE menus.id = categories.menu_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own categories" ON categories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM menus
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE menus.id = categories.menu_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own categories" ON categories
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM menus
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE menus.id = categories.menu_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Items policies
CREATE POLICY "Users can read own items" ON items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM categories
      JOIN menus ON menus.id = categories.menu_id
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE categories.id = items.category_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own items" ON items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM categories
      JOIN menus ON menus.id = categories.menu_id
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE categories.id = items.category_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own items" ON items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM categories
      JOIN menus ON menus.id = categories.menu_id
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE categories.id = items.category_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own items" ON items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM categories
      JOIN menus ON menus.id = categories.menu_id
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE categories.id = items.category_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Item options policies
CREATE POLICY "Users can read own item options" ON item_options
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN categories ON categories.id = items.category_id
      JOIN menus ON menus.id = categories.menu_id
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE items.id = item_options.item_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own item options" ON item_options
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM items
      JOIN categories ON categories.id = items.category_id
      JOIN menus ON menus.id = categories.menu_id
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE items.id = item_options.item_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own item options" ON item_options
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN categories ON categories.id = items.category_id
      JOIN menus ON menus.id = categories.menu_id
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE items.id = item_options.item_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own item options" ON item_options
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN categories ON categories.id = items.category_id
      JOIN menus ON menus.id = categories.menu_id
      JOIN restaurants ON restaurants.id = menus.restaurant_id
      WHERE items.id = item_options.item_id
      AND restaurants.owner_id = auth.uid()
    )
  );

-- Subscriptions policies
CREATE POLICY "Users can read own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (
    auth.uid() = profile_id AND
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = subscriptions.restaurant_id
      AND restaurants.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = profile_id);

CREATE POLICY "Users can delete own subscriptions" ON subscriptions
  FOR DELETE USING (auth.uid() = profile_id); 
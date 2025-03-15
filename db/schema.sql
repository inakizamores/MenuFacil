-- MenuFacil Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set up Row Level Security (RLS)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- USERS
-- The profiles table contains user profile information
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  billing_address JSONB,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- RESTAURANTS
CREATE TABLE IF NOT EXISTS restaurants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#4F46E5',
  secondary_color TEXT DEFAULT '#818CF8',
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  social_media JSONB,
  business_hours JSONB,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RESTAURANT TEAM MEMBERS
CREATE TYPE team_role AS ENUM ('owner', 'admin', 'editor', 'viewer');

CREATE TABLE IF NOT EXISTS restaurant_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role team_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (restaurant_id, user_id)
);

-- MENUS
CREATE TABLE IF NOT EXISTS menus (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  is_default BOOLEAN DEFAULT FALSE,
  template_id UUID,
  custom_css TEXT,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MENU CATEGORIES
CREATE TABLE IF NOT EXISTS menu_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MENU ITEMS
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  discounted_price DECIMAL(10, 2),
  image_url TEXT,
  ingredients TEXT[],
  allergens TEXT[],
  nutritional_info JSONB,
  dietary_options TEXT[],
  preparation_time INTEGER, -- In minutes
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  is_favorite BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MENU ITEM VARIANTS (e.g., sizes, options)
CREATE TABLE IF NOT EXISTS menu_item_variants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  price_adjustment DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TEMPLATES
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image_url TEXT,
  html_structure TEXT NOT NULL,
  css_style TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TRANSLATIONS
CREATE TABLE IF NOT EXISTS translations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  entity_id UUID NOT NULL, -- Can reference menu, category, or item
  entity_type TEXT NOT NULL, -- 'menu', 'category', 'item'
  field_name TEXT NOT NULL, -- 'name', 'description', etc.
  language_code TEXT NOT NULL,
  translated_text TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (entity_id, entity_type, field_name, language_code)
);

-- QR CODES
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  custom_design JSONB,
  table_number TEXT,
  unique_views INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TYPE subscription_status AS ENUM ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired');
CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium', 'enterprise');

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  tier subscription_tier NOT NULL DEFAULT 'free',
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ANALYTICS
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
  menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  qr_code_id UUID REFERENCES qr_codes(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create update_updated_at function for triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_restaurants_updated_at
BEFORE UPDATE ON restaurants
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_restaurant_members_updated_at
BEFORE UPDATE ON restaurant_members
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menus_updated_at
BEFORE UPDATE ON menus
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menu_categories_updated_at
BEFORE UPDATE ON menu_categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menu_items_updated_at
BEFORE UPDATE ON menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_menu_item_variants_updated_at
BEFORE UPDATE ON menu_item_variants
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_templates_updated_at
BEFORE UPDATE ON templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_translations_updated_at
BEFORE UPDATE ON translations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_qr_codes_updated_at
BEFORE UPDATE ON qr_codes
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- RLS Policies

-- Profiles: Users can read and update their own profiles
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Automatically create a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, updated_at)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NULL, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Restaurants: Users can CRUD their own restaurants
CREATE POLICY "Users can view their own restaurants"
ON restaurants FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own restaurants"
ON restaurants FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own restaurants"
ON restaurants FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own restaurants"
ON restaurants FOR DELETE
USING (auth.uid() = owner_id);

-- Team members can also view restaurants they belong to
CREATE POLICY "Team members can view restaurants"
ON restaurants FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = restaurants.id
    AND user_id = auth.uid()
    AND is_active = TRUE
  )
);

-- Restaurant Members: Owners can CRUD team members
CREATE POLICY "Owners can view team members"
ON restaurant_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = restaurant_id
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can add team members"
ON restaurant_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = restaurant_id
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can update team members"
ON restaurant_members FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = restaurant_id
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Owners can delete team members"
ON restaurant_members FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = restaurant_id
    AND owner_id = auth.uid()
  )
);

-- Team members can see their own membership
CREATE POLICY "Users can view their own membership"
ON restaurant_members FOR SELECT
USING (user_id = auth.uid());

-- Menus: Owners and admins can CRUD menus
CREATE POLICY "Owners can manage menus"
ON menus FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurants
    WHERE id = restaurant_id
    AND owner_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage menus"
ON menus FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = menus.restaurant_id
    AND user_id = auth.uid()
    AND role IN ('admin')
    AND is_active = TRUE
  )
);

CREATE POLICY "Editors can view and update menus"
ON menus FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = menus.restaurant_id
    AND user_id = auth.uid()
    AND role IN ('editor')
    AND is_active = TRUE
  )
);

CREATE POLICY "Editors can update menus"
ON menus FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = menus.restaurant_id
    AND user_id = auth.uid()
    AND role IN ('editor')
    AND is_active = TRUE
  )
);

CREATE POLICY "Viewers can view menus"
ON menus FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM restaurant_members
    WHERE restaurant_id = menus.restaurant_id
    AND user_id = auth.uid()
    AND role IN ('viewer')
    AND is_active = TRUE
  )
);

-- Similar RLS policies should be created for all other tables
-- focusing on role-based access control and proper data isolation

-- Public menu view policy
CREATE POLICY "Public can view active menus"
ON menus FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Public can view active categories"
ON menu_categories FOR SELECT
USING (is_active = TRUE);

CREATE POLICY "Public can view active menu items"
ON menu_items FOR SELECT
USING (is_active = TRUE);

-- Insert some default templates
INSERT INTO templates (name, description, preview_image_url, html_structure, css_style, is_premium, is_active)
VALUES 
('Simple Elegant', 'A clean, elegant template with focus on readability', '/templates/simple-elegant.jpg', 
 '<div class="menu-container">{{content}}</div>', 
 '.menu-container { max-width: 800px; margin: 0 auto; font-family: "Georgia", serif; }', 
 FALSE, TRUE),
('Modern Bold', 'A modern template with bold typography and colors', '/templates/modern-bold.jpg', 
 '<div class="menu-container modern">{{content}}</div>', 
 '.menu-container.modern { max-width: 1000px; margin: 0 auto; font-family: "Helvetica", sans-serif; font-weight: bold; }', 
 FALSE, TRUE),
('Rustic', 'A rustic, traditional look for classic restaurants', '/templates/rustic.jpg', 
 '<div class="menu-container rustic">{{content}}</div>', 
 '.menu-container.rustic { max-width: 800px; margin: 0 auto; font-family: "Courier New", monospace; background-color: #f9f5eb; }', 
 FALSE, TRUE),
('Premium Luxury', 'An upscale design for fine dining establishments', '/templates/premium-luxury.jpg', 
 '<div class="menu-container luxury">{{content}}</div>', 
 '.menu-container.luxury { max-width: 800px; margin: 0 auto; font-family: "Didot", serif; color: #333; background-color: #f8f8f8; border: 2px solid #d4af37; }', 
 TRUE, TRUE); 
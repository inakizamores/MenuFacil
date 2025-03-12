-- Storage bucket policies for MenúFácil

-- Create the required storage buckets if they don't exist
INSERT INTO storage.buckets (id, name) VALUES ('avatars', 'avatars')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name) VALUES ('restaurant-images', 'restaurant-images')
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name) VALUES ('menu-images', 'menu-images')
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Avatars bucket policies
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Restaurant images bucket policies
CREATE POLICY "Public can read restaurant images"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurant-images');

CREATE POLICY "Restaurant owners can upload restaurant images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurant-images' AND 
  (
    SELECT owner_id = auth.uid() 
    FROM restaurants 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Restaurant owners can update restaurant images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurant-images' AND 
  (
    SELECT owner_id = auth.uid() 
    FROM restaurants 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Restaurant owners can delete restaurant images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurant-images' AND 
  (
    SELECT owner_id = auth.uid() 
    FROM restaurants 
    WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Menu images bucket policies
CREATE POLICY "Public can read menu images"
ON storage.objects FOR SELECT
USING (bucket_id = 'menu-images');

CREATE POLICY "Restaurant owners can upload menu images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'menu-images' AND 
  (
    SELECT r.owner_id = auth.uid() 
    FROM restaurants r
    JOIN menus m ON r.id = m.restaurant_id
    JOIN categories c ON m.id = c.menu_id
    JOIN items i ON c.id = i.category_id
    WHERE i.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Restaurant owners can update menu images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'menu-images' AND 
  (
    SELECT r.owner_id = auth.uid() 
    FROM restaurants r
    JOIN menus m ON r.id = m.restaurant_id
    JOIN categories c ON m.id = c.menu_id
    JOIN items i ON c.id = i.category_id
    WHERE i.id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "Restaurant owners can delete menu images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'menu-images' AND 
  (
    SELECT r.owner_id = auth.uid() 
    FROM restaurants r
    JOIN menus m ON r.id = m.restaurant_id
    JOIN categories c ON m.id = c.menu_id
    JOIN items i ON c.id = i.category_id
    WHERE i.id::text = (storage.foldername(name))[1]
  )
); 
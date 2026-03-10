-- =========================================================
-- ROOM FINDER - Supabase SQL Setup
-- Run this in Supabase SQL Editor
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. USERS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'owner', 'admin')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =========================================================
-- 2. ROOMS TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  rent_price NUMERIC NOT NULL CHECK (rent_price >= 0),
  location TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT '',
  room_type TEXT NOT NULL DEFAULT 'Single Room',
  amenities TEXT[] DEFAULT '{}',
  num_beds INTEGER NOT NULL DEFAULT 1 CHECK (num_beds >= 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_rooms_owner ON public.rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_city ON public.rooms(city);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON public.rooms(is_available);

-- =========================================================
-- 3. ROOM IMAGES TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.room_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_room_images_room ON public.room_images(room_id);

-- =========================================================
-- 4. FAVORITES TABLE
-- =========================================================
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, room_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_room ON public.favorites(room_id);

-- =========================================================
-- 5. AUTO-CREATE USER PROFILE ON SIGNUP
-- =========================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'citizen')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =========================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- =========================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- DROP existing policies if re-running
DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Service role can manage users" ON public.users;
DROP POLICY IF EXISTS "Anyone can read rooms" ON public.rooms;
DROP POLICY IF EXISTS "Owners can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Owners can update own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Owners can delete own rooms" ON public.rooms;
DROP POLICY IF EXISTS "Admins can delete any room" ON public.rooms;
DROP POLICY IF EXISTS "Anyone can read room images" ON public.room_images;
DROP POLICY IF EXISTS "Owners can manage images for own rooms" ON public.room_images;
DROP POLICY IF EXISTS "Users can read own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON public.favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON public.favorites;

-- USERS policies
CREATE POLICY "Users can read all profiles"
  ON public.users FOR SELECT USING (TRUE);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage users"
  ON public.users FOR ALL USING (TRUE)
  WITH CHECK (TRUE);

-- ROOMS policies
CREATE POLICY "Anyone can read rooms"
  ON public.rooms FOR SELECT USING (TRUE);

CREATE POLICY "Owners can insert rooms"
  ON public.rooms FOR INSERT WITH CHECK (
    auth.uid() = owner_id AND
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'owner')
  );

CREATE POLICY "Owners can update own rooms"
  ON public.rooms FOR UPDATE USING (
    auth.uid() = owner_id
  );

CREATE POLICY "Owners can delete own rooms"
  ON public.rooms FOR DELETE USING (
    auth.uid() = owner_id OR
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ROOM IMAGES policies
CREATE POLICY "Anyone can read room images"
  ON public.room_images FOR SELECT USING (TRUE);

CREATE POLICY "Owners can manage images for own rooms"
  ON public.room_images FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.rooms
      WHERE id = room_id AND owner_id = auth.uid()
    )
  );

-- FAVORITES policies
CREATE POLICY "Users can read own favorites"
  ON public.favorites FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON public.favorites FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON public.favorites FOR DELETE USING (auth.uid() = user_id);

-- =========================================================
-- 7. SUPABASE STORAGE
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Public can read room images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload room images" ON storage.objects;
DROP POLICY IF EXISTS "Owners can delete own images" ON storage.objects;

CREATE POLICY "Public can read room images"
  ON storage.objects FOR SELECT USING (bucket_id = 'room-images');

CREATE POLICY "Authenticated users can upload room images"
  ON storage.objects FOR INSERT WITH CHECK (
    bucket_id = 'room-images' AND auth.role() = 'authenticated'
  );

CREATE POLICY "Owners can delete own images"
  ON storage.objects FOR DELETE USING (
    bucket_id = 'room-images' AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- =========================================================
-- 8. SAMPLE DATA (Optional - comment out if not needed)
-- =========================================================
-- To create an admin user, sign up normally then run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';

-- =========================================================
-- DONE! Your RoomFinder database is ready.
-- =========================================================

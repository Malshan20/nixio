-- Nixio Database Schema
-- Run this script to set up all required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (auto-created on signup)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free' | 'pro'
  generations_used INTEGER NOT NULL DEFAULT 0,
  generations_limit INTEGER NOT NULL DEFAULT 10,
  polar_customer_id TEXT,
  polar_subscription_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "projects_select_own" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert_own" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update_own" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete_own" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Ideas table
CREATE TABLE IF NOT EXISTS public.ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  demand_score INTEGER DEFAULT 0,
  monetization_score INTEGER DEFAULT 0,
  difficulty_score INTEGER DEFAULT 0,
  skills TEXT,
  interests TEXT,
  target_audience TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.ideas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ideas_select_own" ON public.ideas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ideas_insert_own" ON public.ideas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ideas_update_own" ON public.ideas FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "ideas_delete_own" ON public.ideas FOR DELETE USING (auth.uid() = user_id);

-- Products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  idea_id UUID REFERENCES public.ideas(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  transformation_before TEXT,
  transformation_after TEXT,
  audience TEXT,
  desired_outcome TEXT,
  modules JSONB,
  frameworks JSONB,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_select_own" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "products_insert_own" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "products_update_own" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "products_delete_own" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- Contents table
CREATE TABLE IF NOT EXISTS public.contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  module_name TEXT,
  lesson_name TEXT,
  full_content TEXT,
  bullet_summaries JSONB,
  action_steps JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contents_select_own" ON public.contents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "contents_insert_own" ON public.contents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "contents_update_own" ON public.contents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "contents_delete_own" ON public.contents FOR DELETE USING (auth.uid() = user_id);

-- Assets (PDF exports etc.)
CREATE TABLE IF NOT EXISTS public.assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'ebook' | 'workbook' | 'checklist'
  content JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assets_select_own" ON public.assets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "assets_insert_own" ON public.assets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "assets_delete_own" ON public.assets FOR DELETE USING (auth.uid() = user_id);

-- Funnels table
CREATE TABLE IF NOT EXISTS public.funnels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  product_name TEXT,
  headline TEXT,
  offer TEXT,
  pricing_suggestion TEXT,
  cta TEXT,
  email_sequence JSONB,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.funnels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "funnels_select_own" ON public.funnels FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "funnels_insert_own" ON public.funnels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "funnels_update_own" ON public.funnels FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "funnels_delete_own" ON public.funnels FOR DELETE USING (auth.uid() = user_id);

-- Chat messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  role TEXT NOT NULL, -- 'user' | 'assistant'
  content TEXT NOT NULL,
  agent_mode TEXT DEFAULT 'strategist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "chat_select_own" ON public.chat_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "chat_insert_own" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "chat_delete_own" ON public.chat_messages FOR DELETE USING (auth.uid() = user_id);

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

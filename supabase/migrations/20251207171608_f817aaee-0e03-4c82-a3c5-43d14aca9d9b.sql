-- 1. Create obradores table
CREATE TABLE public.obradores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.obradores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their obrador" ON public.obradores
  FOR SELECT USING (true);

-- 2. Create app_role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'operario');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'operario',
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- 3. Create has_role security definer function
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 4. Add obrador_id to profiles
ALTER TABLE public.profiles ADD COLUMN obrador_id UUID REFERENCES public.obradores(id);

-- 5. Add obrador_id to entry_lots
ALTER TABLE public.entry_lots ADD COLUMN obrador_id UUID REFERENCES public.obradores(id);

-- 6. Add obrador_id to production_batches
ALTER TABLE public.production_batches ADD COLUMN obrador_id UUID REFERENCES public.obradores(id);

-- 7. Add obrador_id to output_lots
ALTER TABLE public.output_lots ADD COLUMN obrador_id UUID REFERENCES public.obradores(id);

-- 8. Add obrador_id to stock_movements
ALTER TABLE public.stock_movements ADD COLUMN obrador_id UUID REFERENCES public.obradores(id);

-- 9. Create function to get user's obrador_id
CREATE OR REPLACE FUNCTION public.get_user_obrador_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT obrador_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- 10. Drop existing RLS policies and create new ones with obrador filtering

-- entry_lots policies
DROP POLICY IF EXISTS "Users can insert entry lots" ON public.entry_lots;
DROP POLICY IF EXISTS "Users can view all entry lots" ON public.entry_lots;

CREATE POLICY "Users can view obrador entry lots" ON public.entry_lots
  FOR SELECT USING (obrador_id = public.get_user_obrador_id(auth.uid()) OR obrador_id IS NULL);

CREATE POLICY "Users can insert entry lots" ON public.entry_lots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete entry lots" ON public.entry_lots
  FOR DELETE USING (public.has_role(auth.uid(), 'admin') AND (obrador_id = public.get_user_obrador_id(auth.uid()) OR obrador_id IS NULL));

-- production_batches policies
DROP POLICY IF EXISTS "Users can insert production batches" ON public.production_batches;
DROP POLICY IF EXISTS "Users can view all production batches" ON public.production_batches;

CREATE POLICY "Users can view obrador production batches" ON public.production_batches
  FOR SELECT USING (obrador_id = public.get_user_obrador_id(auth.uid()) OR obrador_id IS NULL);

CREATE POLICY "Users can insert production batches" ON public.production_batches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete production batches" ON public.production_batches
  FOR DELETE USING (public.has_role(auth.uid(), 'admin') AND (obrador_id = public.get_user_obrador_id(auth.uid()) OR obrador_id IS NULL));

-- output_lots policies
DROP POLICY IF EXISTS "Users can insert output lots" ON public.output_lots;
DROP POLICY IF EXISTS "Users can view all output lots" ON public.output_lots;

CREATE POLICY "Users can view obrador output lots" ON public.output_lots
  FOR SELECT USING (obrador_id = public.get_user_obrador_id(auth.uid()) OR obrador_id IS NULL);

CREATE POLICY "Users can insert output lots" ON public.output_lots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete output lots" ON public.output_lots
  FOR DELETE USING (public.has_role(auth.uid(), 'admin') AND (obrador_id = public.get_user_obrador_id(auth.uid()) OR obrador_id IS NULL));

-- stock_movements policies
DROP POLICY IF EXISTS "Users can insert stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Users can view all stock movements" ON public.stock_movements;

CREATE POLICY "Users can view obrador stock movements" ON public.stock_movements
  FOR SELECT USING (obrador_id = public.get_user_obrador_id(auth.uid()) OR obrador_id IS NULL);

CREATE POLICY "Users can insert stock movements" ON public.stock_movements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can delete stock movements" ON public.stock_movements
  FOR DELETE USING (public.has_role(auth.uid(), 'admin') AND (obrador_id = public.get_user_obrador_id(auth.uid()) OR obrador_id IS NULL));
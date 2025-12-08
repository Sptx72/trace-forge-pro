-- Drop existing SELECT policies that filter by obrador_id
DROP POLICY IF EXISTS "Users can view obrador entry lots" ON public.entry_lots;
DROP POLICY IF EXISTS "Users can view obrador production batches" ON public.production_batches;
DROP POLICY IF EXISTS "Users can view obrador output lots" ON public.output_lots;
DROP POLICY IF EXISTS "Users can view obrador stock movements" ON public.stock_movements;

-- Drop existing DELETE policies
DROP POLICY IF EXISTS "Admins can delete entry lots" ON public.entry_lots;
DROP POLICY IF EXISTS "Admins can delete production batches" ON public.production_batches;
DROP POLICY IF EXISTS "Admins can delete output lots" ON public.output_lots;
DROP POLICY IF EXISTS "Admins can delete stock movements" ON public.stock_movements;

-- Create new SELECT policies filtering by user_id
CREATE POLICY "Users can view their own entry lots"
ON public.entry_lots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own production batches"
ON public.production_batches FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own output lots"
ON public.output_lots FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own stock movements"
ON public.stock_movements FOR SELECT
USING (auth.uid() = user_id);

-- Recreate DELETE policies for admins (still user-scoped)
CREATE POLICY "Admins can delete their own entry lots"
ON public.entry_lots FOR DELETE
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins can delete their own production batches"
ON public.production_batches FOR DELETE
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins can delete their own output lots"
ON public.output_lots FOR DELETE
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);

CREATE POLICY "Admins can delete their own stock movements"
ON public.stock_movements FOR DELETE
USING (has_role(auth.uid(), 'admin') AND auth.uid() = user_id);
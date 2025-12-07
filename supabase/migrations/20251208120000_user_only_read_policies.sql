-- Ajustar políticas de lectura para filtrar por user_id
-- Esta migración reemplaza las políticas previas basadas en obrador para limitar la lectura a los registros del usuario autenticado.

-- entry_lots
DROP POLICY IF EXISTS "Users can view obrador entry lots" ON public.entry_lots;
DROP POLICY IF EXISTS "Users read only their entry lots" ON public.entry_lots;
CREATE POLICY "Users read only their entry lots" ON public.entry_lots
  FOR SELECT USING (user_id = auth.uid());

-- production_batches
DROP POLICY IF EXISTS "Users can view obrador production batches" ON public.production_batches;
DROP POLICY IF EXISTS "Users read only their production batches" ON public.production_batches;
CREATE POLICY "Users read only their production batches" ON public.production_batches
  FOR SELECT USING (user_id = auth.uid());

-- output_lots
DROP POLICY IF EXISTS "Users can view obrador output lots" ON public.output_lots;
DROP POLICY IF EXISTS "Users read only their output lots" ON public.output_lots;
CREATE POLICY "Users read only their output lots" ON public.output_lots
  FOR SELECT USING (user_id = auth.uid());

-- stock_movements
DROP POLICY IF EXISTS "Users can view obrador stock movements" ON public.stock_movements;
DROP POLICY IF EXISTS "Users read only their stock movements" ON public.stock_movements;
CREATE POLICY "Users read only their stock movements" ON public.stock_movements
  FOR SELECT USING (user_id = auth.uid());

-- Create stock_movements table to track all stock changes
CREATE TABLE public.stock_movements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lot_number TEXT NOT NULL,
  lot_type TEXT NOT NULL CHECK (lot_type IN ('entry', 'production')),
  source_lot_id UUID NOT NULL,
  movement_type TEXT NOT NULL CHECK (movement_type IN ('positive', 'negative')),
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'kg',
  reference_type TEXT, -- 'production' or 'output'
  reference_id UUID, -- production_batch_id or output_lot_id
  product TEXT NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can insert stock movements"
ON public.stock_movements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view all stock movements"
ON public.stock_movements
FOR SELECT
USING (true);

-- Create a view for current stock balances
CREATE OR REPLACE VIEW public.stock_balances AS
SELECT 
  source_lot_id,
  lot_number,
  lot_type,
  product,
  unit,
  SUM(CASE WHEN movement_type = 'positive' THEN quantity ELSE -quantity END) as available_balance
FROM public.stock_movements
GROUP BY source_lot_id, lot_number, lot_type, product, unit
HAVING SUM(CASE WHEN movement_type = 'positive' THEN quantity ELSE -quantity END) >= 0;
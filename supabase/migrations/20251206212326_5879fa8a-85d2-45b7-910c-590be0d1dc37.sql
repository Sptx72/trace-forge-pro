-- Drop and recreate the view with security invoker
DROP VIEW IF EXISTS public.stock_balances;

CREATE VIEW public.stock_balances 
WITH (security_invoker = true) AS
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
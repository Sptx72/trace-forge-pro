-- Production batches table
CREATE TABLE public.production_batches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  batch_number TEXT NOT NULL,
  product TEXT NOT NULL,
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'unidades',
  operator TEXT NOT NULL,
  input_lot_ids UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Output lots table
CREATE TABLE public.output_lots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lot_number TEXT NOT NULL,
  production_batch_id UUID REFERENCES public.production_batches(id),
  quantity NUMERIC NOT NULL,
  unit TEXT NOT NULL DEFAULT 'unidades',
  destination TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.output_lots ENABLE ROW LEVEL SECURITY;

-- Production batches policies
CREATE POLICY "Users can view all production batches"
ON public.production_batches FOR SELECT
USING (true);

CREATE POLICY "Users can insert production batches"
ON public.production_batches FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Output lots policies
CREATE POLICY "Users can view all output lots"
ON public.output_lots FOR SELECT
USING (true);

CREATE POLICY "Users can insert output lots"
ON public.output_lots FOR INSERT
WITH CHECK (auth.uid() = user_id);
import { supabase } from '@/integrations/supabase/client';

export interface StockBalance {
  source_lot_id: string;
  lot_number: string;
  lot_type: 'entry' | 'production';
  product: string;
  unit: string;
  available_balance: number;
}

export interface StockMovementInput {
  lot_number: string;
  lot_type: 'entry' | 'production';
  source_lot_id: string;
  movement_type: 'positive' | 'negative';
  quantity: number;
  unit: string;
  product: string;
  user_id: string;
  obrador_id?: string | null;
  reference_type?: 'production' | 'output';
  reference_id?: string;
}

// Helper to get user's obrador_id
const getUserObradorId = async (userId: string): Promise<string | null> => {
  const { data } = await supabase
    .from('profiles')
    .select('obrador_id')
    .eq('user_id', userId)
    .single();
  return data?.obrador_id || null;
};

export const useStock = () => {
  // Fetch all stock balances for the current user
  const fetchStockBalances = async (userId: string): Promise<StockBalance[]> => {
    const { data, error } = await supabase
      .from('stock_movements')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching stock balances:', error);
      throw error;
    }

    const balances = new Map<string, StockBalance>();

    (data || []).forEach(item => {
      const key = item.source_lot_id;
      const existing = balances.get(key);
      const delta = item.movement_type === 'positive' ? Number(item.quantity) : -Number(item.quantity);

      if (existing) {
        existing.available_balance += delta;
      } else {
        balances.set(key, {
          source_lot_id: item.source_lot_id,
          lot_number: item.lot_number,
          lot_type: item.lot_type as 'entry' | 'production',
          product: item.product,
          unit: item.unit,
          available_balance: delta,
        });
      }
    });

    return Array.from(balances.values()).filter(item => item.available_balance >= 0);
  };

  // Fetch entry lots with available stock (for production)
  const fetchAvailableEntryLots = async (userId: string): Promise<StockBalance[]> => {
    const balances = await fetchStockBalances(userId);
    return balances.filter(b => b.lot_type === 'entry' && b.available_balance > 0);
  };

  // Fetch production batches with available stock (for output)
  const fetchAvailableProductionBatches = async (userId: string): Promise<StockBalance[]> => {
    const balances = await fetchStockBalances(userId);
    return balances.filter(b => b.lot_type === 'production' && b.available_balance > 0);
  };

  // Create a stock movement
  const createStockMovement = async (movement: StockMovementInput) => {
    const { error } = await supabase
      .from('stock_movements')
      .insert(movement);

    if (error) {
      console.error('Error creating stock movement:', error);
      throw error;
    }
  };

  // Create positive stock movement for new entry lot
  const registerEntryStock = async (
    entryLotId: string,
    lotNumber: string,
    product: string,
    quantity: number,
    unit: string,
    userId: string
  ) => {
    const obradorId = await getUserObradorId(userId);
    await createStockMovement({
      lot_number: lotNumber,
      lot_type: 'entry',
      source_lot_id: entryLotId,
      movement_type: 'positive',
      quantity,
      unit,
      product,
      user_id: userId,
      obrador_id: obradorId,
    });
  };

  // Create positive stock movement for new production batch
  const registerProductionStock = async (
    productionBatchId: string,
    batchNumber: string,
    product: string,
    quantity: number,
    unit: string,
    userId: string
  ) => {
    const obradorId = await getUserObradorId(userId);
    await createStockMovement({
      lot_number: batchNumber,
      lot_type: 'production',
      source_lot_id: productionBatchId,
      movement_type: 'positive',
      quantity,
      unit,
      product,
      user_id: userId,
      obrador_id: obradorId,
    });
  };

  // Consume stock from entry lots (for production)
  const consumeEntryStock = async (
    consumptions: Array<{ lotId: string; lotNumber: string; product: string; quantity: number; unit: string }>,
    productionBatchId: string,
    userId: string
  ) => {
    const obradorId = await getUserObradorId(userId);
    for (const consumption of consumptions) {
      await createStockMovement({
        lot_number: consumption.lotNumber,
        lot_type: 'entry',
        source_lot_id: consumption.lotId,
        movement_type: 'negative',
        quantity: consumption.quantity,
        unit: consumption.unit,
        product: consumption.product,
        user_id: userId,
        obrador_id: obradorId,
        reference_type: 'production',
        reference_id: productionBatchId,
      });
    }
  };

  // Consume stock from production batch (for output)
  const consumeProductionStock = async (
    productionBatchId: string,
    lotNumber: string,
    product: string,
    quantity: number,
    unit: string,
    outputLotId: string,
    userId: string
  ) => {
    const obradorId = await getUserObradorId(userId);
    await createStockMovement({
      lot_number: lotNumber,
      lot_type: 'production',
      source_lot_id: productionBatchId,
      movement_type: 'negative',
      quantity,
      unit,
      product,
      user_id: userId,
      obrador_id: obradorId,
      reference_type: 'output',
      reference_id: outputLotId,
    });
  };

  return {
    fetchStockBalances,
    fetchAvailableEntryLots,
    fetchAvailableProductionBatches,
    createStockMovement,
    registerEntryStock,
    registerProductionStock,
    consumeEntryStock,
    consumeProductionStock,
  };
};

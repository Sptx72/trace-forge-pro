import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useUserRole } from './useUserRole';
import { useAuth } from './useAuth';

export type RecordType = 'all' | 'entry' | 'production' | 'output';

export interface DisplayRecord {
  id: string;
  type: 'entry' | 'production' | 'output';
  lotNumber: string;
  product: string;
  quantity: number;
  unit: string;
  date: Date;
  supplier?: string;
  operator?: string;
  destination?: string;
}

export function useTraceabilityRecords() {
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  const { user } = useAuth();
  const [records, setRecords] = useState<DisplayRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllRecords = useCallback(async () => {
    if (!user) {
      setRecords([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [entryRes, prodRes, outputRes] = await Promise.all([
        supabase
          .from('entry_lots')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('production_batches')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('output_lots')
          .select('*, production_batches(product)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      const allRecords: DisplayRecord[] = [];

      (entryRes.data || []).forEach(lot => {
        allRecords.push({
          id: lot.id,
          type: 'entry',
          lotNumber: lot.lot_number,
          product: lot.product,
          quantity: lot.quantity,
          unit: lot.unit,
          date: new Date(lot.created_at),
          supplier: lot.supplier,
        });
      });

      (prodRes.data || []).forEach(batch => {
        allRecords.push({
          id: batch.id,
          type: 'production',
          lotNumber: batch.batch_number,
          product: batch.product,
          quantity: batch.quantity,
          unit: batch.unit,
          date: new Date(batch.created_at),
          operator: batch.operator,
        });
      });

      (outputRes.data || []).forEach(lot => {
        const productName = lot.production_batches?.product || '';
        allRecords.push({
          id: lot.id,
          type: 'output',
          lotNumber: lot.lot_number,
          product: productName,
          quantity: lot.quantity,
          unit: lot.unit,
          date: new Date(lot.created_at),
          destination: lot.destination,
        });
      });

      // Sort by date descending
      allRecords.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecords(allRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los registros",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast, user]);

  const deleteRecord = useCallback(async (record: DisplayRecord): Promise<boolean> => {
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Solo los administradores pueden eliminar registros",
        variant: "destructive",
      });
      return false;
    }

    try {
      let error;
      
      switch (record.type) {
        case 'entry':
          ({ error } = await supabase.from('entry_lots').delete().eq('id', record.id));
          // Also delete related stock movements
          await supabase.from('stock_movements').delete().eq('source_lot_id', record.id);
          break;
        case 'production':
          ({ error } = await supabase.from('production_batches').delete().eq('id', record.id));
          await supabase.from('stock_movements').delete().eq('source_lot_id', record.id);
          break;
        case 'output':
          ({ error } = await supabase.from('output_lots').delete().eq('id', record.id));
          await supabase.from('stock_movements').delete().eq('reference_id', record.id);
          break;
      }

      if (error) throw error;

      toast({
        title: "Registro eliminado",
        description: `${record.lotNumber} ha sido eliminado correctamente`,
      });

      // Refresh records
      await fetchAllRecords();
      return true;
    } catch (error) {
      console.error('Error deleting record:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el registro",
        variant: "destructive",
      });
      return false;
    }
  }, [isAdmin, toast, fetchAllRecords]);

  useEffect(() => {
    fetchAllRecords();
  }, [fetchAllRecords]);

  return {
    records,
    loading,
    isAdmin,
    refetch: fetchAllRecords,
    deleteRecord,
  };
}

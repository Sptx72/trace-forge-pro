import { useState, useCallback } from 'react';
import { EntryLot, ProductionBatch, OutputLot, TraceabilityRecord } from '@/types/traceability';

// Mock data for demonstration
const mockEntryLots: EntryLot[] = [
  {
    id: '1',
    lotNumber: 'ENT-2024-001',
    product: 'Harina de Trigo T-55',
    supplier: 'Molinos del Sur S.A.',
    quantity: 500,
    unit: 'kg',
    entryDate: new Date('2024-01-15'),
    barcode: '8412345678901',
    status: 'verified',
  },
  {
    id: '2',
    lotNumber: 'ENT-2024-002',
    product: 'Azúcar Blanco',
    supplier: 'Azucarera Nacional',
    quantity: 200,
    unit: 'kg',
    entryDate: new Date('2024-01-16'),
    barcode: '8412345678902',
    status: 'verified',
  },
  {
    id: '3',
    lotNumber: 'ENT-2024-003',
    product: 'Levadura Fresca',
    supplier: 'Levaduras Premium',
    quantity: 50,
    unit: 'kg',
    entryDate: new Date('2024-01-17'),
    barcode: '8412345678903',
    status: 'pending',
  },
];

const mockProductionBatches: ProductionBatch[] = [
  {
    id: '1',
    batchNumber: 'PROD-2024-001',
    product: 'Pan de Molde Integral',
    inputLots: ['1', '2'],
    outputQuantity: 300,
    unit: 'unidades',
    productionDate: new Date('2024-01-18'),
    operator: 'Juan García',
    status: 'completed',
  },
];

const mockOutputLots: OutputLot[] = [
  {
    id: '1',
    lotNumber: 'SAL-2024-001',
    product: 'Pan de Molde Integral',
    productionBatchId: '1',
    quantity: 150,
    unit: 'unidades',
    outputDate: new Date('2024-01-19'),
    destination: 'Supermercados Norte',
    status: 'shipped',
  },
];

export function useTraceability() {
  const [entryLots, setEntryLots] = useState<EntryLot[]>(mockEntryLots);
  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>(mockProductionBatches);
  const [outputLots, setOutputLots] = useState<OutputLot[]>(mockOutputLots);

  const addEntryLot = useCallback((lot: Omit<EntryLot, 'id'>) => {
    const newLot: EntryLot = {
      ...lot,
      id: Date.now().toString(),
    };
    setEntryLots(prev => [newLot, ...prev]);
    return newLot;
  }, []);

  const addProductionBatch = useCallback((batch: Omit<ProductionBatch, 'id'>) => {
    const newBatch: ProductionBatch = {
      ...batch,
      id: Date.now().toString(),
    };
    setProductionBatches(prev => [newBatch, ...prev]);
    
    // Mark used lots
    setEntryLots(prev => 
      prev.map(lot => 
        batch.inputLots.includes(lot.id) 
          ? { ...lot, status: 'used' as const }
          : lot
      )
    );
    
    return newBatch;
  }, []);

  const addOutputLot = useCallback((lot: Omit<OutputLot, 'id'>) => {
    const newLot: OutputLot = {
      ...lot,
      id: Date.now().toString(),
    };
    setOutputLots(prev => [newLot, ...prev]);
    return newLot;
  }, []);

  const getAllRecords = useCallback((): TraceabilityRecord[] => {
    const records: TraceabilityRecord[] = [
      ...entryLots.map(lot => ({
        id: lot.id,
        type: 'entry' as const,
        lotNumber: lot.lotNumber,
        product: lot.product,
        date: lot.entryDate,
        status: lot.status,
        details: lot,
      })),
      ...productionBatches.map(batch => ({
        id: batch.id,
        type: 'production' as const,
        lotNumber: batch.batchNumber,
        product: batch.product,
        date: batch.productionDate,
        status: batch.status,
        details: batch,
      })),
      ...outputLots.map(lot => ({
        id: lot.id,
        type: 'output' as const,
        lotNumber: lot.lotNumber,
        product: lot.product,
        date: lot.outputDate,
        status: lot.status,
        details: lot,
      })),
    ];
    
    return records.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entryLots, productionBatches, outputLots]);

  const getTraceabilityChain = useCallback((lotNumber: string) => {
    // Find the record
    const record = getAllRecords().find(r => r.lotNumber === lotNumber);
    if (!record) return null;

    const chain: TraceabilityRecord[] = [];

    if (record.type === 'entry') {
      chain.push(record);
      // Find production batches that used this lot
      const relatedProductions = productionBatches.filter(b => 
        b.inputLots.includes(record.id)
      );
      relatedProductions.forEach(batch => {
        chain.push({
          id: batch.id,
          type: 'production',
          lotNumber: batch.batchNumber,
          product: batch.product,
          date: batch.productionDate,
          status: batch.status,
          details: batch,
        });
        // Find outputs from these batches
        const relatedOutputs = outputLots.filter(o => o.productionBatchId === batch.id);
        relatedOutputs.forEach(output => {
          chain.push({
            id: output.id,
            type: 'output',
            lotNumber: output.lotNumber,
            product: output.product,
            date: output.outputDate,
            status: output.status,
            details: output,
          });
        });
      });
    }

    return chain;
  }, [getAllRecords, productionBatches, outputLots]);

  return {
    entryLots,
    productionBatches,
    outputLots,
    addEntryLot,
    addProductionBatch,
    addOutputLot,
    getAllRecords,
    getTraceabilityChain,
  };
}

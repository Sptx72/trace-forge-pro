export interface EntryLot {
  id: string;
  lotNumber: string;
  product: string;
  supplier: string;
  quantity: number;
  unit: string;
  entryDate: Date;
  deliveryNotePhoto?: string;
  barcode?: string;
  status: 'pending' | 'verified' | 'used' | 'rejected';
}

export interface ProductionBatch {
  id: string;
  batchNumber: string;
  product: string;
  inputLots: string[]; // IDs of entry lots used
  outputQuantity: number;
  unit: string;
  productionDate: Date;
  operator: string;
  status: 'in-progress' | 'completed' | 'quality-check';
}

export interface OutputLot {
  id: string;
  lotNumber: string;
  product: string;
  productionBatchId: string;
  quantity: number;
  unit: string;
  outputDate: Date;
  destination: string;
  status: 'ready' | 'shipped' | 'delivered';
}

export interface TraceabilityRecord {
  id: string;
  type: 'entry' | 'production' | 'output';
  lotNumber: string;
  product: string;
  date: Date;
  status: string;
  details: EntryLot | ProductionBatch | OutputLot;
}

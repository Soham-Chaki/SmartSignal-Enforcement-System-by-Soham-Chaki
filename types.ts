
export enum SignalState {
  RED = 'RED',
  YELLOW = 'YELLOW',
  GREEN = 'GREEN'
}

export interface Vehicle {
  id: string;
  plate: string;
  type: 'Sedan' | 'SUV' | 'Truck' | 'Motorcycle';
  color: string;
}

export interface DetectionEvent {
  id: string;
  vehicle: Vehicle;
  timestamp: number;
  pole: 1 | 2;
  signalAtTime: SignalState;
  snapshotUrl: string;
}

export interface Violation {
  id: string;
  vehicle: Vehicle;
  startTime: number;
  endTime: number;
  status: 'PENDING' | 'CONFIRMED' | 'DISMISSED';
  pole1Evidence: string;
  pole2Evidence: string;
  aiJustification?: string;
}

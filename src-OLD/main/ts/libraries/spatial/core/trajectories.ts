import { ReferenceFrame } from '../propagators/propagation';

export interface PropagationOptions {
  stepMs?: number;
  frame?: ReferenceFrame;
  computeAttitude?: boolean;
  computeCovariance?: boolean;
}

export interface PropagationQuality {
  estimatedPositionErrorKm?: number;
  estimatedVelocityErrorKmS?: number;
  source: 'SGP4' | 'OREKIT' | 'NUMERICAL';
  confidence?: number;
}

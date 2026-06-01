import { CovarianceMatrix, ReferenceFrame } from '../propagators/propagation';

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface Quaternion {
  x: number;
  y: number;
  z: number;
  w: number;
}

export interface OrbitState {
  time: Date;
  frame: ReferenceFrame;
  position: Vector3;
  velocity: Vector3;
  orientation?: Quaternion;
  covariance?: CovarianceMatrix;
  metadata?: Record<string, unknown>;
}

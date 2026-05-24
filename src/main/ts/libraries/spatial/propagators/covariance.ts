import { OrbitState } from '../core/spatial-math';
import { CovarianceMatrix } from './propagation';

export interface CovarianceProvider {
  computeCovariance(state: OrbitState): CovarianceMatrix;
}

export class SimpleSGP4CovarianceProvider implements CovarianceProvider {
  computeCovariance(state: OrbitState): CovarianceMatrix {
    return {
      frame: state.frame,

      values: new Float64Array(),
      /*
      [
        ([1, 0, 0, 0, 0, 0],
        [0, 1, 0, 0, 0, 0],
        [0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0.01, 0, 0],
        [0, 0, 0, 0, 0.01, 0],
        [0, 0, 0, 0, 0, 0.01]),
      ]
      */
    };
  }
}

// attitude/AttitudeProvider.ts
import { OrbitState, Quaternion } from '../core/spatial-math';

export class NadirPointingAttitudeProvider implements AttitudeProvider {
  computeOrientation(_state: OrbitState): Quaternion {
    // Simplified placeholder
    // Replace with real LVLH quaternion computation

    return {
      x: 0,
      y: 0,
      z: 0,
      w: 1,
    };
  }
}

export interface AttitudeProvider {
  computeOrientation(state: OrbitState): Quaternion;
}

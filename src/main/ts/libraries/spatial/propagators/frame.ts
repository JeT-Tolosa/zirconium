// frames/IdentityFrameTransformer.ts

import { OrbitState } from '../core/spatial-math';
import { ReferenceFrame } from './propagation';

export interface FrameTransformer {
  transform(state: OrbitState, targetFrame: ReferenceFrame): OrbitState;
}

export class IdentityFrameTransformer implements FrameTransformer {
  transform(state: OrbitState, targetFrame: ReferenceFrame): OrbitState {
    return {
      ...state,
      frame: targetFrame,
    };
  }
}

import {
  VizCubeSampleThreeJS,
  VizCubeSampleThreeJSState,
} from './viz-eye-cube-sample-threeJS';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

export class VizCubeSampleThreeJSFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizCubeSampleThreeJS.CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
    );
  }

  public override async createObject(
    state: VizCubeSampleThreeJSState,
  ): Promise<VizCubeSampleThreeJS> {
    return new VizCubeSampleThreeJS(state);
  }
}

import {
  VizCubeSampleThreeJS,
  VizCubeSampleThreeJSState,
} from './viz-eye-cube-sample-threeJS';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

async function createObject(
  state: VizCubeSampleThreeJSState,
): Promise<VizCubeSampleThreeJS> {
  const instance = new VizCubeSampleThreeJS();
  await instance.setState(state);
  return instance;
}
export class VizCubeSampleThreeJSFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizCubeSampleThreeJS.CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

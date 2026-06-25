import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import {
  VizHelmetSampleThreeJS,
  VizHelmetSampleThreeJSState,
} from './viz-eye-helmet-sample-threeJS';

async function createObject(
  state: VizHelmetSampleThreeJSState,
): Promise<VizHelmetSampleThreeJS> {
  return new VizHelmetSampleThreeJS(state);
}
export class VizHelmetSampleThreeJSFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizHelmetSampleThreeJS.HELMET_SAMPLE_THREEJS_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

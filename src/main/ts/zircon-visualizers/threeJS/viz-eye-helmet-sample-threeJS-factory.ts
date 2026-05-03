import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import {
  VizHelmetSampleThreeJS,
  VizHelmetSampleThreeJSState,
} from './viz-eye-helmet-sample-threeJS';

export class VizHelmetSampleThreeJSFactory extends ZirconObjectFactory {
  constructor() {
    super('VizHelmetSampleThreeJSFactory');
  }

  public getHandledTypes(): string[] {
    return [VizHelmetSampleThreeJS.HELMET_SAMPLE_THREEJS_VISUALIZER_TYPE];
  }

  public override createInstance(
    state: VizHelmetSampleThreeJSState,
  ): Promise<VizHelmetSampleThreeJS> {
    return Promise.resolve().then(() => {
      const viz = new VizHelmetSampleThreeJS(state);
      return viz;
    });
  }
}

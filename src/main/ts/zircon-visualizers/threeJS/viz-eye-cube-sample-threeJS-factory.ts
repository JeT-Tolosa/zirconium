import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import {
  VizCubeSampleThreeJS,
  VizCubeSampleThreeJSState,
} from './viz-eye-cube-sample-threeJS';

export class VizCubeSampleThreeJSFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizCubeSampleThreeJS.CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE;
  }

  public override createInstance(
    state: VizCubeSampleThreeJSState,
  ): Promise<VizCubeSampleThreeJS> {
    return Promise.resolve().then(() => {
      const viz = new VizCubeSampleThreeJS(state);
      return viz;
    });
  }
}

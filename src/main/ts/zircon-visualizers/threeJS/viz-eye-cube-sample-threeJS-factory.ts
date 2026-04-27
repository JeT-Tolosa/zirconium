import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizCubeSampleThreeJS } from './viz-eye-cube-sample-threeJS';

export class VizCubeSampleThreeJSFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizCubeSampleThreeJS.CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE;
  }

  public override createInstance(state: ZirconVizState): Promise<VizCubeSampleThreeJS> {
    return Promise.resolve().then(() => {
      const viz = new VizCubeSampleThreeJS();
      viz.setState(state);
      return viz;
    });
  }
}

import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { VizCesium, VizCesiumState } from './viz-eye-cesium';

export class VizCesiumFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizCesium.CESIUM_VISUALIZER_TYPE;
  }

  public override createInstance(state: VizCesiumState): Promise<VizCesium> {
    return Promise.resolve().then(() => {
      const viz = new VizCesium();
      viz.setState(state);
      return viz;
    });
  }
}

import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { VizLeaflet, VizLeafletState } from './viz-eye-leaflet';

export class VizLeafletFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizLeaflet.LEAFLET_VISUALIZER_TYPE;
  }

  public override createInstance(state: VizLeafletState): Promise<VizLeaflet> {
    return Promise.resolve().then(() => {
      const viz = new VizLeaflet(state);
      return viz;
    });
  }
}

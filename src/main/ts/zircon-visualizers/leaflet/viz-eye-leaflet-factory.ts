import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizLeaflet, VizLeafletState } from './viz-eye-leaflet';


export class VizLeafletFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizLeaflet.LEAFLET_VISUALIZER_TYPE;
  }

  public override createInstance(state: VizLeafletState): Promise<VizLeaflet> {
    return Promise.resolve().then(() => {
      const viz = new VizLeaflet();
      viz.setState(state);
      return viz;
    });
  }
}

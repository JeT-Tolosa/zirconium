import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizFetch, VizFetchState } from './viz-eye-fetch';



export class VizFetchFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizFetch.FETCH_VISUALIZER_TYPE;
  }

  public override createInstance(state: VizFetchState): Promise<VizFetch> {
    return Promise.resolve().then(() => {
      const viz = new VizFetch();
      viz.setState(state);
      return viz;
    });
  }
}

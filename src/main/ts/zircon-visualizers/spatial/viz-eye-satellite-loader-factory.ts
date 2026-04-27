import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizSatCatLoader, VizSatCatLoaderState } from './viz-eye-satellite-loader';

export class VizSatCatLoaderFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE;
  }

  public override createInstance(state: VizSatCatLoaderState): Promise<VizSatCatLoader> {
    return Promise.resolve().then(() => {
      const viz = new VizSatCatLoader();
      viz.setState(state);
      return viz;
    });
  }
}

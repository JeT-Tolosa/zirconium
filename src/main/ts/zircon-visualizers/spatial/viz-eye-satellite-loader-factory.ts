import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import {
  VizSatCatLoader,
  VizSatCatLoaderState,
} from './viz-eye-satellite-loader';

export class VizSatCatLoaderFactory extends ZirconObjectFactory {
  constructor() {
    super('VizSatCatLoaderFactory');
  }

  public getHandledTypes(): string[] {
    return [VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE];
  }

  public override createInstance(
    state: VizSatCatLoaderState,
  ): Promise<VizSatCatLoader> {
    return Promise.resolve().then(() => {
      const viz = new VizSatCatLoader(state);
      return viz;
    });
  }
}

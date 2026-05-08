import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import {
  VizSatCatLoader,
  VizSatCatLoaderState,
} from './viz-eye-satellite-loader';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';

export class VizSatCatLoaderFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: VizSatCatLoaderState,
  ): Promise<VizSatCatLoader> {
    return new VizSatCatLoader(state);
  }
}

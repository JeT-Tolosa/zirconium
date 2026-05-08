import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizFetch, VizFetchState } from './viz-eye-fetch';

export class VizFetchFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VizFetch.FETCH_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(state: VizFetchState): Promise<VizFetch> {
    return new VizFetch(state);
  }
}

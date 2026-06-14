import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { VIZ_AIS_LOADER_TYPE, VizAISLoader } from './viz-eye-ais-loader';
import { VizLoaderState } from '../data-loader/viz-loader';

export class VizAISLoaderFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VIZ_AIS_LOADER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: VizLoaderState,
  ): Promise<VizAISLoader> {
    return new VizAISLoader(state);
  }
}

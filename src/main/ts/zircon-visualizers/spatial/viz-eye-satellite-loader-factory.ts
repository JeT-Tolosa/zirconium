import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizSatCatLoader } from './viz-eye-satellite-loader';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { VizLoaderState } from '../data-loader/viz-loader';

async function createObject(state: VizLoaderState): Promise<VizSatCatLoader> {
  const instance = new VizSatCatLoader();
  await instance.setState(state);
  return instance;
}

export class VizSatCatLoaderFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { VIZ_AIS_LOADER_TYPE, VizAISLoader } from './viz-eye-ais-loader';
import { VizLoaderState } from '../data-loader/viz-loader';

async function createObject(state: VizLoaderState): Promise<VizAISLoader> {
  const instance = new VizAISLoader();
  await instance.setState(state);
  return instance;
}

export class VizAISLoaderFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VIZ_AIS_LOADER_TYPE, SHARP_EYE_VIZ_TYPE, createObject, null);
  }
}

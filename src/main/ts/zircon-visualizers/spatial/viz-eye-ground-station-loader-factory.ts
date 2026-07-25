import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { VizGroundStationLoader } from './viz-eye-ground-station-loader';
import { VizLoaderState } from '../data-loader/viz-loader';

async function createObject(
  state: VizLoaderState,
): Promise<VizGroundStationLoader> {
  const instance = new VizGroundStationLoader();
  await instance.setState(state);
  return instance;
}

export class VizGroundStationLoaderFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

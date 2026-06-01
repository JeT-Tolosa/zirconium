import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import {
  VizGroundStationLoader,
  VizGroundStationLoaderState,
} from './viz-eye-ground-station-loader';

export class VizGroundStationLoaderFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE,
      SHARP_EYE_VIZ_TYPE,
    );
  }

  public override async createObject(
    state: VizGroundStationLoaderState,
  ): Promise<VizGroundStationLoader> {
    return new VizGroundStationLoader(state);
  }
}

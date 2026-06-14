import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { VizGroundStationLoader } from './viz-eye-ground-station-loader';
import { VizLoaderState } from '../data-loader/viz-loader';

export class VizGroundStationLoaderFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE,
      SHARP_EYE_VIZ_TYPE,
    );
  }

  public override async createObject(
    state: VizLoaderState,
  ): Promise<VizGroundStationLoader> {
    return new VizGroundStationLoader(state);
  }
}

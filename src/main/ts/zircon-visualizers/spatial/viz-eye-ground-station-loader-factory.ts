import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import {
  VizGroundStationLoader,
  VizGroundStationLoaderState,
} from './viz-eye-ground-station-loader';

export class VizGroundStationLoaderFactory extends ZirconObjectFactory {
  constructor() {
    super('VizGroundStationLoaderFactory');
  }

  public getHandledTypes(): string[] {
    return [VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE];
  }

  public override createInstance(
    state: VizGroundStationLoaderState,
  ): Promise<VizGroundStationLoader> {
    return Promise.resolve().then(() => {
      const viz = new VizGroundStationLoader(state);
      return viz;
    });
  }
}

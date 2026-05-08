import { SimpleZirconObjectFactory } from '../../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye-app';
import {
  GroundStationCatalogEngine,
  GroundStationCatalogEngineState,
} from './ground-station-catalog-engine';

export class GroundStationCatalogEngineFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE,
      SHARP_EYE_VIZ_TYPE,
    );
  }

  public override async createObject(
    state: GroundStationCatalogEngineState,
  ): Promise<GroundStationCatalogEngine> {
    return new GroundStationCatalogEngine(state?.name);
  }
}

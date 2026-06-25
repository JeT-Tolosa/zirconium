import { SimpleZirconObjectFactory } from '../../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_ENGINE_TYPE } from '../../sharp-eye-app';
import {
  GroundStationCatalogEngine,
  GroundStationCatalogEngineState,
} from './ground-station-catalog-engine';

async function createGroundStationCatalogEngine(
  state: GroundStationCatalogEngineState,
): Promise<GroundStationCatalogEngine> {
  return new GroundStationCatalogEngine(state?.name);
}

export class GroundStationCatalogEngineFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE,
      SHARP_EYE_ENGINE_TYPE,
      createGroundStationCatalogEngine,
      null,
    );
  }
}

import { SimpleZirconObjectFactory } from '../../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_ENGINE_TYPE } from '../../sharp-eye-app';
import {
  GroundStationCatalogEngine,
  GroundStationCatalogEngineState,
} from './ground-station-catalog-engine';

async function createGroundStationCatalogEngine(
  state: GroundStationCatalogEngineState,
): Promise<GroundStationCatalogEngine> {
  const instance = new GroundStationCatalogEngine(state?.name);
  await instance.setState(state);
  return instance;
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

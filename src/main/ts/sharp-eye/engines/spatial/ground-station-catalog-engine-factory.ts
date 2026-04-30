import { ZirconObjectFactory } from '../../../zirconium/zircon-object-factory';
import {
  GroundStationCatalogEngine,
  GroundStationCatalogEngineState,
} from './ground-station-catalog-engine';

/**
 * GroundStation Catalog Zircon Core object
 */
export class GroundStationCatalogEngineFactory extends ZirconObjectFactory {
  constructor() {
    super();
  }

  public override getType(): string {
    return GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE;
  }

  public override createInstance(
    state: GroundStationCatalogEngineState,
  ): Promise<GroundStationCatalogEngine> {
    return Promise.resolve().then(() => {
      return new GroundStationCatalogEngine(state.name);
    });
  }
}

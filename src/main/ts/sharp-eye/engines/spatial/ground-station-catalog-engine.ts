import {
  GroundStation,
  GROUND_STATION_TYPE,
} from '../../../libraries/spatial/ground-station';
import { CatalogEngine } from '../catalog-engine';
import { groundStationIndexationMethod } from '../../../libraries/spatial/ground-station-catalog';
import { ZirconEngineState } from '../../../zirconium/zircon-core/zircon-engine';

export interface GroundStationCatalogEngineState extends ZirconEngineState {
  type: typeof GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE;
}

/**
 * GroundStation Catalog Zircon Core object
 */
export class GroundStationCatalogEngine extends CatalogEngine<GroundStation> {
  public static readonly GROUND_STATION_CATALOG_ENGINE_TYPE =
    'ground-station-catalog-engine';

  constructor(name: string) {
    super(name, GROUND_STATION_TYPE, groundStationIndexationMethod);
  }

  public override getType(): string {
    return GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE;
  }
}

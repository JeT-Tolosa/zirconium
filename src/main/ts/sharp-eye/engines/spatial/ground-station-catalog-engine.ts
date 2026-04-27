import {
  GroundStation,
  GROUND_STATION_TYPE,
} from '../../../libraries/spatial/ground-station';
import { CatalogEngine } from '../catalog-engine';
import { groundStationIndexationMethod } from '../../../libraries/spatial/ground-station-catalog';

/**
 * GroundStation Catalog Zircon Core object
 */
export class GroundStationCatalogEngine extends CatalogEngine<GroundStation> {
  constructor(name: string) {
    super(name, GROUND_STATION_TYPE, groundStationIndexationMethod);
  }
}

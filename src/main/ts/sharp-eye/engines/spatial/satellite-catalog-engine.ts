import {
  Satellite,
  SATELLITE_TYPE,
} from '../../../libraries/spatial/satellite';
import { CatalogEngine } from '../catalog-engine';
import { satelliteIndexationMethod } from '../../../libraries/spatial/satellite-catalog';

/**
 * Satellite Catalog Zircon Core object
 */
export class SatelliteCatalogEngine extends CatalogEngine<Satellite> {
  constructor(name: string) {
    super(name, SATELLITE_TYPE, satelliteIndexationMethod);
  }
}

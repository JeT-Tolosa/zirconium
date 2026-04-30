import {
  Satellite,
  SATELLITE_TYPE,
} from '../../../libraries/spatial/satellite';
import { CatalogEngine } from '../catalog-engine';
import { satelliteIndexationMethod } from '../../../libraries/spatial/satellite-catalog';
import { ZirconEngineState } from '../../../zirconium/zircon-core/zircon-engine';

export interface SatelliteCatalogEngineState extends ZirconEngineState {
  type: typeof SatelliteCatalogEngine.SATELLITE_CATALOG_ENGINE_TYPE;
}

/**
 * Satellite Catalog Zircon Core object
 */
export class SatelliteCatalogEngine extends CatalogEngine<Satellite> {
  public static readonly SATELLITE_CATALOG_ENGINE_TYPE =
    'satellite-catalog-engine';

  constructor(name: string) {
    super(name, SATELLITE_TYPE, satelliteIndexationMethod);
  }

  public override getType(): string {
    return SatelliteCatalogEngine.SATELLITE_CATALOG_ENGINE_TYPE;
  }
}

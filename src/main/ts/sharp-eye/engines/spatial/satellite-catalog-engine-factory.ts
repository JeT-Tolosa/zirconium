import { ZirconObjectFactory } from '../../../zirconium/zircon-object-factory';
import {
  SatelliteCatalogEngine,
  SatelliteCatalogEngineState,
} from './satellite-catalog-engine';

/**
 * Satellite Catalog Zircon Core object Factory
 */
export class SatelliteCatalogEngineFactory extends ZirconObjectFactory {
  constructor() {
    super('SatelliteCatalogEngineFactory');
  }

  public override getHandledTypes(): string[] {
    return [SatelliteCatalogEngine.SATELLITE_CATALOG_ENGINE_TYPE];
  }

  public override createInstance(
    state: SatelliteCatalogEngineState,
  ): Promise<SatelliteCatalogEngine> {
    return Promise.resolve().then(() => {
      return new SatelliteCatalogEngine(state.name);
    });
  }
}

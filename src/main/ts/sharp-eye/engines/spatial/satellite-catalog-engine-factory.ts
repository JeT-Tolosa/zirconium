import { SimpleZirconObjectFactory } from '../../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_ENGINE_TYPE } from '../../sharp-eye-app';
import {
  SatelliteCatalogEngine,
  SatelliteCatalogEngineState,
} from './satellite-catalog-engine';

async function createObject(
  state: SatelliteCatalogEngineState,
): Promise<SatelliteCatalogEngine> {
  return new SatelliteCatalogEngine(state?.name);
}

export class SatelliteCatalogEngineFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      SatelliteCatalogEngine.SATELLITE_CATALOG_ENGINE_TYPE,
      SHARP_EYE_ENGINE_TYPE,
      createObject,
      null,
    );
  }
}

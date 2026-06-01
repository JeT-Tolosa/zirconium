import { SimpleZirconObjectFactory } from '../../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_ENGINE_TYPE } from '../../sharp-eye-app';
import { AISCatalogEngine, AISCatalogEngineState } from './ais-catalog-engine';

export class AISCatalogEngineFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(AISCatalogEngine.AIS_CATALOG_ENGINE_TYPE, SHARP_EYE_ENGINE_TYPE);
  }

  public override async createObject(
    state: AISCatalogEngineState,
  ): Promise<AISCatalogEngine> {
    return new AISCatalogEngine(state?.name);
  }
}

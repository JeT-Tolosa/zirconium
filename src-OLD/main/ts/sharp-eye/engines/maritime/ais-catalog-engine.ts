import { CatalogEngine } from '../catalog-engine';
import { AIS, AIS_TYPE } from '../../../libraries/maritime/ais';
import { aisIndexationMethod } from '../../../libraries/maritime/ais-catalog';
import { ZirconEngineState } from '../../../zirconium/zircon-core/zircon-engine';

export interface AISCatalogEngineState extends ZirconEngineState {
  type: typeof AISCatalogEngine.AIS_CATALOG_ENGINE_TYPE;
}

/**
 * AIS Catalog Zircon Core object
 */
export class AISCatalogEngine extends CatalogEngine<AIS> {
  public static readonly AIS_CATALOG_ENGINE_TYPE = 'ais-catalog-engine';

  constructor(name: string = AISCatalogEngine.AIS_CATALOG_ENGINE_TYPE) {
    super(name, AIS_TYPE, aisIndexationMethod);
  }

  public override getType(): string {
    return AISCatalogEngine.AIS_CATALOG_ENGINE_TYPE;
  }
  protected override onStart(): Promise<void> {
    return Promise.resolve();
  }
  protected override onStop(): Promise<void> {
    return Promise.resolve();
  }
}

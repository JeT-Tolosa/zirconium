import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import {
  VizAISCatalogTabulator,
  VizAISCatalogTabulatorState,
} from './viz-eye-ais-catalog-tabulator';

export class VizAISCatalogTabulatorFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizAISCatalogTabulator.VIZ_AIS_CATALOG_TABULATOR_TYPE,
      SHARP_EYE_VIZ_TYPE,
    );
  }

  public override async createObject(
    state: VizAISCatalogTabulatorState,
  ): Promise<VizAISCatalogTabulator> {
    return new VizAISCatalogTabulator(state);
  }
}

import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import {
  VizSatelliteCatalogTabulator,
  VizSatelliteCatalogTabulatorState,
} from './viz-eye-satellite-catalog-tabulator';

async function createObject(
  state: VizSatelliteCatalogTabulatorState,
): Promise<VizSatelliteCatalogTabulator> {
  return new VizSatelliteCatalogTabulator(state);
}
export class VizSatelliteCatalogTabulatorFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

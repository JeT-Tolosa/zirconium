import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import {
  VizGroundStationCatalogTabulator,
  VizGroundStationCatalogTabulatorState,
} from './viz-eye-ground-station-catalog-tabulator';

async function createObject(
  state: VizGroundStationCatalogTabulatorState,
): Promise<VizGroundStationCatalogTabulator> {
  const instance = new VizGroundStationCatalogTabulator();
  await instance.setState(state);
  return instance;
}

export class VizGroundStationCatalogTabulatorFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import {
  VizGroundStationCatalogTabulator,
  VizGroundStationCatalogTabulatorState,
} from './viz-eye-ground-station-catalog-tabulator';

export class VizGroundStationCatalogTabulatorFactory extends ZirconObjectFactory {
  constructor() {
    super('VizGroundStationCatalogTabulatorFactory');
  }

  public getHandledTypes(): string[] {
    return [
      VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE,
    ];
  }

  public override createInstance(
    state: VizGroundStationCatalogTabulatorState,
  ): Promise<VizGroundStationCatalogTabulator> {
    return Promise.resolve().then(() => {
      const viz = new VizGroundStationCatalogTabulator(state);
      return viz;
    });
  }
}

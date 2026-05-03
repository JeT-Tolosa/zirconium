import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import {
  VizSatelliteCatalogTabulator,
  VizSatelliteCatalogTabulatorState,
} from './viz-eye-satellite-catalog-tabulator';

export class VizSatelliteCatalogTabulatorFactory extends ZirconObjectFactory {
  constructor() {
    super('VizSatelliteCatalogTabulatorFactory');
  }

  public getHandledTypes(): string[] {
    return [VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE];
  }

  public override createInstance(
    state: VizSatelliteCatalogTabulatorState,
  ): Promise<VizSatelliteCatalogTabulator> {
    return Promise.resolve().then(() => {
      const viz = new VizSatelliteCatalogTabulator(state);
      return viz;
    });
  }
}

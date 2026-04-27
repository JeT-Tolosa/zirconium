import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import {
  VizSatelliteCatalogTabulator,
  VizSatelliteCatalogTabulatorState,
} from './viz-eye-satellite-catalog-tabulator';

export class VizSatelliteCatalogTabulatorFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE;
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

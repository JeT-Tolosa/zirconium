import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizSatelliteCatalogTabulator } from './viz-eye-satellite-catalog-tabulator';

export class VizSatelliteCatalogTabulatorFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE;
  }

  public override createInstance(state: ZirconVizState): Promise<VizSatelliteCatalogTabulator> {
    return Promise.resolve().then(() => {
      const viz = new VizSatelliteCatalogTabulator();
      viz.setState(state);
      return viz;
    });
  }
}
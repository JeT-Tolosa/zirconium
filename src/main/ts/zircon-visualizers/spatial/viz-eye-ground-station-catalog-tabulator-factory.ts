import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizGroundStationCatalogTabulator, VizGroundStationCatalogTabulatorState } from './viz-eye-ground-station-catalog-tabulator';

export class VizGroundStationCatalogTabulatorFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE;
  }

  public override createInstance(state: VizGroundStationCatalogTabulatorState): Promise<VizGroundStationCatalogTabulator> {
    return Promise.resolve().then(() => {
      const viz = new VizGroundStationCatalogTabulator();
      viz.setState(state);
      return viz;
    });
  }
}
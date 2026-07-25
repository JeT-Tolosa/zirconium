import { Satellite } from '../../libraries/spatial/satellite/satellite';
import {
  VizCollectionCatalogTabulator,
  VizCollectionCatalogTabulatorState,
} from '../catalog/viz-eye-catalog-tabulator';

export interface VizSatelliteCatalogTabulatorState extends VizCollectionCatalogTabulatorState {
  type: typeof VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE;
}

export class VizSatelliteCatalogTabulator extends VizCollectionCatalogTabulator<Satellite> {
  public static readonly VIZ_SATELLITE_CATALOG_TABULATOR_TYPE =
    'satellite-tabulator-catalog-visualizer-type';

  constructor() {
    super('Satellite', (el: Satellite) => el.OBJECT_ID);
    // this.setState({
    //   name: 'Satellite Catalog Tabulator',
    //   ...state,
    //   type: VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
    // });
  }

  public override getType(): string {
    return VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE;
  }
}

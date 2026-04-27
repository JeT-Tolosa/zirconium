import {
  VizCatalogCollectionTabulator,
  VizCatalogCollectionTabulatorState,
} from '../catalog/viz-eye-catalog-tabulator';
import { Satellite } from '../../libraries/spatial/satellite';

export interface VizSatelliteCatalogTabulatorState extends VizCatalogCollectionTabulatorState {
  type: typeof VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE;
}

export class VizSatelliteCatalogTabulator extends VizCatalogCollectionTabulator<Satellite> {
  public static readonly VIZ_SATELLITE_CATALOG_TABULATOR_TYPE =
    'VIZ_SATELLITE_CATALOG_TABULATOR_TYPE';

  constructor(state?: VizSatelliteCatalogTabulatorState) {
    super('Satellite', (el: Satellite) => el.OBJECT_ID);
    this.setState({
      name: 'Satellite Catalog Tabulator',
      ...state,
      type: VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
    });
  }
}

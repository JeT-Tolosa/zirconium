import {
  VizCatalogCollectionTabulator,
  VizCatalogCollectionTabulatorState,
} from '../catalog/viz-eye-catalog-tabulator';
import { GroundStation } from '../../libraries/spatial/ground-station';

export interface VizGroundStationCatalogTabulatorState extends VizCatalogCollectionTabulatorState {
  type: typeof VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE;
}

export class VizGroundStationCatalogTabulator extends VizCatalogCollectionTabulator<GroundStation> {
  public static readonly VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE =
    'VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE';

  constructor(state?: VizGroundStationCatalogTabulatorState) {
    super('GroundStation', (el: GroundStation) => el.name, state);
    this.setState({
      name: 'Ground Station Catalog Tabulator',
      ...state,
      type: VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE,
    });
  }
}

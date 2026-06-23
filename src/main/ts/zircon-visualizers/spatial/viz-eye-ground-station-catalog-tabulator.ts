import { GroundStation } from '../../libraries/spatial/ground-station/ground-station';
import {
  VizCollectionCatalogTabulator,
  VizCollectionCatalogTabulatorState,
} from '../catalog/viz-eye-catalog-tabulator';

export interface VizGroundStationCatalogTabulatorState extends VizCollectionCatalogTabulatorState {
  type: typeof VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE;
}

export class VizGroundStationCatalogTabulator extends VizCollectionCatalogTabulator<GroundStation> {
  public static readonly VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE =
    'ground-station-tabulator-catalog-visualizer-type';

  constructor(state?: VizGroundStationCatalogTabulatorState) {
    super('GroundStation', (el: GroundStation) => el.name, state);
    this.setState({
      name: 'Ground Station Catalog Tabulator',
      ...state,
      type: VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE,
    });
  }

  public override getType(): string {
    return VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE;
  }
}

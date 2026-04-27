import { VizCatalogCollectionTabulator, VizCatalogCollectionTabulatorState } from '../catalog/viz-eye-catalog-tabulator';
import { Satellite } from '../../libraries/spatial/satellite';
import { SatelliteCatalogCollection } from '../../libraries/spatial/satellite-catalog';

export interface VizSatelliteCatalogTabulatorState extends VizCatalogCollectionTabulatorState {
  type: typeof VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE;
}

export class VizSatelliteCatalogTabulator extends VizCatalogCollectionTabulator<Satellite> {
  public static readonly VIZ_SATELLITE_CATALOG_TABULATOR_TYPE = 'VIZ_SATELLITE_CATALOG_TABULATOR_TYPE';

  constructor() {
    super('Satellite', (el: Satellite) => el.OBJECT_ID);
    this.setState({
      type: VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
      name: 'Satellite Catalog Tabulator',
    });
  }
}
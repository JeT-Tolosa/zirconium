import {} from '../catalog/viz-eye-catalog-tabulator';
import { AIS } from '../../libraries/maritime/ais';

export const VIZ_AIS_CATALOG_TABULATOR_TYPE = 'viz-ais-catalog-tabulator';

export interface VizAISCatalogTabulatorState extends VizCatalogCollectionTabulatorState {
  type: typeof VIZ_AIS_CATALOG_TABULATOR_TYPE;
}

export class VizAISCatalogTabulator extends VizCatalogCollectionTabulator<AIS> {
  constructor(state?: VizAISCatalogTabulatorState) {
    super('AIS', (el: AIS) => el.id);
    this.setState({
      name: 'AIS Catalog Tabulator',
      ...state,
      type: VIZ_AIS_CATALOG_TABULATOR_TYPE,
    });
  }
}

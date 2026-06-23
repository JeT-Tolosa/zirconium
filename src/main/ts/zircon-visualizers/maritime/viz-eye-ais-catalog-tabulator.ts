import { AIS } from '../../libraries/maritime/ais';
import {
  VizCollectionCatalogTabulator,
  VizCollectionCatalogTabulatorState,
} from '../catalog/viz-eye-catalog-tabulator';

export interface VizAISCatalogTabulatorState extends VizCollectionCatalogTabulatorState {
  type: typeof VizAISCatalogTabulator.VIZ_AIS_CATALOG_TABULATOR_TYPE;
}

export class VizAISCatalogTabulator extends VizCollectionCatalogTabulator<AIS> {
  public static readonly VIZ_AIS_CATALOG_TABULATOR_TYPE =
    'viz-ais-catalog-tabulator';
  constructor(state?: VizAISCatalogTabulatorState) {
    super('AIS', (el: AIS) => el.id);
    this.setState({
      name: 'AIS Catalog Tabulator',
      ...state,
      type: VizAISCatalogTabulator.VIZ_AIS_CATALOG_TABULATOR_TYPE,
    });
  }

  public override getType(): string {
    return VizAISCatalogTabulator.VIZ_AIS_CATALOG_TABULATOR_TYPE;
  }
}

import { CatalogEngine, DataProviderCreatorFunction } from '../catalog-engine';
import { AIS, AIS_TYPE } from '../../../libraries/maritime/ais';
import { ZirconEngineState } from '../../../zirconium/zircon-core/zircon-engine';
import { ItemArray } from '../../../libraries/collection/item-array';
import { ZirconDataProvider } from '../../../zirconium/zircon-data/zircon-data-provider';

export interface AISCatalogEngineState extends ZirconEngineState {
  type: typeof AISCatalogEngine.AIS_CATALOG_ENGINE_TYPE;
}

// dataProviderCreator: (data: T[]) => ZirconDataProvider<ItemArray<T>>,
const aisArrayDataProviderCreator: DataProviderCreatorFunction<AIS> = (
  dataProviderName: string,
  dataType: string,
  items: AIS[] = [],
): ZirconDataProvider<ItemArray<AIS>> => {
  const dataProvider = new ZirconDataProvider<ItemArray<AIS>>(
    dataProviderName,
    dataType,
  );
  const itemArray = new ItemArray<AIS>({
    itemType: AIS_TYPE,
    name: `${dataProviderName}-item-array`,
  });
  itemArray.setItems(items);
  dataProvider.setData(itemArray);
  dataProvider.setEventDispatcher;
  return dataProvider;
};

/**
 * AIS Catalog Zircon Core object
 */
export class AISCatalogEngine extends CatalogEngine<AIS> {
  public static readonly AIS_CATALOG_ENGINE_TYPE = 'ais-catalog-engine';

  constructor(name: string = AISCatalogEngine.AIS_CATALOG_ENGINE_TYPE) {
    super(name, AIS_TYPE, aisArrayDataProviderCreator);
  }

  public override getType(): string {
    return AISCatalogEngine.AIS_CATALOG_ENGINE_TYPE;
  }
  protected override onStart(): Promise<void> {
    return Promise.resolve();
  }
  protected override onStop(): Promise<void> {
    return Promise.resolve();
  }
}

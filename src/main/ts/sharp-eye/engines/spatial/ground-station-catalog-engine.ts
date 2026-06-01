import {
  GroundStation,
  GROUND_STATION_TYPE,
} from '../../../libraries/spatial/ground-station/ground-station';
import { CatalogEngine, DataProviderCreatorFunction } from '../catalog-engine';
import { ZirconEngineState } from '../../../zirconium/zircon-core/zircon-engine';
import { ItemArray } from '../../../libraries/collection/item-array';
import { ZirconDataProvider } from '../../../zirconium/zircon-data/zircon-data-provider';

export interface GroundStationCatalogEngineState extends ZirconEngineState {
  type: typeof GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE;
}

const groundStationArrayDataProviderCreator: DataProviderCreatorFunction<
  GroundStation
> = (
  dataProviderName: string,
  dataType: string,
  items: GroundStation[] = [],
): ZirconDataProvider<ItemArray<GroundStation>> => {
  const dataProvider = new ZirconDataProvider<ItemArray<GroundStation>>(
    dataProviderName,
    dataType,
  );
  const itemArray = new ItemArray<GroundStation>({
    itemType: GROUND_STATION_TYPE,
    name: `${dataProviderName}-item-array`,
  });
  itemArray.setItems(items);
  dataProvider.setData(itemArray);
  dataProvider.setEventDispatcher;
  return dataProvider;
};

/**
 * GroundStation Catalog Zircon Core object
 */
export class GroundStationCatalogEngine extends CatalogEngine<GroundStation> {
  public static readonly GROUND_STATION_CATALOG_ENGINE_TYPE =
    'ground-station-catalog-engine';

  constructor(
    name: string = GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE,
  ) {
    super(name, GROUND_STATION_TYPE, groundStationArrayDataProviderCreator);
  }

  public override getType(): string {
    return GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE;
  }

  protected override onStart(): Promise<void> {
    return Promise.resolve();
  }
  protected override onStop(): Promise<void> {
    return Promise.resolve();
  }
}

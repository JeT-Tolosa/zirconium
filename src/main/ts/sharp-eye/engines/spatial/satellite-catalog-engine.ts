import { v4 as uuid } from 'uuid';
import {
  Satellite,
  SATELLITE_TYPE,
} from '../../../libraries/spatial/satellite/satellite';
import {
  CatalogEngine,
  ItemArrayDataProviderCreatorFunction,
} from '../catalog-engine';
import { ZirconEngineState } from '../../../zirconium/zircon-core/zircon-engine';
import { ItemArray } from '../../../libraries/collection/item-array';
import { ZirconDataProvider } from '../../../zirconium/zircon-data/zircon-data-provider';

export interface SatelliteCatalogEngineState extends ZirconEngineState {
  type: typeof SatelliteCatalogEngine.SATELLITE_CATALOG_ENGINE_TYPE;
}

const satelliteArrayDataProviderCreator: ItemArrayDataProviderCreatorFunction<
  Satellite
> = (
  dataProviderName: string,
  dataType: string,
  items: Satellite[] = [],
): ZirconDataProvider<ItemArray<Satellite>> => {
  const dataProvider = new ZirconDataProvider<ItemArray<Satellite>>(
    SATELLITE_TYPE,
    {
      id: uuid(),
      name: dataProviderName,
      type: SATELLITE_TYPE,
      dataType: dataType,
    },
  );
  const itemArray = new ItemArray<Satellite>({
    itemType: SATELLITE_TYPE,
    name: `${dataProviderName}-item-array`,
  });
  itemArray.setItems(items);
  dataProvider.setData(itemArray);
  // dataProvider.setEventDispatcher;
  return dataProvider;
};

/**
 * Satellite Catalog Zircon Core object
 */
export class SatelliteCatalogEngine extends CatalogEngine<Satellite> {
  public static readonly SATELLITE_CATALOG_ENGINE_TYPE =
    'satellite-catalog-engine';

  constructor(
    name: string = SatelliteCatalogEngine.SATELLITE_CATALOG_ENGINE_TYPE,
  ) {
    super(name, SATELLITE_TYPE, satelliteArrayDataProviderCreator);
  }

  public override getType(): string {
    return SatelliteCatalogEngine.SATELLITE_CATALOG_ENGINE_TYPE;
  }
  protected override onStart(): Promise<void> {
    return Promise.resolve();
  }
  protected override onStop(): Promise<void> {
    return Promise.resolve();
  }
}

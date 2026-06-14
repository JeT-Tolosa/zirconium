import {
  CatalogEngineDescriptor,
  CatalogEngineEvents,
} from '../../sharp-eye/engines/catalog-engine';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import {
  ItemCollection,
  ItemCollectionDescriptor,
} from '../../libraries/collection/item-collection';
import {
  ZirconDataAdapter,
  ZirconDataAdapterEventRegistry,
  ZirconDataAdapterState,
} from './zircon-data-adapter';

export const ITEM_COLLECTION_DATA_ADAPTER = 'item-collection-data-adapter';

export interface ItemCollectionDataAdapterState extends ZirconDataAdapterState {
  inputItemCollectionId: string;
}

export type ItemCollectionDataAdapterEventRegistry<T> = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [PickEvents<CatalogEngineEvents<T>, 'CATALOG_ENGINE_COLLECTION_CONTENT'>]
    >;

    outgoing: MergePickEvents<
      [
        PickEvents<
          CatalogEngineEvents<T>,
          'CATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST'
        >,
      ]
    >;
  },
  ZirconDataAdapterEventRegistry
>;

export class ItemCollectionDataAdapter<
  Titem,
  Tin extends ItemCollection<Titem> = ItemCollection<Titem>,
  Tout = unknown,
  R extends ItemCollectionDataAdapterEventRegistry<Titem> =
    ItemCollectionDataAdapterEventRegistry<Titem>,
> extends ZirconDataAdapter<Tin, Tout, R> {
  private _inputItemCollectionDataType: string = null;
  private _inputItemCollectionId: string = null;
  private __itemCollectionDescriptor: ItemCollectionDescriptor = null;
  private __inputItems: Titem[] = null;

  constructor(
    inputItemCollectionDataType: string,
    outputDataType: string,
    state: ItemCollectionDataAdapterState,
    transformData: (data: Tin) => Tout,
    compareData: (a: Tout, b: Tout) => number,
  ) {
    super(
      inputItemCollectionDataType,
      outputDataType,
      state,
      transformData,
      compareData,
    );
    this._inputItemCollectionDataType = inputItemCollectionDataType;
    this.setState(state);
  }

  protected override listenToEvents(): void {
    this.addListener('CATALOG_ENGINE_COLLECTION_CONTENT', (arg) => {
      this.setItemCollection(
        arg.catalogDescriptor,
        arg.itemCollectionDescriptor,
        arg.items,
      );
    });
  }

  public override async setState(
    state: ItemCollectionDataAdapterState,
  ): Promise<void> {
    await super.setState(state);
    if (!state) {
      return;
    }
    this.setInputItemCollectionId(state.inputItemCollectionId);
  }

  public setInputItemCollectionId(inputItemCollectionId: string): void {
    this._inputItemCollectionId = inputItemCollectionId;
    this.__inputItems = null;
    this.__itemCollectionDescriptor = null;
    this.requestItemCollection();
  }

  // private async groundStationsToCollection(
  //   stations: GroundStation[],
  // ): Promise<Cesium.BillboardCollection> {
  //   const collection = new Cesium.BillboardCollection();
  //   for (const station of stations) {
  //     collection.add(await this._dataConverter.createPrimitive(station));
  //   }
  //   return collection;
  // }

  private setItemCollection(
    _catalogDescriptor: CatalogEngineDescriptor,
    itemCollectionDescriptor: ItemCollectionDescriptor,
    items: Titem[],
  ): void {
    if (
      !itemCollectionDescriptor ||
      !this._inputItemCollectionId ||
      this._inputItemCollectionId !== itemCollectionDescriptor.id
    ) {
      return;
    }
    if (
      this._inputItemCollectionDataType !== itemCollectionDescriptor.itemType
    ) {
      throw new Error(
        `given item collection ${this._inputItemCollectionId} data type ${itemCollectionDescriptor.itemType} is incoherent with expected data type ${this._inputItemCollectionDataType}`,
      );
    }
    this.__itemCollectionDescriptor = itemCollectionDescriptor;
    this.__inputItems = items;
  }

  private requestItemCollection(): void {
    this.emit('CATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST', {
      itemCollectionId: this._inputItemCollectionId,
    });
  }
}

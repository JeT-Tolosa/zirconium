import { ItemArray } from '../../libraries/collection/item-array';
import {
  ItemCollection,
  ItemCollectionDescriptor,
} from '../../libraries/collection/item-collection';
import {
  ZirconEngine,
  ZirconEngineEventRegistry,
  ZirconEngineState,
} from '../../zirconium/zircon-core/zircon-engine';
import { ZirconDataProvider } from '../../zirconium/zircon-data/zircon-data-provider';
import { ZirconDataProviderManagerEvents } from '../../zirconium/zircon-data/zircon-data-provider-manager';

import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';

/**
 * CATALOG ENGINE is a zircon engine that manage collections of items.
 * It provides a way to create, update and delete collections of items.
 * It also provides a way to get the content of a collection and the list of collections.
 * Catalog engine is designed to be used as a core engine for catalog management in zircon applications.
 */

export type DataProviderCreatorFunction<T> = (
  dataProviderName: string,
  dataType: string,
  data: T[],
) => ZirconDataProvider<ItemArray<T>>;

interface CatalogEngineEntry<T> {
  collection: ItemArray<T>;
  dataProvider: ZirconDataProvider<ItemArray<T>>;
}
/**
 * Events
 */
export type CatalogEngineEvents<T> = {
  // create catalog
  CATALOG_ENGINE_COLLECTION_CREATE_REQUEST: {
    dataType: string;
    itemCollectionDescriptor: ItemCollectionDescriptor;
    items?: T[];
  };
  CATALOG_ENGINE_COLLECTION_CREATED: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
    items: T[];
  };
  CATALOG_ENGINE_CREATE_COLLECTION_ERROR: { itemCollectionDescriptor: string };
  // Clear Catalog
  CATALOG_ENGINE_CLEAR_COLLECTION_REQUEST: { collectionId: string };
  CATALOG_ENGINE_COLLECTION_CLEARED: { collectionId: string };
  CATALOG_ENGINE_CLEAR_COLLECTION_ERROR: { error: string };
  // add items
  CATALOG_ENGINE_ADD_ELEMENTS_REQUEST: {
    collectionId: string;
    items: T[];
  };
  CATALOG_ENGINE_ELEMENTS_ADDED: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
  };
  CATALOG_ENGINE_ADD_ELEMENTS_ERROR: {
    collectionId: string;
    error: unknown;
  };
  // set items
  CATALOG_ENGINE_SET_ELEMENTS_REQUEST: {
    collectionId: string;
    items: T[];
  };
  CATALOG_ENGINE_ELEMENTS_SET: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
  };
  CATALOG_ENGINE_SET_ELEMENTS_ERROR: {
    collectionId: string;
    error: unknown;
  };
  // Remove items
  CATALOG_ENGINE_REMOVE_ELEMENTS_REQUEST: {
    itemCollectionId: string;
    itemIds: string[];
  };
  CATALOG_ENGINE_ELEMENTS_REMOVED: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
    itemIds: string[];
  };
  CATALOG_ENGINE_REMOVE_ELEMENTS_ERROR: {
    itemCollectionId: string;
    error: unknown;
  };
  // GET Catalog content
  CATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST: { collectionId: string };
  CATALOG_ENGINE_COLLECTION_CONTENT: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
    items: T[];
  };
  CATALOG_ENGINE_GET_COLLECTION_CONTENT_ERROR: {
    itemCollectionId: string;
    error: unknown;
  };
  // Get Catalog Descriptor
  CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_REQUEST: {};
  CATALOG_ENGINE_COLLECTION_DESCRIPTORS: {
    catalogDescriptors: ItemCollectionDescriptor[];
  };
  CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_ERROR: { error: string };
  CATALOG_ENGINE_COLLECTION_ADDED: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
    items: T[];
  };
  CATALOG_ENGINE_COLLECTION_REMOVED: {
    itemCollectionDescriptor: ItemCollectionDescriptor;
  };
};

export type CatalogEngineEventRegistry<T> = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          CatalogEngineEvents<T>,
          | 'CATALOG_ENGINE_COLLECTION_CREATE_REQUEST'
          | 'CATALOG_ENGINE_CLEAR_COLLECTION_REQUEST'
          | 'CATALOG_ENGINE_ADD_ELEMENTS_REQUEST'
          | 'CATALOG_ENGINE_SET_ELEMENTS_REQUEST'
          | 'CATALOG_ENGINE_REMOVE_ELEMENTS_REQUEST'
          | 'CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_REQUEST'
          | 'CATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST'
        >,
      ]
    >;

    outgoing: MergePickEvents<
      [
        PickEvents<
          CatalogEngineEvents<T>,
          | 'CATALOG_ENGINE_CREATE_COLLECTION_ERROR'
          | 'CATALOG_ENGINE_COLLECTION_CLEARED'
          | 'CATALOG_ENGINE_CLEAR_COLLECTION_ERROR'
          | 'CATALOG_ENGINE_ELEMENTS_ADDED'
          | 'CATALOG_ENGINE_ADD_ELEMENTS_ERROR'
          | 'CATALOG_ENGINE_ELEMENTS_SET'
          | 'CATALOG_ENGINE_SET_ELEMENTS_ERROR'
          | 'CATALOG_ENGINE_ELEMENTS_REMOVED'
          | 'CATALOG_ENGINE_REMOVE_ELEMENTS_ERROR'
          | 'CATALOG_ENGINE_COLLECTION_CONTENT'
          | 'CATALOG_ENGINE_GET_COLLECTION_CONTENT_ERROR'
          | 'CATALOG_ENGINE_COLLECTION_DESCRIPTORS'
          | 'CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_ERROR'
          | 'CATALOG_ENGINE_COLLECTION_ADDED'
          | 'CATALOG_ENGINE_COLLECTION_REMOVED'
        >,
        PickEvents<
          ZirconDataProviderManagerEvents,
          'REGISTER_DATA_PROVIDER_REQUEST' | 'UNREGISTER_DATA_PROVIDER_REQUEST'
        >,
      ]
    >;
  },
  ZirconEngineEventRegistry
>;

/**
 * Item catalog core state
 */
export interface CatalogEngineState extends ZirconEngineState {
  name: string;
}

/**
 */
export abstract class CatalogEngine<
  T,
  R extends CatalogEngineEventRegistry<T> = CatalogEngineEventRegistry<T>,
> extends ZirconEngine<R> {
  private _catalogEntries: {
    [id: string]: CatalogEngineEntry<T>;
  } = {};
  private _dataType: string = 'unknown data type';
  private __dataProviderCreator: DataProviderCreatorFunction<T> = null;
  // private _indexationmethod: (el: T) => string;

  constructor(
    name: string,
    dataType: string,
    dataProviderCreator: DataProviderCreatorFunction<T>,
    // indexationMethod: (el: T) => string,
  ) {
    super();
    this.setName(name);
    this._dataType = dataType;
    this.__dataProviderCreator = dataProviderCreator;
    // this._indexationmethod = indexationMethod;
  }

  protected override listenToEvents(): void {
    this.addListener('CATALOG_ENGINE_ADD_ELEMENTS_REQUEST', (arg) => {
      this.onCATALOG_ENGINE_ADD_ELEMENTS_REQUEST(arg.collectionId, arg.items);
    });
    this.addListener('CATALOG_ENGINE_CLEAR_COLLECTION_REQUEST', (_arg) => {
      alert('onCATALOG_ENGINE_CLEAR_COLLECTION_REQUEST not implemented');
    });
    this.addListener(
      'CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_REQUEST',
      (_arg) => {
        this.onCATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_REQUEST();
      },
    );
    this.addListener('CATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST', (arg) => {
      this.onCATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST(arg.collectionId);
    });

    this.addListener('CATALOG_ENGINE_COLLECTION_CREATE_REQUEST', (arg) => {
      this.onCATALOG_ENGINE_COLLECTION_CREATE_REQUEST(
        arg.dataType,
        arg.itemCollectionDescriptor,
        arg.items,
      );
    });
  }

  private onCATALOG_ENGINE_COLLECTION_CREATE_REQUEST(
    dataType: string,
    itemCollectionDescriptor: ItemCollectionDescriptor,
    items: T[],
  ) {
    if (dataType !== this.getDataType()) return;
    this.createNewItemCollection(itemCollectionDescriptor.name, items);
  }

  private onCATALOG_ENGINE_COLLECTION_REMOVE_REQUEST(itemCollectionId: string) {
    this.removeItemCollection(itemCollectionId);
  }

  private onCATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_REQUEST() {
    this.emitItemCollectionsDescriptors();
  }

  private onCATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST(
    collectionId: string,
  ) {
    this.emitItemCollectionContent(collectionId);
  }

  private onCATALOG_ENGINE_ADD_ELEMENTS_REQUEST(
    collectionId: string,
    items: T[],
  ) {
    const cat: CatalogEngineEntry<T> = this.getCatalogEntry(collectionId);
    if (!cat) {
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_ERROR', {
        collectionId: collectionId,
        error: `collectionId=${collectionId} cannot be retrieved from item catalog collection to add items`,
      });
    } else {
      const addedItemsCount: number = cat.collection.addItems(items);
      if (addedItemsCount !== 0) {
        this.emit('CATALOG_ENGINE_ELEMENTS_ADDED', {
          itemCollectionDescriptor: cat.collection.getDescriptor(),
        });
      }
    }
  }

  protected override async onStart(): Promise<void> {
    await super.start();
    this.emitItemCollectionsDescriptors();
  }

  protected override async onStop(): Promise<void> {}

  /**
   * Type of items managed by this catalog
   * @returns
   */
  public getDataType(): string {
    return this._dataType;
  }

  private emitItemCollectionsDescriptors() {
    const cats: CatalogEngineEntry<T>[] = this.getItemCollections();
    if (!cats) {
      this.emit('CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_ERROR', {
        error: `Catalogs cannot be retrieved from item catalog collection`,
      });
    } else {
      this.emit('CATALOG_ENGINE_COLLECTION_DESCRIPTORS', {
        catalogDescriptors: cats.map((cat: CatalogEngineEntry<T>) => {
          return cat.collection.getDescriptor();
        }),
      });
    }
  }

  private emitItemCollectionContent(collectionId: string) {
    const cat: CatalogEngineEntry<T> = this.getCatalogEntry(collectionId);
    if (!cat) {
      this.emit('CATALOG_ENGINE_GET_COLLECTION_CONTENT_ERROR', {
        itemCollectionId: collectionId,
        error: `collectionId=${collectionId} cannot be retrieved from item catalog collection to get catalog content`,
      });
    } else {
      this.emit('CATALOG_ENGINE_COLLECTION_CONTENT', {
        itemCollectionDescriptor: cat.collection.getDescriptor(),
        items: Object.values(cat.collection.getItems()),
      });
    }
  }

  /**
   * Add a item in catalog
   * @param item item to add
   * @returns true if added
   */
  public clearItems(catId: string): boolean {
    const cat: CatalogEngineEntry<T> = this.getCatalogEntry(catId);
    if (!cat) {
      this.emit('CATALOG_ENGINE_CLEAR_COLLECTION_ERROR', {
        error: `Cannot clear ${catId} which is not part of item catalog : Ids : ${this.getItemCollectionIds().join(', ')}`,
      });
      return false;
    }
    if (cat.collection.clearItems()) {
      this.emit('CATALOG_ENGINE_COLLECTION_CLEARED', {
        collectionId: catId,
      });
    }
  }

  /**
   * Add a item in catalog
   * @param item item to add
   * @returns true if added
   */
  public addItem(collectionId: string, item: T): boolean {
    const itemCollection: CatalogEngineEntry<T> =
      this.getCatalogEntry(collectionId);
    if (!itemCollection) {
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_ERROR', {
        collectionId: collectionId,
        error: `Cannot add ${collectionId} which is not part of item catalog : Ids : ${this.getItemCollectionIds().join(', ')}`,
      });
      return false;
    }
    const added: boolean = itemCollection.collection.addItem(item);
    if (!added) {
      this.emit('CATALOG_ENGINE_ELEMENTS_ADDED', {
        itemCollectionDescriptor: itemCollection.collection.getDescriptor(),
      });
    }
    return added;
  }

  /**
   * Add some items in catalog
   * @param items items to add
   * @returns the list of added items indices
   */
  public addItems(catId: string, items: T[]): number {
    const coll: CatalogEngineEntry<T> = this.getCatalogEntry(catId);
    if (!coll) {
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_ERROR', {
        collectionId: catId,
        error: `Cannot add items in catalog: ${catId} which is not part of item catalog : Ids : ${this.getItemCollectionIds().join(', ')}`,
      });
      return null;
    }
    const nbAddedItems: number = coll.collection.addItems(items);
    if (nbAddedItems) {
      this.emit('CATALOG_ENGINE_ELEMENTS_ADDED', {
        itemCollectionDescriptor: coll.collection.getDescriptor(),
      });
    }
    return nbAddedItems;
  }

  /**
   * Replace items in catalog
   * @param items items to add
   * @returns the list of added items indices
   */
  public setItems(catId: string, items: T[]): number {
    const itemCollection: CatalogEngineEntry<T> = this.getCatalogEntry(catId);
    if (!itemCollection) {
      this.emit('CATALOG_ENGINE_SET_ELEMENTS_ERROR', {
        collectionId: catId,
        error: `Cannot set items in catalog: ${catId} which is not part of item catalog : Ids : ${this.getItemCollectionIds().join(', ')}`,
      });
      return null;
    }
    itemCollection.collection.clearItems();
    const nbAddedItems: number = itemCollection.collection.addItems(items);
    if (nbAddedItems > 0) {
      this.emit('CATALOG_ENGINE_ELEMENTS_SET', {
        itemCollectionDescriptor: itemCollection.collection.getDescriptor(),
      });
    }

    return nbAddedItems;
  }

  /**
   * get all catalog items
   */
  public getCollectionItems(catId: string): CatalogEngineEntry<T> {
    return this.getCatalogEntry(catId);
  }

  private createNewItemCollection(
    collectionName: string,
    items: T[],
  ): ItemArray<T> {
    const itemCollection: ItemArray<T> = new ItemArray<T>({
      id: this.getId() + '-' + collectionName,
      name: collectionName,
      itemType: this.getDataType(),
    });
    itemCollection.setItems(items);
    this.addItemCollection(itemCollection);
    return itemCollection;
  }

  /**
   * Add acollection to catalog. check if catalog type is the same as the collection type
   * @param coll
   * @returns
   */
  public addItemCollection(coll: ItemArray<T>): boolean {
    if (!coll || !this._catalogEntries) return false;
    if (coll.getItemType() !== this.getDataType()) return false;
    if (this.contains(coll)) return false;
    const dataProvider: ZirconDataProvider<ItemArray<T>> =
      this.__dataProviderCreator(
        coll.getName(),
        coll.getItemType(),
        coll.getItems(),
      );
    if (!dataProvider)
      throw new Error(
        `Data provider cannot be created for collection ${coll.getName()} with data type ${coll.getItemType()}`,
      );
    this.emit('REGISTER_DATA_PROVIDER_REQUEST', {
      dataProvider: dataProvider,
    });
    this._catalogEntries[coll.getId()] = {
      collection: coll,
      dataProvider: dataProvider,
    };
    return true;
  }

  /**
   * Add acollection to catalog. check if catalog type is the same as the collection type
   * @param coll
   * @returns
   */
  public removeItemCollection(collId: string): ItemCollectionDescriptor {
    if (!collId || !this._catalogEntries) return null;
    const catEntry = this.getCatalogEntry(collId);
    if (!catEntry) return null;
    const itemCollectionDescriptor: ItemCollectionDescriptor =
      catEntry.collection.getDescriptor();
    const dataProvider: ZirconDataProvider<ItemArray<T>> =
      catEntry.dataProvider;
    this.emit('UNREGISTER_DATA_PROVIDER_REQUEST', {
      dataProviderId: dataProvider.getId(),
    });
    delete this._catalogEntries[collId];

    this.emit('CATALOG_ENGINE_COLLECTION_REMOVED', {
      itemCollectionDescriptor: itemCollectionDescriptor,
    });
    return itemCollectionDescriptor;
  }

  /**
   * return if collection contains given item collection
   * @param coll
   * @returns
   */
  public contains(coll: ItemCollection<T>): boolean {
    if (!coll || !this._catalogEntries) return false;
    return this._catalogEntries[coll.getId()] != null;
  }

  /**
   * get all stored item collection ids
   * @returns
   */
  public getItemCollectionIds(): string[] {
    return Object.keys(this._catalogEntries);
  }

  /**
   * get all stored item collections
   * @returns
   */
  public getItemCollections(): CatalogEngineEntry<T>[] {
    return Object.values(this._catalogEntries);
  }

  /**
   * get item collection with given id
   * @returns
   */
  public getCatalogEntry(id: string): CatalogEngineEntry<T> {
    if (!id || !this._catalogEntries) return null;
    return this._catalogEntries[id];
  }
}

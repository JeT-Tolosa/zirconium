import { contains } from 'jquery';
import { ItemArray } from '../../libraries/collection/item-array';
import { ItemCollectionDescriptor } from '../../libraries/collection/item-collection';
import {
  ZirconEngine,
  ZirconEngineEventRegistry,
  ZirconEngineState,
} from '../../zirconium/zircon-core/zircon-engine';
import { ZirconDataProvider } from '../../zirconium/zircon-data/zircon-data-provider';

import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';

interface CatalogEngineCollection<T> {
  collection: ItemArray<T>;
  dataProvider: ZirconDataProvider<T>;
}
/**
 * Events
 */
export type CatalogEngineEvents<T> = {
  // create catalog
  CATALOG_ENGINE_COLLECTION_CREATE_REQUEST: {
    dataType: string;
    collectionDescriptor: ItemCollectionDescriptor;
    items?: T[];
  };
  CATALOG_ENGINE_COLLECTION_CREATED: {
    collectionDescriptor: ItemCollectionDescriptor;
    items: T[];
  };
  CATALOG_ENGINE_CREATE_COLLECTION_ERROR: { collectionDescriptor: string };
  // Clear Catalog
  CATALOG_ENGINE_CLEAR_COLLECTION_REQUEST: { collectionId: string };
  CATALOG_ENGINE_CLEAR_COLLECTION_DONE: { collectionId: string };
  CATALOG_ENGINE_CLEAR_COLLECTION_ERROR: { error: string };
  // add items
  CATALOG_ENGINE_ADD_ELEMENTS_REQUEST: {
    collectionId: string;
    items: T[];
  };
  CATALOG_ENGINE_ADD_ELEMENTS_DONE: {
    collectionId: string;
    collectionName: string;
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
  CATALOG_ENGINE_SET_ELEMENTS_DONE: {
    collectionId: string;
    };
  CATALOG_ENGINE_SET_ELEMENTS_ERROR: {
    collectionId: string;
    error: unknown;
  };
  // Remove items
  CATALOG_ENGINE_REMOVE_ELEMENTS_REQUEST: {
    collectionId: string;
    itemIds: string[];
  };
  CATALOG_ENGINE_REMOVE_ELEMENTS_DONE: {
    collectionId: string;
    itemIds: string[];
  };
  CATALOG_ENGINE_REMOVE_ELEMENTS_ERROR: {
    collectionId: string;
    error: unknown;
  };
  // GET Catalog content
  CATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST: { collectionId: string };
  CATALOG_ENGINE_GET_COLLECTION_CONTENT_DONE: {
    catalogDescriptor: ItemCollectionDescriptor;
    items: T[];
  };
  CATALOG_ENGINE_GET_COLLECTION_CONTENT_ERROR: {
    collectionId: string;
    error: unknown;
  };
  // Get Catalog Descriptor
  CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_REQUEST: {};
  CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_DONE: {
    catalogDescriptors: ItemCollectionDescriptor[];
  };
  CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_ERROR: { error: string };
  CATALOG_ENGINE_COLLECTION_ADDED: { collectionId: string };
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
          | 'CATALOG_ENGINE_COLLECTION_CREATED'
          | 'CATALOG_ENGINE_CREATE_COLLECTION_ERROR'
          | 'CATALOG_ENGINE_CLEAR_COLLECTION_DONE'
          | 'CATALOG_ENGINE_CLEAR_COLLECTION_ERROR'
          | 'CATALOG_ENGINE_ADD_ELEMENTS_DONE'
          | 'CATALOG_ENGINE_ADD_ELEMENTS_ERROR'
          | 'CATALOG_ENGINE_SET_ELEMENTS_DONE'
          | 'CATALOG_ENGINE_SET_ELEMENTS_ERROR'
          | 'CATALOG_ENGINE_REMOVE_ELEMENTS_DONE'
          | 'CATALOG_ENGINE_REMOVE_ELEMENTS_ERROR'
          | 'CATALOG_ENGINE_GET_COLLECTION_CONTENT_DONE'
          | 'CATALOG_ENGINE_GET_COLLECTION_CONTENT_ERROR'
          | 'CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_DONE'
          | 'CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_ERROR'
          | 'CATALOG_ENGINE_COLLECTION_ADDED'
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
  private _itemCollections: {
    [id: string]: CatalogEngineCollection<T>;
  } = {};
  private _dataType: string = 'unknown data type';
  private __dataProviderCreator: (cat: ItemArray<T>) => ZirconDataProvider<T>
  // private _indexationmethod: (el: T) => string;

  constructor(
    name: string,
    dataType: string,
    dataProviderCreator: (cat: ItemArray<T>) => ZirconDataProvider<T>,
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
        arg.collectionDescriptor,
        arg.items,
      );
    });
  }

  private onCATALOG_ENGINE_COLLECTION_CREATE_REQUEST(
    dataType: string,
    collectionDescriptor: ItemCollectionDescriptor,
    items: T[],
  ) {
    if (dataType !== this.getDataType()) return;
    const collection: ItemArray<T> = this.createNewItemCollection(
      collectionDescriptor.name,
      items,
    );
    this.emit('CATALOG_ENGINE_COLLECTION_CREATED', {
      collectionDescriptor: collection.getDescriptor(),
      items: Object.values(collection.getItems()),
    });
  }

  private onCATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_REQUEST() {
    const cats: CatalogEngineCollection<T>[] = this.getCatalogs();
    if (!cats) {
      this.emit('CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_ERROR', {
        error: `Catalogs cannot be retrieved from item catalog collection`,
      });
    } else {
      this.emit('CATALOG_ENGINE_GET_COLLECTION_DESCRIPTORS_DONE', {
        catalogDescriptors: cats.map((cat: CatalogEngineCollection<T>) => {
          return cat.collection.getDescriptor();
        }),
      });
    }
  }

  private onCATALOG_ENGINE_GET_COLLECTION_CONTENT_REQUEST(
    collectionId: string,
  ) {
    const cat: CatalogEngineCollection<T> = this.getCatalog(collectionId);
    if (!cat) {
      this.emit('CATALOG_ENGINE_GET_COLLECTION_CONTENT_ERROR', {
        collectionId: collectionId,
        error: `collectionId=${collectionId} cannot be retrieved from item catalog collection to get catalog content`,
      });
    } else {
      this.emit('CATALOG_ENGINE_GET_COLLECTION_CONTENT_DONE', {
        catalogDescriptor: cat.collection.getDescriptor(),
        items: Object.values(cat.collection.getItems()),
      });
    }
  }
  private onCATALOG_ENGINE_ADD_ELEMENTS_REQUEST(
    collectionId: string,
    items: T[],
  ) {
    const cat: CatalogEngineCollection<T> = this.getCatalog(collectionId);
    if (!cat) {
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_ERROR', {
        collectionId: collectionId,
        error: `collectionId=${collectionId} cannot be retrieved from item catalog collection to add items`,
      });
    } else {
      const addedItemsCount: number = cat.collection.addItems(items);
      if (addedItemsCount !== 0) {
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_DONE', {
        collectionId: cat.collection.getId(),
        collectionName: cat.collection.getName(),
      });
    }
  }
}

  protected override onStart(): Promise<void> {
    return Promise.resolve();
  }
  protected override onStop(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Type of items managed by this catalog
   * @returns
   */
  public getDataType(): string {
    return this._dataType;
  }

  /**
   * Add a item in catalog
   * @param item item to add
   * @returns true if added
   */
  public clearItems(catId: string): boolean {
    const cat: CatalogEngineCollection<T> = this.getCatalog(catId);
    if (!cat) {
      this.emit('CATALOG_ENGINE_CLEAR_COLLECTION_ERROR', {
        error: `Cannot clear ${catId} which is not part of item catalog : Ids : ${this.getCatalogIds().join(', ')}`,
      });
      return false;
    }
    if (cat.collection.clearItems()) {
      this.emit('CATALOG_ENGINE_CLEAR_COLLECTION_DONE', {
        collectionId: catId,
      });
    }
  }

  /**
   * Add a item in catalog
   * @param item item to add
   * @returns true if added
   */
  public addItem(catId: string, item: T): boolean {
    const cat: CatalogEngineCollection<T> = this.getCatalog(catId);
    if (!cat) {
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_ERROR', {
        collectionId: catId,
        error: `Cannot add ${catId} which is not part of item catalog : Ids : ${this.getCatalogIds().join(', ')}`,
      });
      return false;
    }
    const added: boolean = cat.collection.addItem(item);
    if (!added) {
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_DONE', {
        collectionId: catId,
        collectionName: cat.collection.getName(),
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
    const cat: CatalogEngineCollection<T> = this.getCatalog(catId);
    if (!cat) {
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_ERROR', {
        collectionId: catId,
        error: `Cannot add items in catalog: ${catId} which is not part of item catalog : Ids : ${this.getCatalogIds().join(', ')}`,
      });
      return null;
    }
    let nbAddedItems: number = cat.collection.addItems(items);
    if (nbAddedItems) {
      this.emit('CATALOG_ENGINE_ADD_ELEMENTS_DONE', {
        collectionId: catId,
        collectionName: cat.collection.getName(),
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
    const cat: CatalogEngineCollection<T> = this.getCatalog(catId);
    if (!cat) {
      this.emit('CATALOG_ENGINE_SET_ELEMENTS_ERROR', {
        collectionId: catId,
        error: `Cannot set items in catalog: ${catId} which is not part of item catalog : Ids : ${this.getCatalogIds().join(', ')}`,
      });
      return null;
    }
    cat.collection.clearItems();
    let nbAddedItems: number = cat.collection.addItems(items);
    if (nbAddedItems > 0) {
      this.emit('CATALOG_ENGINE_SET_ELEMENTS_DONE', {
        collectionId: catId,
      });
    }

    return nbAddedItems;
  }

  /**
   * get all catalog items
   */
  public getCollectionItems(catId: string): CatalogEngineCollection<T> {
    return this.getCatalog(catId);
  }

  private createNewItemCollection(
    collectionName: string,
    items: T[],
  ): ItemArray<T> {
    const cat: ItemArray<T> = new ItemArray<T>(
      this.getDataType(),
      {
        id: this.getId() + '-' + collectionName,
        name: collectionName,
        type: this.getDataType(),
      },
    );
    cat.setItems(items);
    this.addCatalog(cat);
    return cat;
  }

  /**
   * Add a catalog to collection. check if catalog type is the same as the collection type
   * @param cat
   * @returns
   */
  public addCatalog(cat: ItemArray<T>): boolean {
    if (!cat || !this._itemCollections) return false;
    if (cat.getItemType() !== this.getDataType()) return false;
    if (this.contains(cat)) return false;
    this._itemCollections[cat.getId()] = {
      collection: cat,
      dataProvider: this.generateDataProvider(cat),
    };
    this.emit('CATALOG_ENGINE_COLLECTION_ADDED', { collectionId: cat.getId() });
    return true;
  }

  private generateDataProvider(cat: ItemArray<T>): ItemArrayDataProvider<T> {
    const dataProvider: ItemArrayDataProvider<T> = new ItemArrayDataProvider<T>(
      `${cat.getName()}-data-provider`,
    }

  /**
   * return if collection contains given catalog
   * @param cat
   * @returns
   */
  public contains(cat: ItemArray<T>): boolean {
    if (!cat || !this._itemCollections) return false;
    return this._itemCollections[cat.getId()] != null;
  }

  /**
   * get all stored catalog ids
   * @returns
   */
  public getCatalogIds(): string[] {
    return Object.keys(this._itemCollections);
  }

  /**
   * get all stored catalogs
   * @returns
   */
  public getCatalogs(): CatalogEngineCollection<T>[] {
    return Object.values(this._itemCollections);
  }

  /**
   * get catalog with given id
   * @returns
   */
  public getCatalog(id: string): CatalogEngineCollection<T> {
    if (!id || !this._itemCollections) return null;
    return this._itemCollections[id];
  }
}

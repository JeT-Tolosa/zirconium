import {
  ZirconEngine,
  ZirconEngineEventRegistry,
  ZirconEngineState,
} from '../../zirconium/zircon-core/zircon-engine';
import { Catalog, CatalogDescriptor } from '../../libraries/catalog/catalog';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import {
  CatalogCollection,
  CatalogCollectionEvents,
} from '../../libraries/catalog/catalog-collection';

/**
 * Events
 */
export type CatalogEngineEvents<CatalogElement> = {
  // create catalog
  COLLECTION_CREATE_CATALOG_REQUEST: {
    catalogType: string;
    catalogDescriptor: CatalogDescriptor;
    elements?: CatalogElement[];
  };
  COLLECTION_CREATE_CATALOG_DONE: {
    catalogDescriptor: CatalogDescriptor;
    elements: CatalogElement[];
  };
  COLLECTION_CREATE_CATALOG_ERROR: { catalogDescriptor: string };
  // Clear Catalog
  COLLECTION_CLEAR_CATALOG_REQUEST: { catalogId: string };
  COLLECTION_CLEAR_CATALOG_DONE: { catalogId: string };
  COLLECTION_CLEAR_CATALOG_ERROR: { error: string };
  // add elements
  COLLECTION_ADD_ELEMENTS_REQUEST: {
    catalogId: string;
    elements: CatalogElement[];
  };
  COLLECTION_ADD_ELEMENTS_DONE: {
    catalogId: string;
    catalogName: string;
    elementIds: string[];
  };
  COLLECTION_ADD_ELEMENTS_ERROR: {
    catalogId: string;
    error: unknown;
  };
  // set elements
  COLLECTION_SET_ELEMENTS_REQUEST: {
    catalogId: string;
    elements: CatalogElement[];
  };
  COLLECTION_SET_ELEMENTS_DONE: {
    catalogId: string;
    elementIds: string[];
  };
  COLLECTION_SET_ELEMENTS_ERROR: {
    catalogId: string;
    error: unknown;
  };
  // Remove elements
  COLLECTION_REMOVE_ELEMENTS_REQUEST: {
    catalogId: string;
    elementIds: string[];
  };
  COLLECTION_REMOVE_ELEMENTS_DONE: {
    catalogId: string;
    elementIds: string[];
  };
  COLLECTION_REMOVE_ELEMENTS_ERROR: {
    catalogId: string;
    error: unknown;
  };
  // GET Catalog content
  COLLECTION_GET_CATALOG_CONTENT_REQUEST: { catalogId: string };
  COLLECTION_GET_CATALOG_CONTENT_DONE: {
    catalogDescriptor: CatalogDescriptor;
    elements: CatalogElement[];
  };
  COLLECTION_GET_CATALOG_CONTENT_ERROR: { catalogId: string; error: unknown };
  // Get Catalog Descriptor
  COLLECTION_GET_CATALOG_DESCRIPTORS_REQUEST: {};
  COLLECTION_GET_CATALOG_DESCRIPTORS_DONE: {
    catalogDescriptors: CatalogDescriptor[];
  };
  COLLECTION_GET_CATALOG_DESCRIPTORS_ERROR: { error: string };
};

export type CatalogEngineEventRegistry<CatalogElement> = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          CatalogEngineEvents<CatalogElement>,
          | 'COLLECTION_CREATE_CATALOG_REQUEST'
          | 'COLLECTION_CLEAR_CATALOG_REQUEST'
          | 'COLLECTION_ADD_ELEMENTS_REQUEST'
          | 'COLLECTION_SET_ELEMENTS_REQUEST'
          | 'COLLECTION_REMOVE_ELEMENTS_REQUEST'
          | 'COLLECTION_GET_CATALOG_DESCRIPTORS_REQUEST'
          | 'COLLECTION_GET_CATALOG_CONTENT_REQUEST'
        >,
        PickEvents<CatalogCollectionEvents, 'CATALOG_COLLECTION_CHANGED'>,
      ]
    >;

    outgoing: MergePickEvents<
      [
        PickEvents<
          CatalogEngineEvents<CatalogElement>,
          | 'COLLECTION_CREATE_CATALOG_DONE'
          | 'COLLECTION_CREATE_CATALOG_ERROR'
          | 'COLLECTION_CLEAR_CATALOG_DONE'
          | 'COLLECTION_CLEAR_CATALOG_ERROR'
          | 'COLLECTION_ADD_ELEMENTS_DONE'
          | 'COLLECTION_ADD_ELEMENTS_ERROR'
          | 'COLLECTION_SET_ELEMENTS_DONE'
          | 'COLLECTION_SET_ELEMENTS_ERROR'
          | 'COLLECTION_REMOVE_ELEMENTS_DONE'
          | 'COLLECTION_REMOVE_ELEMENTS_ERROR'
          | 'COLLECTION_GET_CATALOG_CONTENT_DONE'
          | 'COLLECTION_GET_CATALOG_CONTENT_ERROR'
          | 'COLLECTION_GET_CATALOG_DESCRIPTORS_DONE'
          | 'COLLECTION_GET_CATALOG_DESCRIPTORS_ERROR'
        >,
        PickEvents<CatalogCollectionEvents, 'MANAGED_CATALOG_CONTENT_CHANGED'>,
      ]
    >;
  },
  ZirconEngineEventRegistry
>;

/**
 * Element catalog core state
 */
export interface CatalogEngineState extends ZirconEngineState {
  name: string;
}

/**
 * Element Catalog Zircon Core object
 */
export class CatalogEngine<
  CatalogElement,
  R extends CatalogEngineEventRegistry<CatalogElement> =
    CatalogEngineEventRegistry<CatalogElement>,
> extends ZirconEngine<R> {
  private _catColl: CatalogCollection<CatalogElement> = null;
  private _catalogType: string = 'generic';
  private _indexation: (el: CatalogElement) => string;

  constructor(
    name: string,
    catalogType: string,
    indexation: (el: CatalogElement) => string,
  ) {
    super();
    this.setName(name);
    this._catalogType = catalogType;
    this._indexation = indexation;
    this._catColl = new CatalogCollection<CatalogElement>(
      catalogType,
      indexation,
    );

    // respond to catalog event
    this._catColl.subscriber('MANAGED_CATALOG_CONTENT_CHANGED', (arg) => {
      this.emit('MANAGED_CATALOG_CONTENT_CHANGED', {
        catalogType: this.getCatalogType(),
        catalogId: arg.catalogId,
      });
    });
  }

  protected override listenToEvents(): void {
    this.addListener('COLLECTION_ADD_ELEMENTS_REQUEST', (arg) => {
      this.onCOLLECTION_ADD_ELEMENTS_REQUEST(arg.catalogId, arg.elements);
    });
    this.addListener('COLLECTION_CLEAR_CATALOG_REQUEST', (_arg) => {
      alert('onCOLLECTION_CLEAR_CATALOG_REQUEST not implemented');
    });
    this.addListener('COLLECTION_GET_CATALOG_DESCRIPTORS_REQUEST', (_arg) => {
      this.onCOLLECTION_GET_CATALOG_DESCRIPTORS_REQUEST();
    });
    this.addListener('COLLECTION_GET_CATALOG_CONTENT_REQUEST', (arg) => {
      this.onCOLLECTION_GET_CATALOG_REQUEST(arg.catalogId);
    });
    this.addListener('COLLECTION_CREATE_CATALOG_REQUEST', (arg) => {
      this.onCOLLECTION_CREATE_CATALOG_REQUEST(
        arg.catalogType,
        arg.catalogDescriptor,
        arg.elements,
      );
    });
  }

  private onCOLLECTION_CREATE_CATALOG_REQUEST(
    catalogType: string,
    catalogDescriptor: CatalogDescriptor,
    elements: CatalogElement[],
  ) {
    if (catalogType !== this.getCatalogType()) return;

    const cat: Catalog<CatalogElement> = this.createNewCatalog(
      catalogDescriptor.name,
      elements,
    );
    this.emit('COLLECTION_CREATE_CATALOG_DONE', {
      catalogDescriptor: cat.getDescriptor(),

      elements: Object.values(cat.getElements()),
    });
  }

  private onCOLLECTION_GET_CATALOG_DESCRIPTORS_REQUEST() {
    const cats: Catalog<CatalogElement>[] = this._catColl.getCatalogs();
    if (!cats) {
      this.emit('COLLECTION_GET_CATALOG_DESCRIPTORS_ERROR', {
        error: `Catalogs cannot be retrieved from element catalog collection`,
      });
    } else {
      this.emit('COLLECTION_GET_CATALOG_DESCRIPTORS_DONE', {
        catalogDescriptors: cats.map((cat: Catalog<CatalogElement>) => {
          return cat.getDescriptor();
        }),
      });
    }
  }

  private onCOLLECTION_GET_CATALOG_REQUEST(catalogId: string) {
    const cat: Catalog<CatalogElement> = this._catColl.getCatalog(catalogId);
    if (!cat) {
      this.emit('COLLECTION_GET_CATALOG_CONTENT_ERROR', {
        catalogId: catalogId,
        error: `catalogId=${catalogId} cannot be retrieved from element catalog collection`,
      });
    } else {
      this.emit('COLLECTION_GET_CATALOG_CONTENT_DONE', {
        catalogDescriptor: cat.getDescriptor(),
        elements: Object.values(cat.getElements()),
      });
    }
  }
  private onCOLLECTION_ADD_ELEMENTS_REQUEST(
    catalogId: string,
    elements: CatalogElement[],
  ) {
    const cat: Catalog<CatalogElement> = this._catColl.getCatalog(catalogId);
    if (!cat) {
      this.emit('COLLECTION_ADD_ELEMENTS_ERROR', {
        catalogId: catalogId,
        error: `catalogId=${catalogId} cannot be retrieved from element catalog collection`,
      });
    } else {
      const addedElementsIds: string[] = cat.addElements(elements);
      this.emit('COLLECTION_ADD_ELEMENTS_DONE', {
        catalogId: cat.getId(),
        catalogName: cat.getName(),
        elementIds: addedElementsIds,
      });
    }
  }

  protected override onStart(): Promise<void> {
    return Promise.resolve();
  }
  protected override onStop(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Type of elements managed by this catalog
   * @returns
   */
  public getCatalogType(): string {
    return this._catalogType;
  }

  /**
   * Add a element in catalog
   * @param element element to add
   * @returns true if added
   */
  public clearElements(catId: string): boolean {
    const cat: Catalog<CatalogElement> = this._catColl.getCatalog(catId);
    if (!cat) {
      this.emit('COLLECTION_CLEAR_CATALOG_ERROR', {
        error: `Cannot clear ${catId} which is not part of element catalog : Ids : ${this._catColl.getCatalogIds().join(', ')}`,
      });
      return false;
    }
    if (cat.clearElements()) {
      this.emit('COLLECTION_CLEAR_CATALOG_DONE', {
        catalogId: catId,
      });
    }
  }

  /**
   * Add a element in catalog
   * @param element element to add
   * @returns true if added
   */
  public addElement(catId: string, element: CatalogElement): boolean {
    const cat: Catalog<CatalogElement> = this._catColl.getCatalog(catId);
    if (!cat) {
      this.emit('COLLECTION_ADD_ELEMENTS_ERROR', {
        catalogId: catId,
        error: `Cannot add ${catId} which is not part of element catalog : Ids : ${this._catColl.getCatalogIds().join(', ')}`,
      });
      return false;
    }
    const elementId: string = cat.addElement(element);
    if (!elementId) {
      this.emit('COLLECTION_ADD_ELEMENTS_DONE', {
        catalogId: catId,
        catalogName: cat.getName(),
        elementIds: [elementId],
      });
      return true;
    }
    return false;
  }

  /**
   * Add some elements in catalog
   * @param elements elements to add
   * @returns the list of added elements indices
   */
  public addElements(catId: string, elements: CatalogElement[]): string[] {
    const cat: Catalog<CatalogElement> = this._catColl.getCatalog(catId);
    if (!cat) {
      this.emit('COLLECTION_ADD_ELEMENTS_ERROR', {
        catalogId: catId,
        error: `Cannot add elements in catalog: ${catId} which is not part of element catalog : Ids : ${this._catColl.getCatalogIds().join(', ')}`,
      });
      return null;
    }
    const addedIndices: string[] = cat.addElements(elements);
    if (addedIndices && addedIndices.length > 0) {
      this.emit('COLLECTION_ADD_ELEMENTS_DONE', {
        catalogId: catId,
        catalogName: cat.getName(),
        elementIds: addedIndices,
      });
    }
    return addedIndices;
  }

  /**
   * Replace elements in catalog
   * @param elements elements to add
   * @returns the list of added elements indices
   */
  public setElements(catId: string, elements: CatalogElement[]): string[] {
    const cat: Catalog<CatalogElement> = this._catColl.getCatalog(catId);
    if (!cat) {
      this.emit('COLLECTION_SET_ELEMENTS_ERROR', {
        catalogId: catId,
        error: `Cannot set elements in catalog: ${catId} which is not part of element catalog : Ids : ${this._catColl.getCatalogIds().join(', ')}`,
      });
      return null;
    }
    cat.clearElements();
    const addedIndices: string[] = cat.addElements(elements);
    if (addedIndices && addedIndices.length > 0) {
      this.emit('COLLECTION_SET_ELEMENTS_DONE', {
        catalogId: catId,
        elementIds: addedIndices,
      });
    }

    return addedIndices;
  }

  /**
   * get all catalog elements
   */
  public getCatalogElements(catId: string): {
    [index: string]: CatalogElement;
  } {
    const cat: Catalog<CatalogElement> = this._catColl.getCatalog(catId);
    return cat?.getElements();
  }

  private createNewCatalog(
    catalogName: string,
    elements: CatalogElement[],
  ): Catalog<CatalogElement> {
    const cat: Catalog<CatalogElement> = new Catalog<CatalogElement>(
      this.getCatalogType(),
      {
        name: catalogName,
      } as CatalogDescriptor,
      this._indexation,
    );
    cat.setElements(elements);
    this._catColl.addCatalog(cat);
    return cat;
  }
}

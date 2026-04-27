import { EventEmitter } from 'events';
import { Catalog } from './catalog';
import { PickEvents } from '../../zirconium/zircon-event';

// export enum CatalogCollectionEvents {
//   CATALOG_COLLECTION_CHANGED = 'CATALOG_COLLECTION_CHANGED', // { catalogId: string }
// }

// export const CatalogCollectionEvents = {
//   CATALOG_COLLECTION_CHANGED: 'CATALOG_COLLECTION_CHANGED',
//   MANAGED_CATALOG_CONTENT_CHANGED: 'MANAGED_CATALOG_CONTENT_CHANGED',
// } as const;

export type CatalogCollectionEvents = {
  CATALOG_COLLECTION_CHANGED: {};
  MANAGED_CATALOG_CONTENT_CHANGED: {
    catalogType: string;
    catalogId: string;
  };
};

export type CatalogCollectionEventRegistry = {
  incoming: {};
  outgoing: PickEvents<
    CatalogCollectionEvents,
    'CATALOG_COLLECTION_CHANGED' | 'MANAGED_CATALOG_CONTENT_CHANGED'
  >;
};

export class CatalogCollection<CatalogElement> {
  private _catalogType: string = 'generic';
  private _catalogs: { [id: string]: Catalog<CatalogElement> } = {};
  private _eventEmitter: EventEmitter = new EventEmitter();
  private _emitEvents: boolean = true;
  private _indexationMethod: (el: CatalogElement) => string;

  constructor(
    catalogType: string,
    indexationMethod: (el: CatalogElement) => string,
  ) {
    this._catalogType = catalogType;
    this._indexationMethod = indexationMethod;
  }

  public getCatalogType(): string {
    return this._catalogType;
  }

  private emit<K extends keyof CatalogCollectionEventRegistry['outgoing']>(
    eventName: K,
    arg: CatalogCollectionEventRegistry['outgoing'][K],
  ): boolean {
    if (!this.areEventsAllowed()) return false;
    this._eventEmitter.emit(eventName, arg);
    return true;
  }

  public subscriber<K extends keyof CatalogCollectionEventRegistry['outgoing']>(
    eventName: K,
    callback: (arg: CatalogCollectionEventRegistry['outgoing'][K]) => void,
  ) {
    this._eventEmitter.addListener(eventName, callback);
  }

  /** stop emitting events */
  public allowEvents(emission: boolean): void {
    this._emitEvents = emission;
  }

  /** return if event emission if on */
  public areEventsAllowed(): boolean {
    return this._emitEvents;
  }

  /**
   * Add a catalog to collection. check if catalog type is the same as the collection type
   * @param cat
   * @returns
   */
  public addCatalog(cat: Catalog<CatalogElement>): boolean {
    if (!cat || !this._catalogs) return false;
    if (cat.getCatalogType() !== this.getCatalogType()) return false;
    if (this.contains(cat)) return false;
    this._catalogs[cat.getId()] = cat;
    cat.subscriber('CATALOG_CONTENT_CHANGED', (arg) => {
      this.onCatalogContentChanged(arg.catalogId);
    });
    this.emit('CATALOG_COLLECTION_CHANGED', {});
    return true;
  }

  private onCatalogContentChanged(catalogId: string): void {
    if (catalogId)
      this.emit('MANAGED_CATALOG_CONTENT_CHANGED', {
        catalogType: this.getCatalogType(),
        catalogId: catalogId,
      });
  }

  /**
   * return if collection contains given catalog
   * @param cat
   * @returns
   */
  public contains(cat: Catalog<CatalogElement>): boolean {
    if (!cat || !this._catalogs) return false;
    return this._catalogs[cat.getId()] != null;
  }

  /**
   * get all stored catalog ids
   * @returns
   */
  public getCatalogIds(): string[] {
    return Object.keys(this._catalogs);
  }

  /**
   * get all stored catalogs
   * @returns
   */
  public getCatalogs(): Catalog<CatalogElement>[] {
    return Object.values(this._catalogs);
  }

  /**
   * get catalog with given id
   * @returns
   */
  public getCatalog(id: string): Catalog<CatalogElement> {
    if (!id || !this._catalogs) return null;
    return this._catalogs[id];
  }
}

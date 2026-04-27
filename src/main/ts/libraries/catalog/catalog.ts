import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { PickEvents } from '../../zirconium/zircon-event';

export type CatalogEvents = {
  CATALOG_CONTENT_CHANGED: {
    catalogId: string;
  };
};

export type CatalogEventRegistry = {
  incoming: {};
  outgoing: PickEvents<CatalogEvents, 'CATALOG_CONTENT_CHANGED'>;
};

export interface CatalogDescriptor {
  id?: string;
  name?: string;
  type?: string;
}

export class Catalog<CatalogElement> {
  private _desc: CatalogDescriptor = {
    id: uuid(),
    name: 'catalog',
  };
  private _catalogType: string = 'generic';
  private _elements: { [index: string]: CatalogElement } = {};
  private _indexationMethod: (el: CatalogElement) => string;
  private _eventEmitter: EventEmitter = new EventEmitter();
  private _emitEvents: boolean = true;

  /**
   * constructor
   * @param indexation indexation method
   */
  constructor(
    catalogType: string,
    catalogDescriptor: CatalogDescriptor,
    indexation: (el: CatalogElement) => string,
  ) {
    this._catalogType = catalogType;
    this._desc = { ...catalogDescriptor };
    if (!this._desc.id) this._desc.id = uuid(); // assign a random id if not defined
    this.setIndexMethod(indexation);
  }

  public getCatalogType(): string {
    return this._catalogType;
  }

  private emit<K extends keyof CatalogEventRegistry['outgoing']>(
    event: K,
    arg: CatalogEventRegistry['outgoing'][K],
  ): boolean {
    if (!this.areEventsAllowed()) return false;
    this._eventEmitter.emit(event, arg);
    return true;
  }

  public subscriber<K extends keyof CatalogEventRegistry['outgoing']>(
    eventName: K,
    callback: (arg: CatalogEventRegistry['outgoing'][K]) => void,
  ) {
    this._eventEmitter.addListener(eventName, callback);
  }

  /**
   * Set indexation method
   * @param indexation
   */
  private setIndexMethod(indexation: (el: CatalogElement) => string): void {
    this._indexationMethod = indexation;
  }

  /**
   * Get indexation method
   * @return indexation method
   */
  public getIndexMethod(): (el: CatalogElement) => string {
    return this._indexationMethod;
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
   * Set name method
   * @param name new catalog name
   */
  public setName(name: string): void {
    this._desc.name = name;
  }

  /**
   * @returns catalog name
   */
  public getName(): string {
    return this._desc.name;
  }

  /**
   * @returns catalog id
   */
  public getId(): string {
    return this._desc.id;
  }

  public getDescriptor(): CatalogDescriptor {
    return {
      id: this.getId(),
      name: this.getName(),
      type: this.getCatalogType(),
    };
  }

  public getElementCount(): number {
    if (!this._elements) return 0;
    return Object.keys(this._elements).length;
  }

  /**
   * Create a new identical Catalog
   */
  public duplicate(name: string): Catalog<CatalogElement> {
    const cat: Catalog<CatalogElement> = new Catalog(
      this.getCatalogType(),
      { ...this.getDescriptor(), name: name }, // override name
      this._indexationMethod,
    );
    cat.addElements(Object.values(this.getElements()));
    return cat;
  }

  /**
   * get element computed index
   * @param el
   * @returns index as string
   */
  private getIndex(el: CatalogElement): string {
    if (!el) return null;
    return this._indexationMethod(el);
  }

  /**
   * Add an element to the catalog
   * @param el element to add
   * @returns index if added, null if not
   */
  public addElement(el: CatalogElement): string {
    if (!el) return null;
    const index = this.getIndex(el);
    if (!index) return null;
    if (JSON.stringify(this._elements[index]) === JSON.stringify(el))
      return null;
    this._elements[index] = el;
    this.emit('CATALOG_CONTENT_CHANGED', {
      catalogId: this.getId(),
    });
    return index;
  }

  /**
   * Add a collection of elements to the catalog
   * @param els element array to add
   * @returns the collection of added indices
   */
  public addElements(els: CatalogElement[]): string[] {
    if (!els) return null;
    const addedIndices: string[] = [];
    const emission: boolean = this.areEventsAllowed();
    this.allowEvents(false); // disable event emission
    els.forEach((el: CatalogElement) => {
      const index: string = this.addElement(el);
      if (index) addedIndices.push(index);
    });
    this.allowEvents(emission); // reset event emission
    if (addedIndices.length > 0)
      this.emit('CATALOG_CONTENT_CHANGED', {
        catalogId: this.getId(),
      });
    return addedIndices;
  }

  /**
   * Replace all stored elements
   * @returns
   */
  public setElements(els: CatalogElement[]): string[] {
    const emission: boolean = this.areEventsAllowed();
    this.allowEvents(false); // disable event emission
    this.clearElements();
    this.allowEvents(emission); // reset event emission
    return this.addElements(els); // add elements fires an event
  }

  /**
   * get the element with given index
   * @param index
   * @returns
   */
  public getElement(index: string): CatalogElement {
    return this._elements[index];
  }

  /**
   * return true if element is in catalog
   */
  public contains(el: CatalogElement): boolean {
    const index = this.getIndex(el);
    if (!index) return false;
    return this._elements[index] != null;
  }

  /**
   * return internal collection of elements (do not modify elements !)
   * @returns
   */
  public getElements(): { [index: string]: CatalogElement } {
    return this._elements;
  }

  /**
   * Clear all stored elements
   * @returns
   */
  public clearElements(): boolean {
    if (this._elements && Object.keys(this._elements).length == 0) return false;
    this._elements = {};
    this.emit('CATALOG_CONTENT_CHANGED', {
      catalogId: this.getId(),
    });

    return true;
  }
}

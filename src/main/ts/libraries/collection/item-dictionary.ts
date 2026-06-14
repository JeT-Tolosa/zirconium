import { PickEvents } from '../../zirconium/zircon-event';
import {
  ItemCollection,
  ItemCollectionDescriptor,
  ItemCollectionEventRegistry,
  MergeItemCollectionRegistries,
} from './item-collection';

export type ItemDictionaryEvents<T> = {
  ITEM_DICTIONARY_CHANGED: {
    descriptor: ItemDictionaryDescriptor;
  };
  ITEM_DICTIONARY_CONTENT: {
    descriptor: ItemDictionaryDescriptor;
    items: T[];
  };
};

export type ItemDictionaryEventRegistry<T> = MergeItemCollectionRegistries<
  ItemCollectionEventRegistry,
  {
    incoming: {};
    outgoing: PickEvents<
      ItemDictionaryEvents<T>,
      'ITEM_DICTIONARY_CHANGED' | 'ITEM_DICTIONARY_CONTENT'
    >;
  }
>;

export interface ItemDictionaryDescriptor extends ItemCollectionDescriptor {}

export class ItemDictionary<T> extends ItemCollection<
  T,
  ItemDictionaryEventRegistry<T>
> {
  private _items: { [index: string]: T } = {};
  private _indexationMethod: (item: T) => string;

  /**
   * constructor
   * @param indexation indexation method
   */
  constructor(
    descriptor: ItemDictionaryDescriptor,
    indexation: (item: T) => string,
  ) {
    super(descriptor);
    this.setIndexMethod(indexation);
  }

  /**
   * Set indexation method
   * @param indexation
   */
  private setIndexMethod(indexation: (item: T) => string): void {
    this._indexationMethod = indexation;
  }

  public getElementCount(): number {
    if (!this._items) {
      return 0;
    }
    return Object.keys(this._items).length;
  }

  /**
   * Create a new identical ItemDictionary
   */
  public duplicate(name: string): ItemDictionary<T> {
    const cat: ItemDictionary<T> = new ItemDictionary(
      { ...this.getDescriptor(), itemType: this.getItemType(), name: name }, // override name & item type
      this._indexationMethod,
    );
    cat.addItems(Object.values(this.getItems()));
    return cat;
  }

  /**
   * get element computed index
   * @param item
   * @returns index as string
   */
  private getIndex(item: T): string {
    if (!item) {
      return null;
    }
    return this._indexationMethod(item);
  }

  /**
   * Add an element to the catalog
   * @param item element to add
   * @returns index if added, null if not
   */
  public addItem(item: T): string {
    if (!item) {
      return null;
    }
    const index = this.getIndex(item);
    if (!index) {
      return null;
    }
    if (JSON.stringify(this._items[index]) === JSON.stringify(item)) {
      return null;
    }
    this._items[index] = item;
    this.emit('ITEM_DICTIONARY_CHANGED', {
      descriptor: this.getDescriptor(),
    });
    return index;
  }

  /**
   * Add a collection of elements to the catalog
   * @param els element array to add
   * @returns the collection of added indices
   */
  public addItems(els: T[]): string[] {
    if (!els) {
      return null;
    }
    const addedIndices: string[] = [];
    const emission: boolean = this.areEventsAllowed();
    this.allowEvents(false); // disable event emission
    els.forEach((el: T) => {
      const index: string = this.addItem(el);
      if (index) {
        addedIndices.push(index);
      }
    });
    this.allowEvents(emission); // reset event emission
    if (addedIndices.length > 0) {
      this.emit('ITEM_DICTIONARY_CHANGED', {
        descriptor: this.getDescriptor(),
      });
    }
    return addedIndices;
  }

  /**
   * Replace all stored elements
   * @returns
   */
  public setItems(els: T[]): string[] {
    const emission: boolean = this.areEventsAllowed();
    this.allowEvents(false); // disable event emission
    this.clearItems();
    this.allowEvents(emission); // reset event emission
    return this.addItems(els); // add elements fires an event
  }

  /**
   * get the element with given index
   * @param index
   * @returns
   */
  public getItem(index: string): T {
    return this._items[index];
  }

  /**
   * return true if element is in catalog
   */
  public contains(item: T): boolean {
    const index = this.getIndex(item);
    if (!index) {
      return false;
    }
    return this._items[index] !== undefined && this._items[index] !== null;
  }

  /**
   * return internal collection of elements (do not modify elements !)
   * @returns
   */
  public getItems(): T[] {
    return Object.values(this._items);
  }
  /**
   * return internal collection of elements (do not modify elements !)
   * @returns
   */
  public getItemsDictionary(): { [index: string]: T } {
    return this._items;
  }

  /**
   * Clear all stored elements
   * @returns
   */
  public clearItems(): boolean {
    if (this._items && Object.keys(this._items).length === 0) {
      return true;
    }
    this._items = {};
    this.emit('ITEM_DICTIONARY_CHANGED', {
      descriptor: this.getDescriptor(),
    });

    return true;
  }
}

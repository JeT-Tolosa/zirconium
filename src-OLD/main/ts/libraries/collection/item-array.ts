import { PickEvents } from '../../zirconium/zircon-event';
import {
  ItemCollection,
  ItemCollectionEventRegistry,
  MergeCollectionRegistries,
} from './item-collection';

export type ItemArrayEvents<T> = {
  ITEM_ARRAY_CHANGED: {
    catalogDescriptor: ItemArrayDescriptor;
  };
  ITEM_ARRAY_CONTENT: {
    catalogDescriptor: ItemArrayDescriptor;
    items: T[];
  };
};

export type ItemArrayEventRegistry<T> = MergeCollectionRegistries<
  ItemCollectionEventRegistry,
  {
    incoming: {};
    outgoing: PickEvents<
      ItemArrayEvents<T>,
      'ITEM_ARRAY_CHANGED' | 'ITEM_ARRAY_CONTENT'
    >;
  }
>;

export interface ItemArrayDescriptor {
  id?: string;
  name?: string;
  type: string;
}

export class ItemArray<T> extends ItemCollection<ItemArrayEventRegistry<T>> {
  private _items: T[] = [];

  /**
   * constructor
   * @param indexation indexation method
   */
  constructor(itemType: string, descriptor: ItemArrayDescriptor) {
    super(itemType, descriptor);
  }

  public getElementCount(): number {
    if (!this._items) return 0;
    return this._items.length;
  }

  /**
   * Create a new identical ItemArray
   */
  public duplicate(name: string): ItemArray<T> {
    const cat: ItemArray<T> = new ItemArray(
      this.getItemType(),
      { ...this.getDescriptor(), name: name }, // override name
    );
    cat.addItems(this.getItems());
    return cat;
  }

  /**
   * Add an element to the catalog
   * @param item element to add
   * @returns index if added, null if not
   */
  public addItem(item: T): boolean {
    if (!item) return false;
    this._items.push(item);
    this.emit('ITEM_ARRAY_CHANGED', {
      catalogDescriptor: this.getDescriptor(),
    });
    return true;
  }

  /**
   * Add a array of elements to the catalog
   * @param items element array to add
   * @returns the array of added indices
   */
  public addItems(items: T[]): number {
    if (!items) return null;
    let nbItemsAdded: number = 0;
    const emission: boolean = this.areEventsAllowed();
    this.allowEvents(false); // disable event emission
    items.forEach((el: T) => {
      if (this.addItem(el)) {
        nbItemsAdded++;
      }
    });
    this.allowEvents(emission); // reset event emission
    if (nbItemsAdded > 0)
      this.emit('ITEM_ARRAY_CHANGED', {
        catalogDescriptor: this.getDescriptor(),
      });
    return nbItemsAdded;
  }

  /**
   * Replace all stored elements
   * @returns
   */
  public setItems(els: T[]): number {
    const emission: boolean = this.areEventsAllowed();
    this.allowEvents(false); // disable event emission
    this.clearItems();
    this.allowEvents(emission); // reset event emission
    return this.addItems(els); // add elements & fires an event
  }

  /**
   * get item at given index
   * @param index
   * @returns
   */
  public getItem(index: number): T {
    if (index < 0 || index >= this._items.length) return null;
    return this._items[index];
  }

  /**
   * return internal array of elements (do not modify elements !)
   * @returns
   */
  public getItems(): T[] {
    return this._items;
  }

  /**
   * Clear all stored elements
   * @returns
   */
  public clearItems(): boolean {
    if (this._items && this._items.length == 0) return false;
    this._items = [];
    this.emit('ITEM_ARRAY_CHANGED', {
      catalogDescriptor: this.getDescriptor(),
    });

    return true;
  }
}

import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';
import { PickEvents } from '../../zirconium/zircon-event';

export type ItemCollectionEvents<T = unknown> = {
  ITEM_COLLECTION_CONTENT_CHANGED: {
    collectionDescriptor: ItemCollectionDescriptor;
  };
  ITEM_COLLECTION_CONTENT: {
    collectionDescriptor: ItemCollectionDescriptor;
    items: T[];
  };
};
// event argument
export type EventArgument = { [key: string]: unknown };

// registry for Zircon events
export type ItemCollectionRegistry = {
  incoming: Record<string, EventArgument>;
  outgoing: Record<string, EventArgument>;
};

// merge two registries
export type MergeItemCollectionRegistries<
  A extends ItemCollectionRegistry,
  B extends ItemCollectionRegistry,
> = A & B;

export type ItemCollectionPickEvents<E, K extends keyof E> = Pick<E, K>;

export type ItemCollectionEventRegistry = {
  incoming: {};
  outgoing: PickEvents<
    ItemCollectionEvents,
    'ITEM_COLLECTION_CONTENT_CHANGED' | 'ITEM_COLLECTION_CONTENT'
  >;
};

export interface ItemCollectionDescriptor {
  id?: string;
  name?: string;
  itemType: string;
}

export abstract class ItemCollection<
  T = unknown,
  R extends ItemCollectionEventRegistry = ItemCollectionEventRegistry,
> {
  private _descriptor: ItemCollectionDescriptor = {
    id: uuid(),
    name: 'items collection',
    itemType: 'unknown type',
  };

  private _eventEmitter: EventEmitter = new EventEmitter();
  private _emitEvents: boolean = true;

  /**
   * constructor
   * @param indexation indexation method
   */
  constructor(descriptor: ItemCollectionDescriptor) {
    this._descriptor = { ...descriptor };
    this._descriptor.id = descriptor.id || uuid(); // assign a random id if not defined
  }

  public getItemType(): string {
    return this._descriptor.itemType;
  }

  protected emit<K extends keyof R['outgoing']>(
    event: K,
    arg: R['outgoing'][K],
  ): boolean {
    if (!this.areEventsAllowed()) {
      return false;
    }
    this._eventEmitter.emit(String(event), arg);
    return true;
  }

  public addListener<K extends keyof R['outgoing']>(
    eventName: K,
    callback: (arg: R['outgoing'][K]) => void,
  ) {
    this._eventEmitter.addListener(String(eventName), callback);
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
    this._descriptor.name = name;
  }

  /**
   * @returns catalog name
   */
  public getName(): string {
    return this._descriptor.name;
  }

  /**
   * @returns catalog id
   */
  public getId(): string {
    return this._descriptor.id;
  }

  public getDescriptor(): ItemCollectionDescriptor {
    return {
      id: this.getId(),
      name: this.getName(),
      itemType: this.getItemType(),
    };
  }
  public abstract getItems(): T[];
}

import { EventEmitter } from 'events';
import { v4 as uuid } from 'uuid';

export type MergeCollectionRegistries<
  A extends ItemCollectionEventRegistry,
  B extends ItemCollectionEventRegistry,
> = {
  incoming: A['incoming'] & B['incoming'];
  outgoing: A['outgoing'] & B['outgoing'];
};

export type ItemCollectionEventRegistry = {
  incoming: {};
  outgoing: {};
};

export interface ItemCollectionDescriptor {
  id?: string;
  name?: string;
  type: string;
}

export class ItemCollection<
  R extends ItemCollectionEventRegistry = ItemCollectionEventRegistry,
> {
  private _descriptor: ItemCollectionDescriptor = {
    id: uuid(),
    name: 'items collection',
    type: 'unknown type',
  };

  private _itemType: string = 'unknown data type';
  private _eventEmitter: EventEmitter = new EventEmitter();
  private _emitEvents: boolean = true;

  /**
   * constructor
   * @param indexation indexation method
   */
  constructor(itemType: string, descriptor: ItemCollectionDescriptor) {
    this._itemType = itemType;
    this._descriptor = { ...descriptor };
    this._descriptor.id = descriptor.id || uuid(); // assign a random id if not defined
  }

  public getItemType(): string {
    return this._itemType;
  }

  protected emit<K extends keyof R['outgoing']>(
    event: K,
    arg: R['outgoing'][K],
  ): boolean {
    if (!this.areEventsAllowed()) return false;
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
      type: this.getItemType(),
    };
  }
}

import { v4 as uuid } from 'uuid';
import EventEmitter2 from 'eventemitter2';
import {
  MergePickEvents,
  MergeZirconRegistries,
  ZirconRegistry,
} from './zircon-event';
import { ZirconContextMenuItem } from './zircon-menu/zircon-context-menu';
import { ZirconApplicationEvents } from './zircon-core/zircon-app';

type PickEvents<E, K extends keyof E> = {
  [P in K]: E[P];
};

export type ZirconObjectEvents = {
  ZIRCON_OBJECT_CREATED: {
    id: string;
    type: string;
    timestamp: number;
  };
  OBJECT_ID_CHANGED: { oldId: string; newId: string };
  OBJECT_NAME_CHANGED: { id: string; name: string };
  UNCAUGHT_EXCEPTION: { error: string };
};

export type ZirconObjectEventRegistry = MergeZirconRegistries<
  {
    incoming: PickEvents<ZirconApplicationEvents, 'OBJECT_STATE_REGISTERED'>;

    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconObjectEvents,
          'ZIRCON_OBJECT_CREATED' | 'OBJECT_ID_CHANGED' | 'OBJECT_NAME_CHANGED'
        >,
        PickEvents<ZirconObjectEvents, 'UNCAUGHT_EXCEPTION'>,
      ]
    >;
  },
  ZirconRegistry
>;

/**
 * Base state for all zircon objects
 */
export interface ZirconObjectState {
  id?: string;
  name?: string;
  type?: string;
}

/**
 * A Zircon Object is the base class of all managed zircon components.
 * They are subdivided in two main categories:
 * - UI objects: ZirconWindow, ZirconDesktop, ZirconDesktopManager
 * - Core objects: Database managers ...
 */
export abstract class ZirconObject<
  R extends ZirconObjectEventRegistry = ZirconObjectEventRegistry,
> {
  private _eventEmitter: EventEmitter2 = null;
  private _id: string = null;
  private _name: string = 'unnamed object';
  public static readonly ZIRCON_OBJECT_ATTRIBUTE_ID: string =
    'zircon-object-id';

  /**
   * constructor
   */
  constructor() {
    this._eventEmitter = null;
    this._id = uuid();
  }
  /**
   * // TODO: memory leak if setEventDispatcher is used (we should remove listeners !)

   * Set the event emitter to be used
   * @param eventEmitter
   */
  public setEventDispatcher(eventEmitter: EventEmitter2): void {
    this._eventEmitter = eventEmitter;
    this.listenToEvents();
  }

  protected listenToEvents(): void {
    this.addListener('OBJECT_STATE_REGISTERED', (arg) => {
      this.onOBJECT_STATE_REGISTERED(arg.objectId, arg.state);
    });
  }

  private onOBJECT_STATE_REGISTERED(
    objectId: string,
    state: ZirconObjectState,
  ): void {
    if (objectId === this.getId()) {
      this.setState(state);
    }
  }

  /**
   * set object id
   * @param new object id
   * @fires OBJECT_ID_CHANGED
   * @returns
   */
  public setId(id: string): boolean {
    if (!id) return false;
    const oldId: string = this._id;
    if (id.indexOf(' ') != -1)
      throw new Error(`IDs cannot contain spaces '${id}' is invalid`);
    if (oldId === id) return false;
    this._id = id;
    this.emit('OBJECT_ID_CHANGED', { oldId: this._id, newId: id });
    return true;
  }

  public setName(name: string): boolean {
    if (!name) return false;
    if (this._name === name) return false;
    this._name = name;
    this.emit('OBJECT_NAME_CHANGED', { id: this._id, name: this._name });
    return true;
  }

  /**
   * set object state.
   * @param state *
   */
  public async setState(state: ZirconObjectState): Promise<void> {
    return Promise.resolve().then(() => {
      this.setId(state.id);
      this.setName(state.name);
    });
  }

  /**
   * event dispatcher lazy getter
   * @returns event dispatcher. Connot be null
   */
  public getEventDispatcher(): EventEmitter2 {
    return this._eventEmitter;
  }

  /**
   * Get the state of this Object. Children must override this method to add their own properties
   * example { ...super.getCurrentState(), myProperty: myValue }
   * @returns The state of the object
   */
  public generateCurrentState(): ZirconObjectState {
    return {
      id: this._id,
    };
  }

  public getName(): string {
    return this._name;
  }

  public getContextMenuElements(): ZirconContextMenuItem[] {
    return null;
  }

  /**
   * emit an event
   * @param event
   * @param args
   * @returns
   */
  public emit<K extends keyof R['outgoing']>(
    eventName: K,
    arg: R['outgoing'][K],
  ): boolean {
    return this.getEventDispatcher()?.emit(eventName as string, arg);
  }

  /**
   * Add a listener
   * @param event
   * @param cb
   * @returns
   */
  public addListener<K extends keyof R['incoming']>(
    eventName: K,
    cb: (arg: R['incoming'][K]) => void,
  ): this {
    this.getEventDispatcher()?.addListener(eventName as string, cb);
    return this;
  }

  /**
   * get the object type
   * @returns
   */
  public getType(): string {
    return this.constructor.name;
  }

  /**
   * Get the id of this window
   * @returns the id of this window
   */
  public getId(): string {
    return this._id;
  }

  // /**
  //  * Event management via the application event bus
  //  */
  // /**
  //  * emit an event
  //  * @param event
  //  * @param args
  //  * @returns
  //  */
  // public emit(event: string | symbol, ...args: unknown[]): boolean {
  //   return this.getApplication().emit(event, ...args);
  // }

  // /**
  //  * Add a listener
  //  * @param event
  //  * @param listener
  //  * @returns
  //  */
  // public addListener(
  //   event: string | symbol,
  //   listener: (...args: unknown[]) => void,
  // ): this {
  //   this.getApplication().addListener(event, listener);
  //   return this;
  // }

  // /**
  //  * Removes a listener
  //  * @param event
  //  * @param listener
  //  * @returns
  //  */
  // public removeListener(
  //   event: string | symbol,
  //   listener: (...args: unknown[]) => void,
  // ): this {
  //   this.getApplication().removeListener(event, listener);
  //   return this;
  // }
}

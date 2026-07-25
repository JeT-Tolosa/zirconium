import { v4 as uuid } from 'uuid';
import EventEmitter2 from 'eventemitter2';
import {
  MergePickEvents,
  MergeZirconRegistries,
  ZirconRegistry,
} from '../zircon-event';
import { ZirconApplicationEvents } from './zircon-app';
import { ZIRCON_OBJECT_TYPE } from './zircon-types';
import { ZirconNameGenerator } from './zircon-name-generator';

type PickEvents<E, K extends keyof E> = {
  [P in K]: E[P];
};

export type ZirconObjectEvents = {
  ZIRCON_OBJECT_SET_STATE_REQUEST: { id: string; state: ZirconObjectState };
  ZIRCON_OBJECT_GET_STATE_REQUEST: { id: string };
  ZIRCON_OBJECT_STATE_CHANGED: {
    id: string;
    state?: ZirconObjectState;
  };
  ZIRCON_OBJECT_CREATED: {
    id: string;
    type: string;
    timestamp: number;
  };
  ZIRCON_OBJECT_ID_CHANGED: { oldId: string; newId: string };
  ZIRCON_OBJECT_STATE: { state: ZirconObjectState };
  // ZIRCON_OBJECT_NAME_CHANGED: { id: string; name: string };
};

export type ZirconObjectEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconObjectEvents,
          'ZIRCON_OBJECT_SET_STATE_REQUEST' | 'ZIRCON_OBJECT_GET_STATE_REQUEST'
        >,
      ]
    >;

    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconObjectEvents,
          | 'ZIRCON_OBJECT_CREATED'
          | 'ZIRCON_OBJECT_ID_CHANGED'
          | 'ZIRCON_OBJECT_STATE_CHANGED'
          | 'ZIRCON_OBJECT_STATE'
        >,
        PickEvents<ZirconApplicationEvents, 'UNCAUGHT_EXCEPTION'>,
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
  factoryId?: string; // if set, given factory must exist and be used
  type: typeof ZIRCON_OBJECT_TYPE;
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
  private _id: string = null;
  private _name: string = null;
  private _factoryId: string = null;
  private __eventEmitter: EventEmitter2 = null;
  private __stateModified: boolean = false;
  private __stateModificationNotification: boolean = true; // fires an event when state is modified
  public static readonly ZIRCON_OBJECT_ATTRIBUTE_ID: string =
    'zircon-object-id';

  /**
   * constructor
   */
  constructor() {
    this.__eventEmitter = new EventEmitter2();
    this._id = uuid();
  }

  /**
   * // TODO: memory leak if setEventDispatcher is used (we should remove listeners !)
   * Set the event emitter to be used
   * @param eventEmitter
   */
  public setEventDispatcher(eventEmitter: EventEmitter2): void {
    if (this.__eventEmitter === eventEmitter) {
      return;
    }
    this.__eventEmitter = eventEmitter;
    this.listenToEvents();
  }

  protected stateModified() {
    this.__stateModified = true;
    if (this.__stateModificationNotification) {
      this.notifyStateModifcation();
    }
  }

  public setStateMoficitationNotification(b: boolean) {
    // TODO: we may add an interval to avoid huge number of notifications...
    this.__stateModificationNotification = b;
    if (!b || !this.__stateModified) {
      return;
    }
    this.__stateModified = false;
    this.notifyStateModifcation();
  }

  private notifyStateModifcation() {
    this.emit('ZIRCON_OBJECT_STATE_CHANGED', {
      id: this.getId(),
      state: this.generateCurrentState(),
    });
  }
  /**
   * // TODO: memory leak if setEventDispatcher is used (we should remove listeners !)
   * Unset the event emitter to be used
   */
  public unsetEventDispatcher(): void {
    this.setEventDispatcher(null);
  }

  protected listenToEvents(): void {
    this.addListener('ZIRCON_OBJECT_SET_STATE_REQUEST', (arg) =>
      this.onZIRCON_OBJECT_SET_STATE_REQUEST(arg.id, arg.state),
    );
    this.addListener('ZIRCON_OBJECT_GET_STATE_REQUEST', (arg) => {
      this.onZIRCON_OBJECT_GET_STATE_REQUEST(arg.id);
    });
  }

  private onZIRCON_OBJECT_GET_STATE_REQUEST(objId: string): void {
    if (objId === this.getId()) {
      this.emit('ZIRCON_OBJECT_STATE', {
        state: this.generateCurrentState(),
      });
    }
  }

  private onZIRCON_OBJECT_SET_STATE_REQUEST(
    objId: string,
    state: ZirconObjectState,
  ): void {
    if (objId === this.getId()) {
      this.setState(state);
    }
  }

  private createValidId(id: string): string {
    if (!id) {
      return uuid();
    }
    return id.replaceAll(' ', '-');
  }

  /**
   * set object id.
   * Stored id is a validated version of the given id
   * @param new object id
   * @fires ZIRCON_OBJECT_ID_CHANGED
   * @returns
   */
  public setId(id: string): boolean {
    if (!id) {
      return false;
    }
    id = this.createValidId(id);

    const oldId: string = this._id;
    if (oldId === id) {
      return false;
    }
    this._id = id;
    this.emit('ZIRCON_OBJECT_ID_CHANGED', { oldId: this._id, newId: id });
    this.stateModified();
    return true;
  }

  public setName(name: string): boolean {
    if (!name) {
      return false;
    }
    if (this._name === name) {
      return false;
    }
    this._name = name;
    this.stateModified();
    return true;
  }

  public setFactoryId(factoryId: string): boolean {
    if (this._factoryId === factoryId) {
      return false;
    }
    this._factoryId = factoryId;
    this.stateModified();
    return true;
  }

  /**
   * set object state.
   * @param state *
   */
  public async setState(state: ZirconObjectState): Promise<void> {
    if (!state) {
      return;
    }
    this.setId(state.id);
    this.setName(
      state.name || `${this.getType()} ${ZirconNameGenerator.generateName()}`,
    );
    this.setFactoryId(state.factoryId);
  }

  /**
   * event dispatcher lazy getter
   * @returns event dispatcher. Connot be null
   */
  public getEventDispatcher(): EventEmitter2 {
    return this.__eventEmitter;
  }

  /**
   * Get the state of this Object. Children must override this method to add their own properties
   * example { ...super.generateCurrentState(), myProperty: myValue }
   * @returns The state of the object
   */
  public generateCurrentState(): ZirconObjectState {
    return {
      type: ZIRCON_OBJECT_TYPE,
      id: this.getId(),
      name: this.getName(),
    };
  }

  public getName(): string {
    return this._name || this.getId();
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
  public abstract getType(): string;

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

  /**
   * Removes a listener
   * @param event
   * @param listener
   * @returns
   */
  public removeListener(
    event: string | symbol,
    listener: (...args: unknown[]) => void,
  ): this {
    this.getEventDispatcher().removeListener(event, listener);
    return this;
  }

  // public getParameterComponents(): ZirconParameterComponent[] {
  //   return [new ZirconDefaultParameterComponent(this.getId())];
  // }

  public getEditedIds(): string[] {
    return [];
  }
}

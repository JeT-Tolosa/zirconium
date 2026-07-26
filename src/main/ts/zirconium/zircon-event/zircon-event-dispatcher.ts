import EventEmitter2, { EventAndListener } from 'eventemitter2';
import { v4 as uuid } from 'uuid';
import { ZirconEventInfo, ZirconEventRegistry } from './zircon-event';

type ZirconEventCallback = (payload: unknown, info?: ZirconEventInfo) => void;
type ListenerDescriptor = {
  eventName: string;
  cb: ZirconEventCallback;
};

export class ZirconEventDispatcher<R extends ZirconEventRegistry> {
  private _eventEmitter: EventEmitter2 = null;
  private readonly _listeners: { [listenerId: string]: ListenerDescriptor } =
    {};

  constructor() {
    this._eventEmitter = new EventEmitter2();
    this._eventEmitter.setMaxListeners(1000);
  }

  public onAny(listener: EventAndListener) {
    this._eventEmitter.onAny(listener);
  }

  /**
   * emit an event
   * @param event
   * @param args
   * @returns
   */
  public emit<K extends keyof R['outgoing']>(
    eventName: K,
    payload: R['outgoing'][K],
    info?: { emitterId: string; parentId: string },
  ): ZirconEventInfo {
    const eventInfo: ZirconEventInfo = {
      eventId: uuid(),
      timestamp: Date.now(),
      emitterId: info?.emitterId,
      parentEventId: info?.parentId,
    };
    this._eventEmitter?.emit(eventName as string, payload, eventInfo);
    return eventInfo;
  }

  /**
   * Add a listener
   * @param event
   * @param cb
   * @returns
   */
  public addListener<K extends keyof R['incoming']>(
    eventName: K,
    cb: (payload: R['incoming'][K], info?: ZirconEventInfo) => void,
  ): string {
    for (const listener of Object.values(this._listeners)) {
      if (listener.eventName === String(eventName) && listener.cb === cb) {
        throw new Error(
          `Listener already registered for event "${String(eventName)}".`,
        );
      }
    }
    const listenerId = uuid();
    this._listeners[listenerId] = {
      eventName: String(eventName),
      cb: cb as ZirconEventCallback,
    };
    this._eventEmitter.addListener(eventName as string, cb);
    return listenerId;
  }

  public removeListener(listenerId: string): boolean {
    const listenerDescriptor = this._listeners[listenerId];
    if (!listenerDescriptor) {
      return false;
    }
    this._eventEmitter.removeListener(
      listenerDescriptor.eventName,
      listenerDescriptor.cb,
    );
    delete this._listeners[listenerId];
    return true;
  }
}

import EventEmitter2, { EventAndListener } from 'eventemitter2';
import { v4 as uuid } from 'uuid';
import { ZirconEventInfo, ZirconEventRegistry } from './zircon-event';

export class ZirconEventDispatcher<R extends ZirconEventRegistry> {
  private _eventEmitter: EventEmitter2 = null;

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
      timestamp: new Date().getTime(),
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
    cb: (
      arg: R['incoming'][K],
      info?: { emitterId: string; parentId: string },
    ) => void,
  ): this {
    this._eventEmitter?.addListener(eventName as string, cb);
    return this;
  }
}

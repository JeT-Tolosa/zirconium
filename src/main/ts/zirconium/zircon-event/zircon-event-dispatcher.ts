import EventEmitter2, { EventAndListener } from 'eventemitter2';
import { v4 as uuid } from 'uuid';
import {
  ZirconEventInfo,
  ZirconEventListenerCallback,
  ZirconEventRegistry,
  ZirconEventTrace,
  ZirconOutgoingPayload,
} from './zircon-event';
import { ZirconEventEmitTransaction } from './zircon-event-transaction';

/**
 * DISPATCHER
 */

export class ZirconEventDispatcher<R extends ZirconEventRegistry> {
  private __emitterId: string = null;
  private __eventEmitter: EventEmitter2 = null;
  private __listeners: Record<
    string,
    {
      eventName: string;
      //cb: (payload: ZirconEventPayload, trace: ZirconEventTrace) => void;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cb: ZirconEventListenerCallback<any, any>;
    }
  > = {};

  constructor(emitterId: string, eventEmitter?: EventEmitter2) {
    this.__emitterId = emitterId;
    this.__eventEmitter = eventEmitter;
  }

  public setEventEmitterId(emitterId: string) {
    this.__emitterId = emitterId;
  }

  public onAny(listener: EventAndListener) {
    this.__eventEmitter?.onAny(listener);
  }

  public createEmitTransaction<K extends keyof R['outgoing']>(
    eventName: K,
    payload: ZirconOutgoingPayload<R, K>,
  ): ZirconEventEmitTransaction<R, K> {
    return new ZirconEventEmitTransaction<R, K>(
      this.__eventEmitter,
      this.__emitterId,
      eventName,
      payload,
    );
  }

  /**
   * emit an event
   */
  public emit<K extends keyof R['outgoing']>(
    eventName: K,
    payload: ZirconOutgoingPayload<R, K>,
    ancestorTrace?: ZirconEventTrace,
  ): ZirconEventTrace {
    const eventInfo: ZirconEventInfo = {
      eventId: uuid(),
      eventName: String(eventName),
      timestamp: Date.now(),
      emitterId: this.__emitterId,
    };
    const eventTrace = [eventInfo, ...(ancestorTrace || [])];
    this.getEventEmitter().emit(eventName as string, payload, eventTrace);
    return eventTrace;
  }

  public addListener<K extends keyof R['incoming']>(
    eventName: K,
    cb: ZirconEventListenerCallback<R, K>,
  ): string {
    const listenerId = uuid();
    this.getEventEmitter().addListener(String(eventName), cb);
    this.__listeners[listenerId] = {
      eventName: String(eventName),
      cb,
    };
    return listenerId;
  }

  public removeListener(listenerId: string): boolean {
    const listener = this.__listeners[listenerId];
    if (!listener) {
      return false;
    }
    this.getEventEmitter().removeListener(listener.eventName, listener.cb);
    delete this.__listeners[listenerId];
    return true;
  }

  public clearListeners(): void {
    Object.keys(this.__listeners).forEach((listenerId) =>
      this.removeListener(listenerId),
    );
  }

  public setEventEmitter(emitter: EventEmitter2) {
    this.__eventEmitter = emitter;
  }

  public getEventEmitter(): EventEmitter2 {
    if (!this.__eventEmitter) {
      this.__eventEmitter = new EventEmitter2();
      this.__eventEmitter.setMaxListeners(1000);
    }
    return this.__eventEmitter;
  }
}

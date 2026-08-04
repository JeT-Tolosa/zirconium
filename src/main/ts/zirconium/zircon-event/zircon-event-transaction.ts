/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter2 from 'eventemitter2';
import { v4 as uuid } from 'uuid';
import {
  ZirconEventInfo,
  ZirconEventListenerCallback,
  ZirconEventPayload,
  ZirconEventRegistry,
  ZirconEventTrace,
} from './zircon-event';

type EventTransactionResponse = 'singleResponse';

export type ZirconEventListenerDescriptor = {
  responseType: EventTransactionResponse;
  eventName: string; // if eventName == null => onAny else => addListener
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cb: ZirconEventListenerCallback<any, any>;
};

export abstract class ZirconEventTransaction {
  public abstract execute(): ZirconEventTrace;
}

/**
 * EMISSION TRANSACTION
 */

// TODO: rajouter un timeout

export class ZirconEventEmitTransaction<
  R extends ZirconEventRegistry,
  K extends keyof R['outgoing'],
> extends ZirconEventTransaction {
  // descriptors intended to be installed
  private __listenerInstallers: (() => void)[] = [];
  // really installed descriptors (eventEmitter.addListener)
  private __installedListeners: ZirconEventListenerDescriptor[] = [];
  private __emitterId: string;
  private __transactionId: string;
  private __eventName: string;
  private __payload: R['outgoing'][K];
  private __ancestorTrace: ZirconEventTrace;
  private __eventEmitter: EventEmitter2;

  constructor(
    eventEmitter: EventEmitter2,
    emitterId: string,
    eventName: K,
    eventPayload: R['outgoing'][K],
    eventAncestorTrace?: ZirconEventTrace,
  ) {
    super();
    if (!eventEmitter) {
      throw new Error(`Event Emit Transaction needs a valid EventEmitter2`);
    }
    if (!emitterId) {
      throw new Error(`Event Emit Transaction needs a valid emitter object ID`);
    }
    if (!eventName) {
      throw new Error(`Event Emit Transaction needs a valid event name`);
    }
    this.__eventEmitter = eventEmitter;
    this.__emitterId = emitterId;
    this.__payload = eventPayload;
    this.__eventName = String(eventName);
    this.__ancestorTrace = eventAncestorTrace;
  }

  public execute(): ZirconEventTrace {
    const info: ZirconEventInfo = {
      eventName: String(this.__eventName),
      eventId: uuid(),
      emitterId: this.__emitterId,
      timestamp: Date.now(),
    };
    this.installListeners();
    const trace = [info, ...(this.__ancestorTrace || [])];
    this.__transactionId = trace[trace.length - 1].eventId;
    this.__eventEmitter.emit(String(this.__eventName), this.__payload, trace);

    return trace;
  }

  private destroy(): void {
    this.removeAllListeners();
  }

  // first response is taken into account
  // once received listeners are cleared
  public onResponse<
    Rin extends ZirconEventRegistry | null,
    Kin extends keyof Rin['incoming'],
  >(
    eventName: Kin,
    cb: (
      _payload: ZirconEventListenerCallback<Rin, Kin>,
      _trace: ZirconEventTrace,
    ) => void,
  ) {
    const eventNameString = String(eventName);
    // TODO: return a function that do all the stuff instead of storing an object that will be used to do the stuff afterward
    // this.__listenerInstallers.push( new Function() );

    this.__listenerInstallers.push(() =>
      this.createOnResponseInstaller(eventNameString, cb),
    );
  }

  private createOnResponseInstaller(
    responseEventName: string,
    cb: (
      _payload: ZirconEventListenerCallback<any, any>,
      _trace: ZirconEventTrace,
    ) => void,
  ) {
    const responseCallbackWrapper = this.createOnResponseCallback(
      responseEventName,
      cb,
    );
    this.__eventEmitter.on(responseEventName, responseCallbackWrapper);
    this.__installedListeners.push({
      responseType: 'singleResponse',
      eventName: responseEventName,
      cb: responseCallbackWrapper,
    });
  }

  // wrap user callback
  private createOnResponseCallback(
    responseEventName: string,
    cb: ZirconEventListenerCallback<any, any>,
  ): (payload: ZirconEventPayload, trace: ZirconEventTrace) => void {
    const callback = (
      payload: ZirconEventPayload,
      trace: ZirconEventTrace,
    ): void => {
      // a response is received
      console.log(`Event trace from transaction ${this.__transactionId}:`);
      trace.forEach((e) => console.log(`  - ${JSON.stringify(e)}`));

      // check if it the expected response event name
      if (trace[0].eventName !== responseEventName) {
        console.log(
          `receive an event of wrong type: ${trace[0].eventName}. requested type : ${responseEventName}`,
        );
        return;
      }
      // transaction id is the first emitter eventId
      const transactionId = trace[trace.length - 1].eventId;
      // check if it the expected response comes from this transaction
      if (transactionId !== this.__transactionId) {
        console.log(
          `receive an event from wrong transaction: ${transactionId}. requested type : ${this.__transactionId}`,
        );
        return;
      }
      // launch user callblack
      cb(payload, trace);
      // stop
      this.destroy();
    };
    return callback;
  }

  private installListeners() {
    if (!this.__eventEmitter) {
      throw new Error(
        `Event Emitter is not set in transaction ${this.__eventName} of emitter ID = ${this.__emitterId}`,
      );
    }
    Object.values(this.__listenerInstallers).forEach((installer) => {
      installer.apply(this);
    });
    //   const callbackWrapper = this.createOnResponseCallback(
    //     listenerDescriptor.cb,
    //   );
    //   if (!listenerDescriptor.eventName) {
    //     throw new Error(`Check Callback Wrapper type`);
    //     // this.__eventEmitter.onAny(callbackWrapper);
    //   } else {
    //     this.__eventEmitter.on(listenerDescriptor.eventName, callbackWrapper);
    //   }
    //   this.__installedListeners.push(listenerDescriptor);
    // });
  }

  private removeAllListeners() {
    for (let index = 0; index < this.__installedListeners.length; index++) {
      const listenerDescriptor = this.__installedListeners[index];
      if (!listenerDescriptor) {
        return false;
      }
      this.__eventEmitter?.removeListener(
        listenerDescriptor.eventName,
        listenerDescriptor.cb,
      );
    }
  }
}

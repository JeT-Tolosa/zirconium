/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter2 from 'eventemitter2';
import { v4 as uuid } from 'uuid';
import {
  ZirconEventInfo,
  ZirconEventRegistry,
  ZirconEventTrace,
} from './zircon-event';
import { ZirconTransactionCondition } from './zircon-event-condition';

export abstract class ZirconEventTransaction {
  private __transactionId: string;

  constructor() {
    this.__transactionId = uuid();
  }

  public getTransactionId(): string {
    return this.__transactionId;
  }

  public abstract execute(): Promise<ZirconEventTrace>;
}

/**
 * EMISSION TRANSACTION
 */

// TODO: rajouter un timeout

export class ZirconEventEmitTransaction<
  R extends ZirconEventRegistry,
  K extends keyof R['outgoing'],
> extends ZirconEventTransaction {
  private __condition: ZirconTransactionCondition = null;
  private __emitterId: string;

  private __eventName: string;
  private __payload: R['outgoing'][K];
  private __eventEmitter: EventEmitter2;

  constructor(
    eventEmitter: EventEmitter2,
    emitterId: string,
    eventName: K,
    eventPayload: R['outgoing'][K],
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
  }

  public async execute(): Promise<ZirconEventTrace> {
    const info: ZirconEventInfo = {
      eventName: String(this.__eventName),
      eventId: this.getTransactionId(),
      emitterId: this.__emitterId,
      timestamp: Date.now(),
    };
    const trace: ZirconEventTrace = [info];
    try {
      const condition = this.__condition.execute();
      this.__eventEmitter.emit(this.__eventName, this.__payload, trace);
      return await condition;
    } finally {
      this.destroy();
    }
  }

  private destroy(): void {
    this.__condition.dispose();
  }

  public setCondition(node: ZirconTransactionCondition) {
    this.__condition?.dispose();
    this.__condition = node;
  }
  //   public onTimeout(durationInSeconds: number) {
  //     this.__listenerInstallers.push(() =>
  //       this.createTimeoutInstaller(durationInSeconds),
  //     );
  //   }

  //   private createTimeoutInstaller(durationInSeconds: number) {}

  //   // first response is taken into account
  //   // once received listeners are cleared
  //   public onResponse<
  //     Rin extends ZirconEventRegistry | null,
  //     Kin extends keyof Rin['incoming'],
  //   >(
  //     eventName: Kin,
  //     cb: (
  //       _payload: ZirconEventListenerCallback<Rin, Kin>,
  //       _trace: ZirconEventTrace,
  //     ) => void,
  //   ) {
  //     const eventNameString = String(eventName);
  //     // TODO: return a function that do all the stuff instead of storing an object that will be used to do the stuff afterward
  //     // this.__listenerInstallers.push( new Function() );

  //     // this.__listenerInstallers.push(() =>
  //     //   this.createOnResponseInstaller(eventNameString, cb),
  //     // );
  //   }

  //   private createOnResponseInstaller(
  //     responseEventName: string,
  //     cb: (
  //       _payload: ZirconEventListenerCallback<any, any>,
  //       _trace: ZirconEventTrace,
  //     ) => void,
  //   ) {
  //     const responseCallbackWrapper = this.createOnResponseCallback(
  //       responseEventName,
  //       cb,
  //     );
  //     this.__eventEmitter.on(responseEventName, responseCallbackWrapper);
  //     this.__installedListeners.push({
  //       responseType: 'singleResponse',
  //       eventName: responseEventName,
  //       cb: responseCallbackWrapper,
  //     });
  //   }

  //   // wrap user callback
  //   private createOnResponseCallback(
  //     responseEventName: string,
  //     cb: ZirconEventListenerCallback<any, any>,
  //   ): (payload: ZirconEventPayload, trace: ZirconEventTrace) => void {
  //     const callback = (
  //       payload: ZirconEventPayload,
  //       trace: ZirconEventTrace,
  //     ): void => {
  //       // a response is received
  //       console.log(`Event trace from transaction ${this.__transactionId}:`);
  //       trace.forEach((e) => console.log(`  - ${JSON.stringify(e)}`));

  //       // check if it the expected response event name
  //       if (trace[0].eventName !== responseEventName) {
  //         console.log(
  //           `receive an event of wrong type: ${trace[0].eventName}. requested type : ${responseEventName}`,
  //         );
  //         return;
  //       }
  //       // transaction id is the first emitter eventId
  //       const transactionId = trace[trace.length - 1].eventId;
  //       // check if it the expected response comes from this transaction
  //       if (transactionId !== this.__transactionId) {
  //         console.log(
  //           `receive an event from wrong transaction: ${transactionId}. requested type : ${this.__transactionId}`,
  //         );
  //         return;
  //       }
  //       // launch user callblack
  //       cb(payload, trace);
  //       // stop
  //       this.destroy();
  //     };
  //     return callback;
  //   }
}

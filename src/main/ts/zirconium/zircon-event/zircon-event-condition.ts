/* eslint-disable @typescript-eslint/no-explicit-any */
import EventEmitter2 from 'eventemitter2';
import {
  ZirconEventTrace,
  ZirconEventListenerCallback,
  ZirconEventInfo,
  ZirconEventRegistry,
  ZirconIncomingPayload,
} from './zircon-event';

export abstract class ZirconTransactionCondition {
  public abstract execute(): Promise<ZirconEventTrace>;
  public abstract dispose(): void;
}

/**
 * WAIT FOR RESPONSE
 */
export class ZirconTransitionConditionWaitEventResponse<
  R extends ZirconEventRegistry,
  Kin extends keyof R['incoming'],
> extends ZirconTransactionCondition {
  private __userCallback?: ZirconEventListenerCallback<R, Kin> = null;
  private __listener?: (
    payload: ZirconIncomingPayload<R, Kin>,
    trace: ZirconEventTrace,
  ) => void = null;
  private readonly __eventEmitter: EventEmitter2 = null;
  private readonly __transactionId: string = null;
  private readonly __responseEventName: string = null;
  //   private __responsePayload: Rin['incoming'][Kin] = null;
  //   private __responseTrace: ZirconEventTrace = null;
  // TODO: rajouter un callback optionnel

  constructor(
    eventEmitter: EventEmitter2,
    transactionId: string,
    responseEventName: Kin,
    cb?: ZirconEventListenerCallback<R, Kin>,
  ) {
    super();
    this.__eventEmitter = eventEmitter;
    this.__transactionId = transactionId;
    this.__responseEventName = String(responseEventName);
    this.__userCallback = cb;
  }

  public execute(): Promise<ZirconEventTrace> {
    return new Promise<ZirconEventTrace>((resolve) => {
      this.__listener = this.createWrapperCallback(
        this.__responseEventName,
        this.__userCallback,
        resolve,
      );
      this.__eventEmitter.on(this.__responseEventName, this.__listener);
    });
  }

  // wrap user callback
  private createWrapperCallback(
    responseEventName: string,
    cb: ZirconEventListenerCallback<any, any>,
    resolve: (value: ZirconEventTrace | PromiseLike<ZirconEventTrace>) => void,
  ): (payload: ZirconIncomingPayload<R, Kin>, trace: ZirconEventTrace) => void {
    const callback = (
      payload: ZirconIncomingPayload<R, Kin>,
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
      if (cb) {
        cb(payload, trace);
      }
      // stop
      this.dispose();
      resolve(trace);
    };
    return callback;
  }

  public dispose(): void {
    if (!this.__listener) {
      return;
    }
    this.__eventEmitter.removeListener(
      this.__responseEventName,
      this.__listener,
    );
    this.__listener = undefined;
  }
}

/**
 * TIMEOUT
 */
export class ZirconTransitionConditionTimeout extends ZirconTransactionCondition {
  private timeout?: ReturnType<typeof setTimeout>;

  constructor(private readonly durationMs: number) {
    super();
  }

  public execute(): Promise<ZirconEventTrace> {
    return new Promise((resolve) => {
      this.timeout = setTimeout(() => {
        this.timeout = undefined;
        resolve([
          {
            eventName: 'TIMEOUT',
            timestamp: this.durationMs,
          } as ZirconEventInfo,
        ]);
      }, this.durationMs);
    });
  }

  public dispose(): void {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = undefined;
    }
  }
}

/**
 * WAIT FOR ANY (race)
 */
export class ZirconTransitionConditionWaitAny extends ZirconTransactionCondition {
  constructor(private readonly children: ZirconTransactionCondition[]) {
    super();
  }

  public async execute(): Promise<ZirconEventTrace> {
    try {
      return await Promise.race(this.children.map((c) => c.execute()));
    } finally {
      this.dispose();
    }
  }

  public dispose(): void {
    this.children.forEach((c) => c.dispose());
  }
}

/**
 * WAIT FOR ALL
 */
export class ZirconTransitionConditionWaitAll extends ZirconTransactionCondition {
  constructor(private readonly children: ZirconTransactionCondition[]) {
    super();
  }

  public async execute(): Promise<ZirconEventTrace> {
    try {
      return await Promise.all(this.children.map((c) => c.execute())).then(
        (traces) => {
          return [
            {
              eventName: 'CONDITION_WAIT_FOR_ALL',
              timestamp: Date.now(),
            } as ZirconEventInfo,
            ...traces.flat(),
          ];
        },
      );
    } finally {
      this.dispose();
    }
  }

  public dispose(): void {
    this.children.forEach((c) => c.dispose());
  }
}

import {
  ZirconObject,
  ZirconObjectEventRegistry,
  ZirconObjectState,
} from '../zircon-object';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import { ZIRCON_ENGINE_TYPE } from './zircon-types';

export type ZirconEngineEvents = {
  ENGINE_START_REQUEST: { engineId: string };
  ENGINE_START_ERROR: { engineId: string; error: string };
  ENGINE_STARTED: { engineId: string };
  ENGINE_STOP_REQUEST: { engineId: string };
  ENGINE_STOPPED: { engineId: string };
  ENGINE_STOP_ERROR: { engineId: string; error: string };
};

export type ZirconEngineEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconEngineEvents,
          'ENGINE_START_REQUEST' | 'ENGINE_STOP_REQUEST'
        >,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconEngineEvents,
          | 'ENGINE_STARTED'
          | 'ENGINE_START_ERROR'
          | 'ENGINE_STOP_ERROR'
          | 'ENGINE_STOPPED'
        >,
      ]
    >;
  },
  ZirconObjectEventRegistry
>;

export interface ZirconEngineState extends ZirconObjectState {
  type: typeof ZIRCON_ENGINE_TYPE;
}

/**
 * Base class for all Business Data objects
 */
export abstract class ZirconEngine<
  R extends ZirconEngineEventRegistry = ZirconEngineEventRegistry,
> extends ZirconObject<R> {
  private _started: boolean = false;

  /**
   * Constructor
   */
  constructor(state?: ZirconEngineState) {
    super(state);
  }

  /**
   * Listen to events coming from the event dispatcher
   * This method is called by the ZirconObject constructor, so it is called after the object is created and its id is set
   * It listens to ENGINE_START_REQUEST and ENGINE_STOP_REQUEST events and calls the corresponding methods
   */
  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('ENGINE_START_REQUEST', (arg) => {
      this.onENGINE_START_REQUEST(arg.engineId);
    });
    this.addListener('ENGINE_STOP_REQUEST', (arg) => {
      this.onENGINE_STOP_REQUEST(arg.engineId);
    });
  }

  private onENGINE_START_REQUEST(engineId: string): void {
    if (engineId === this.getId()) {
      this.start()
        .then(() => {
          this.emit('ENGINE_STARTED', { engineId: engineId });
        })
        .catch((error: string) => {
          this.emit('ENGINE_START_ERROR', {
            engineId: engineId,
            error: error,
          });
        });
    }
  }

  private onENGINE_STOP_REQUEST(engineId: string): void {
    if (engineId === this.getId()) {
      this.stop()
        .then(() => {
          this.emit('ENGINE_STOPPED', { engineId: engineId });
        })
        .catch((error: string) => {
          this.emit('ENGINE_STOP_ERROR', {
            engineId: engineId,
            error: error,
          });
        });
    }
  }

  public isStarted(): boolean {
    return this._started;
  }

  public start(): Promise<void> {
    return this.onStart().then(() => {
      this._started = true;
    });
  }

  public stop(): Promise<void> {
    return this.onStop().then(() => {
      this._started = false;
    });
  }

  protected abstract onStart(): Promise<void>;

  protected abstract onStop(): Promise<void>;
}

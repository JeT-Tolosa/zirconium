import { ZirconApplication } from './zircon-app';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import { ArrayComparisonResult, Zircon } from '../zircon';
import { ZIRCON_ENGINE_MANAGER_TYPE } from './zircon-types';
import { ZirconEngine } from './zircon-engine';
import {
  ZirconAppObject,
  ZirconAppObjectEventRegistry,
  ZirconAppObjectState,
} from './zircon-app-object';

export interface ZirconEngineManagerState extends ZirconAppObjectState {
  type: typeof ZIRCON_ENGINE_MANAGER_TYPE;
  engineIds: string[];
}

export type ZirconEngineManagerEvents = {
  // ENGINE_MANAGER_STATE_REQUEST: { engineManagerId: string };
  // ENGINE_MANAGER_STATE: { state: ZirconEngineManagerState };
  ENGINE_MANAGER_ENGINE_IDS_CHANGED: {
    engineManagerId: string;
    engineIds: string[];
  };
};

// TODO: faire un evenement pour l'ajout et la suppression de engine

export type ZirconEngineManagerEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<[]>;
    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconEngineManagerEvents,
          'ENGINE_MANAGER_ENGINE_IDS_CHANGED'
        >,
      ]
    >;
  },
  ZirconAppObjectEventRegistry
>;

/**
 * A Zircon View Region is a collection  of managed Zircon Engines
 */
export class ZirconEngineManager<
  R extends ZirconEngineManagerEventRegistry = ZirconEngineManagerEventRegistry,
> extends ZirconAppObject<R> {
  private _engineIds: string[] = [];

  /**
   * Constructor for ZirconEngineManager
   * @param appUI The Zircon application instance
   */
  constructor(appUI: ZirconApplication, state?: ZirconEngineManagerState) {
    super(appUI, state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
  }

  /**
   * Handles engine manager state update event
   * @param state The new state of the engine manager
   */
  private onENGINE_MANAGER_STATE(state: ZirconEngineManagerState): void {
    if (this.getId() !== state.id) return;
    this.setState(state);
  }

  /**
   * Gets the type identifier for this engine manager
   * @returns The engine manager type string
   */
  public override getType(): string {
    return ZIRCON_ENGINE_MANAGER_TYPE;
  }

  private startEngine(engineId: string): Promise<void> {
    const engine: ZirconEngine =
      this.getApplication().getExistingEngine(engineId);
    if (!engine) return Promise.resolve(null);
    return engine.start();
  }

  private stopEngine(engineId: string): void {
    const engine: ZirconEngine =
      this.getApplication().getExistingEngine(engineId);
    if (!engine) return;
    engine.stop();
  }

  /**
   * Sets the state of the engine manager
   * @param state The new state to apply
   * @returns A promise that resolves when the state is set
   */
  protected override async setState(
    state: ZirconEngineManagerState,
  ): Promise<void> {
    if (!state) return;
    await super.setState(state);
    this.setEngineIds(state.engineIds);
  }

  /**
   * Sets the engine IDs managed by this engine manager
   * @param engineIds Array of engine IDs to manage
   */
  private setEngineIds(engineIds: string[]): void {
    const res: ArrayComparisonResult = Zircon.arrayComparison(
      this.getEngineIds(),
      engineIds,
    );
    this._engineIds = engineIds;
    res.inserted?.forEach((engineId) => {
      this.startEngine(engineId);
    });
    res.deleted?.forEach((engineId) => {
      this.stopEngine(engineId);
    });
    this.emit('ENGINE_MANAGER_ENGINE_IDS_CHANGED', {
      engineManagerId: this.getId(),
      engineIds: engineIds,
    });
  }

  /**
   * Generates the current state of this engine manager
   * @returns The current state object
   */
  public override generateCurrentState(): ZirconEngineManagerState {
    return {
      ...super.generateCurrentState(),
      engineIds: [...this._engineIds],
      type: ZIRCON_ENGINE_MANAGER_TYPE,
    };
  }

  /**
   * Gets the array of engine IDs managed by this engine manager
   * @returns Array of engine IDs
   */
  public getEngineIds(): string[] {
    return this._engineIds;
  }
}

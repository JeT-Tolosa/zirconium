import {
  ZirconAppObject,
  ZirconAppObjectEventRegistry,
  ZirconAppObjectState,
} from '../zircon-core/zircon-app-object';
import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZIRCON_STATE_EDITOR_MANAGER_TYPE } from '../zircon-core/zircon-types';
import { ZirconStateEditor } from './zircon-state-editor';
import { ZirconStateEditorFactory } from './zircon-state-editor-factory';

export type ZirconStateEditorManagerState = ZirconAppObjectState;

export type ZirconStateEditorManagerEvents = {};

export type ZirconStateEditorManagerEventRegistry =
  ZirconAppObjectEventRegistry;

/**
 */
export class ZirconStateEditorManager<
  R extends ZirconStateEditorManagerEventRegistry =
    ZirconStateEditorManagerEventRegistry,
> extends ZirconAppObject<R> {
  private _stateEditorFactories: {
    [type: string]: ZirconStateEditorFactory[];
  } = {};

  /**
   * Constructor for ZirconStateEditorManager
   * @param appUI The Zircon application instance
   */
  constructor(appUI: ZirconApplication, state?: ZirconStateEditorManagerState) {
    super(appUI, state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    // this.addListener('DESKTOP_ACTIVATE_REQUEST', (arg) =>
    //   this.onDESKTOP_ACTIVATE_REQUEST(arg.desktopId),
    // );
  }

  /**
   * Gets the type identifier for this state editor manager
   * @returns The state editor manager type string
   */
  public override getType(): string {
    return ZIRCON_STATE_EDITOR_MANAGER_TYPE;
  }

  /**
   * Sets the state of the state editor manager
   * @param state The new state to apply
   * @returns A promise that resolves when the state is set
   */
  protected override async setState(
    state: ZirconStateEditorManagerState,
  ): Promise<void> {
    if (!state) {
      return;
    }
    await super.setState(state);
  }

  /**
   * Generates the current state of the desktop manager
   * @returns The current state object
   */
  public override generateCurrentState(): ZirconStateEditorManagerState {
    return {
      ...super.generateCurrentState(),
      type: ZIRCON_STATE_EDITOR_MANAGER_TYPE,
    };
  }

  public registerStateEditorFactory(
    type: string,
    typeEditorFactory: ZirconStateEditorFactory,
  ): void {
    if (!type || !typeEditorFactory) {
      throw new Error('Invalid type or editor provided');
    }
    if (!this._stateEditorFactories[type]) {
      this._stateEditorFactories[type] = [];
    }
    this._stateEditorFactories[type].push(typeEditorFactory);
  }

  private getStateEditorFactoriesByType(
    type: string,
  ): ZirconStateEditorFactory[] {
    let stateEditorFactories: ZirconStateEditorFactory[] = [];
    const typeHierarchy = this.getApplication()
      .getObjectManager()
      .getTypeHierarchy(type);
    typeHierarchy.forEach((t) => {
      if (this._stateEditorFactories[t]) {
        stateEditorFactories = stateEditorFactories.concat(
          this._stateEditorFactories[t],
        );
      }
    });
    return stateEditorFactories;
  }

  /** get state editors recursively */
  public getStateEditorsById(objId: string): {
    [id: string]: ZirconStateEditor[];
  } {
    const stateEditors: { [id: string]: ZirconStateEditor[] } = {};

    if (!objId) {
      return stateEditors;
    }
    const obj = this.getApplication()
      .getObjectManager()
      .getExistingInstance(objId);
    if (!obj) {
      return stateEditors;
    }

    if (!stateEditors[objId]) {
      stateEditors[objId] = [];
    }

    const factories: ZirconStateEditorFactory[] =
      this.getStateEditorFactoriesByType(obj.getType());

    stateEditors[objId] = stateEditors[objId].concat(
      factories.map((factory) => factory.generateNewEditor(obj)),
    );
    obj.getEditedIds().forEach((subEditedId) => {
      const subEditors = this.getStateEditorsById(subEditedId);
      if (subEditors) {
        Object.keys(subEditors).forEach((subId) => {
          if (!stateEditors[subId]) {
            stateEditors[subId] = [];
          }
          stateEditors[subId] = stateEditors[subId].concat(subEditors[subId]);
        });
      }
    });
    return stateEditors;
  }
}

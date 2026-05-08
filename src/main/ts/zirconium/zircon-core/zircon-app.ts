import '../zircon-ui.css';
import EventEmitter2 from 'eventemitter2';
import {
  ZirconDesktopManager,
  ZirconDesktopManagerState,
} from './zircon-desktop-manager';
import { v4 as uuid } from 'uuid';

import 'jspanel4/dist/jspanel.min.css';
import { ZirconWindow, ZirconWindowEvents } from '../zircon-ui/zircon-window';
import {
  ZirconDesktop,
  ZirconDesktopEvents,
} from '../zircon-ui/zircon-desktop';
import {
  MergeZirconRegistries,
  MergePickEvents,
  PickEvents,
} from '../zircon-event';
import { ZirconContextMenu } from '../zircon-menu/zircon-context-menu';
import pino from 'pino';
import { ZirconObject, ZirconObjectState } from './zircon-object';
import {
  ZirconVizWindowFactory as ZirconVizWindowFactory,
  ZirconWindowFactory as ZirconWindowFactory,
} from '../zircon-ui/zircon-window-factory';
import {
  ZirconEngine,
  ZirconEngineEvents,
  ZirconEngineState,
} from './zircon-engine';
import {
  ZirconVizWindow,
  ZirconVizWindowEvents,
} from '../zircon-ui/zircon-viz-window';
import { ZirconParamWindowEvents } from '../zircon-params/zircon-param-window';
import { ZirconViz } from '../zircon-ui/zircon-visualizer';
import {
  ZIRCON_DESKTOP_MANAGER_TYPE,
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_ENGINE_TYPE,
  ZIRCON_OBJECT_TYPE,
  ZIRCON_VISUALIZER_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
  ZIRCON_WINDOW_TYPE,
} from './zircon-types';
import { ZirconObjectManager } from './zircon-object-manager';
import { ZirconDesktopFactory } from '../zircon-ui/zircon-desktop-factory';
import { ZirconDesktopManagerFactory } from './zircon-desktop-manager-factory';
import { ZirconAppObjectFactory } from './zircon-app-object-factory';
import { ZirconEngineFactory } from './zircon-engine-factory';
import { ZirconObjectFactory } from './zircon-object-factory';

/**
 * Composition of this application UI
 */
export interface ZirconApplicationState {
  applicationId?: string;
  uiClass?: string;
  desktopManagerId: string;
  engineIds: string[];
  states: ZirconObjectState[];
}

export const ZIRCON_DROPPABLE_CLASS: string = 'drop-window-target';
export const ZIRCON_TARGET_DESKTOP_ID: string = 'desktop-id';

// const DEFAULT_APPLICATION_STATE: ZirconAppUIState = {
//   applicationId: null,
//   uiClass: 'zircon-ui',
// };

export type ZirconApplicationEvents = {
  APPLICATION_START_REQUEST: { applicationId: string };
  APPLICATION_STARTED: { applicationId: string };
  SET_OBJECT_STATE_REQUEST: { objectId: string; state: ZirconObjectState };
  OBJECT_STATE_REGISTERED: { state: ZirconObjectState };
  ENGINE_STATE_REGISTERED: { state: ZirconEngineState };
  UNCAUGHT_EXCEPTION: { error: string };
};

export type ZirconApplicationEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconApplicationEvents,
          'APPLICATION_START_REQUEST' | 'SET_OBJECT_STATE_REQUEST'
        >,
        PickEvents<
          ZirconWindowEvents,
          'WINDOW_SET_PARENT_DESKTOP_REQUEST' | 'WINDOW_SET_PARENT_DESKTOP_DONE'
        >,
        PickEvents<ZirconApplicationEvents, 'UNCAUGHT_EXCEPTION'>,
      ]
    >;
    outgoing: MergePickEvents<
      [
        ZirconApplicationEvents,
        ZirconWindowEvents,
        ZirconDesktopEvents,
        ZirconParamWindowEvents,
        ZirconVizWindowEvents,
        ZirconEngineEvents,
      ]
    >;
  },
  {
    incoming: {};
    outgoing: {};
  }
>;

/**
 * Zircon Application is a collection of UI objects connected to a Zircon application
 * Zircon Application is connected to an application and they share the same event dispatcher
 */
export class ZirconApplication<
  R extends ZirconApplicationEventRegistry = ZirconApplicationEventRegistry,
> {
  private _id: string = uuid();
  private __logger: pino.Logger = null;
  private __isProduction: boolean = false;
  private _applicationName: string = null;
  private _eventEmitter: EventEmitter2 = null;
  private _uiClass: string = 'zircon-ui';
  private _parent: HTMLElement = null;
  private __mainDiv: HTMLDivElement = null;
  private __contextMenu: ZirconContextMenu = null;

  private _desktopManagerId: string = 'application-desktop-manager';
  private __desktopManager: ZirconDesktopManager = null;
  private __objectManager: ZirconObjectManager = null;

  /**
   * constructor
   */
  constructor(applicationName: string) {
    this.__logger = pino({
      name: applicationName,
      level: 'debug',
      ...(!this.__isProduction && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            levelFirst: true,
            translateTime: true,
          },
        },
      }),
    });
    this._applicationName = applicationName;
    this._eventEmitter = new EventEmitter2();
    this._eventEmitter.setMaxListeners(1000);
    this.registerDefaultFactories();
    this.registerDefaultObjectStates();
    this.listenToEvents();
  }

  private listenToEvents(): void {
    this.addListener('APPLICATION_START_REQUEST', (arg) =>
      this.onAPPLICATION_START_REQUEST(arg.applicationId),
    );
    this.addListener('SET_OBJECT_STATE_REQUEST', (arg) =>
      this.onSET_OBJECT_STATE_REQUEST(arg.objectId, arg.state),
    );
    this.addListener('UNCAUGHT_EXCEPTION', (arg) => {
      this.onUNCAUGHT_EXCEPTION(arg.error);
    });
  }

  private onAPPLICATION_START_REQUEST(applicationId: string): void {
    if (this.getId() === applicationId) this.start();
  }

  private onUNCAUGHT_EXCEPTION(error: string): void {
    console.error(`Uncaught exception in object ${this.getId()} : ${error}`);
  }

  private onSET_OBJECT_STATE_REQUEST(
    objectId: string,
    state: ZirconObjectState,
  ): void {
    if (objectId !== state.id) throw new Error('Object ID mismatch');
    this.registerObjectState(state);
  }

  public getId(): string {
    return this._id;
  }

  public getLogger(): pino.Logger {
    return this.__logger;
  }

  public getObjectManager(): ZirconObjectManager {
    if (!this.__objectManager)
      this.__objectManager = new ZirconObjectManager(this);
    return this.__objectManager;
  }

  public async getInstance(
    objId: string,
    type: string = ZIRCON_OBJECT_TYPE,
  ): Promise<ZirconObject> {
    try {
      return this.getObjectManager().getInstance(objId, type);
    } catch (error) {
      this.emit('UNCAUGHT_EXCEPTION', { error: error.toString() });
      return null;
    }
  }

  public registerObjectFactory(factory: ZirconObjectFactory) {
    return this.getObjectManager().registerObjectFactory(factory);
  }

  private registerDefaultObjectStates(): void {
    const desktopManagerState: ZirconDesktopManagerState = {
      type: ZIRCON_DESKTOP_MANAGER_TYPE,
      id: this.getDesktopManagerId(),
      desktopIds: [],
    };
    this.registerObjectState(desktopManagerState);
  }

  private registerDefaultFactories(): void {
    this.registerObjectFactory(new ZirconWindowFactory(this));
    this.registerObjectFactory(new ZirconDesktopFactory(this));
    this.registerObjectFactory(new ZirconDesktopManagerFactory(this));
    this.registerObjectFactory(new ZirconVizWindowFactory(this));
    this.registerObjectFactory(new ZirconAppObjectFactory(this));
    this.registerObjectFactory(new ZirconEngineFactory(this));
    // may be we should not add param window as they are not stored windows...
    // this.registerObjectFactory(
    //   new ZirconParamWindowFactory(this),
    // );
  }

  // TODO: faire une methode generique getExisting et donner le type d'objet

  public getExistingViz(id: string): ZirconViz {
    const instance = this.getObjectManager().getExistingInstance(
      id,
      ZIRCON_VISUALIZER_TYPE,
    );
    if (instance && instance instanceof ZirconViz) return instance;
    return null;
  }

  public getExistingVizWindow(id: string): ZirconVizWindow {
    const instance = this.getObjectManager().getExistingInstance(
      id,
      ZIRCON_VISUALIZER_WINDOW_TYPE,
    );
    if (instance && instance instanceof ZirconVizWindow) return instance;
    return null;
  }

  public getExistingWindow(id: string): ZirconWindow {
    const instance = this.getObjectManager().getExistingInstance(
      id,
      ZIRCON_WINDOW_TYPE,
    );
    if (instance && instance instanceof ZirconWindow) return instance;
    return null;
  }

  public getExistingEngine(id: string): ZirconEngine {
    const instance = this.getObjectManager().getExistingInstance(
      id,
      ZIRCON_ENGINE_TYPE,
    );
    if (instance && instance instanceof ZirconEngine) return instance;
    return null;
  }

  public getExistingDesktop(id: string): ZirconDesktop {
    const instance = this.getObjectManager().getExistingInstance(
      id,
      ZIRCON_DESKTOP_TYPE,
    );
    if (instance && instance instanceof ZirconDesktop) return instance;
    return null;
  }

  public getExistingObject(id: string): ZirconObject {
    const instance = this.getObjectManager().getExistingInstance(
      id,
      ZIRCON_OBJECT_TYPE,
    );
    if (instance && instance instanceof ZirconObject) return instance;
    return null;
  }

  public getContextMenu(): ZirconContextMenu {
    if (this.__contextMenu) return this.__contextMenu;
    this.__contextMenu = new ZirconContextMenu(this);
    return this.__contextMenu;
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
    return this._eventEmitter?.emit(eventName as string, arg);
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
    this._eventEmitter?.addListener(eventName as string, cb);
    return this;
  }

  public getEventDispatcher(): EventEmitter2 {
    return this._eventEmitter;
  }

  // /**
  //  * get window by ID
  //  */
  // public getWindowById(id: string): ZirconWindow {
  //   return this.getDesktopManager().getWindowById(id);
  // }
  // /**
  //  * get desktop by ID
  //  */
  // public getDesktopById(id: string): ZirconDesktop {
  //   return this.getDesktopManager().getDesktopById(id);
  // }

  /**
   * @returns get UI Class
   */
  public getUIClass(): string {
    return this._uiClass;
  }

  public setUIClass(uiClass: string): void {
    this._uiClass = uiClass;
  }

  /**
   * remove application UI from parent
   * @returns true if done
   */
  public undisplayUI(): boolean {
    if (!this.__mainDiv) return false;
    if (!this._parent) return false;
    this._parent.removeChild(this.__mainDiv);
    return true;
  }

  /**
   * display UI in parent
   * @returns true if something has been added to the DOM, false otherwise
   */
  private displayUIIn(parent: HTMLElement): boolean {
    if (!parent) return false;
    const mainDiv = this.getMainDiv();
    if (!mainDiv) return false;
    if (parent.contains(mainDiv)) return false;
    if (this._parent) this.undisplayUI();
    this._parent = parent;
    // append app mainDiv in given parent
    this._parent.appendChild(mainDiv);
    // append desktopManager UI in app mainDiv
    this.getDesktopManager().displayUIIn(this.getMainDiv());
    return true;
  }

  public registerObjectState(state: ZirconObjectState): boolean {
    if (!this.getObjectManager().registerObjectState(state)) return false;
    this.emit('OBJECT_STATE_REGISTERED', { state: state });
    return true;
  }

  private async startEngines(): Promise<void> {
    return Promise.all(
      this.getObjectManager()
        .getRegisteredObjectsStates(ZIRCON_ENGINE_TYPE)
        .map((state) => {
          return this.getInstance(state.id, ZIRCON_ENGINE_TYPE).then(
            (engine) => {
              // TODO remove this cast
              return this.startEngine(engine as ZirconEngine);
            },
          );
        }),
    ).then(() => {});
  }

  private startEngine(engine: ZirconEngine): void {
    engine?.start();
  }

  /**
   * start application UI by displaying it in the body and starting engines
   */
  public async start(): Promise<void> {
    await this.createDesktopManager();
    await this.startEngines();
    this.displayUIIn(document.body);
  }

  private async createDesktopManager(): Promise<ZirconDesktopManager> {
    if (this.__desktopManager) return this.__desktopManager;
    this.__desktopManager = new ZirconDesktopManager(this);
    const desktopManagerState =
      this.getObjectManager().getRegisteredObjectState(this._desktopManagerId);
    if (!desktopManagerState)
      throw new Error(`createDesktopManager does not have a valid state`);
    const instance: ZirconObject = await this.getInstance(
      this._desktopManagerId,
    );
    if (!instance)
      throw new Error(
        `createDesktopManager does not return a DesktopManager object ! Id = ${this._desktopManagerId} state = ${JSON.stringify(desktopManagerState)}`,
      );
    if (!(instance instanceof ZirconDesktopManager))
      throw new Error(
        `createDesktopManager does not return a DesktopManager object ! but a ${instance.getType()}`,
      );
    this.__desktopManager = instance;
    return this.__desktopManager;
  }

  /**
   * get the main div
   * @returns
   */
  private getMainDiv(): HTMLDivElement {
    if (this.__mainDiv) return this.__mainDiv;
    this.__mainDiv = document.createElement('div');
    this.__mainDiv.id = `zircon-app-ui-${uuid()}`;
    this.__mainDiv.classList.add('zircon-ui');
    this.__mainDiv.classList.add(this.getUIClass());
    this.getContextMenu().addContextMenu(this.__mainDiv);
    return this.__mainDiv;
  }

  /**
   * The direct first zircon app object is the DesktopManager
   */
  public getDesktopManager(): ZirconDesktopManager {
    return this.__desktopManager;
  }

  public getDesktopManagerId(): string {
    return this._desktopManagerId;
  }

  public getCurrentState(): ZirconApplicationState {
    return {
      applicationId: this._applicationName,
      desktopManagerId: this._desktopManagerId,
      uiClass: this.getUIClass(),
    } as ZirconApplicationState;
  }
}

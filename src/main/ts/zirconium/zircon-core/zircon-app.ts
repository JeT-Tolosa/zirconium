import '../zircon-ui.css';
import EventEmitter2 from 'eventemitter2';
import {
  ZirconDesktopManager,
  ZirconDesktopManagerState,
} from './zircon-desktop-manager';
import { v4 as uuid } from 'uuid';

import 'jspanel4/dist/jspanel.min.css';
import { ZirconWindowEvents } from '../zircon-ui/zircon-window';
import { ZirconDesktopEvents } from '../zircon-ui/zircon-desktop';
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
import { ZirconEngine, ZirconEngineEvents } from './zircon-engine';
import { ZirconVizWindowEvents } from '../zircon-ui/zircon-viz-window';
import { ZirconParamWindowEvents } from '../zircon-params/zircon-param-window';
import {
  ZIRCON_DESKTOP_MANAGER_TYPE,
  ZIRCON_ENGINE_TYPE,
  ZIRCON_OBJECT_TYPE,
} from './zircon-types';
import { ZirconObjectManager } from './zircon-object-manager';
import { ZirconDesktopFactory } from '../zircon-ui/zircon-desktop-factory';
import { ZirconDesktopManagerFactory } from './zircon-desktop-manager-factory';
import { ZirconAppObjectFactory } from './zircon-app-object-factory';
import { ZirconEngineFactory } from './zircon-engine-factory';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconAppFactory } from './zircon-app-factory';
import { ZirconPluginManager } from '../zircon-plugin/zircon-plugin-manager';
import { ZirconPlugin } from '../zircon-plugin/zircon-plugin';

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
        PickEvents<
          ZirconApplicationEvents,
          'UNCAUGHT_EXCEPTION' | 'APPLICATION_STARTED'
        >,
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
  private __isStarted: boolean = true;
  private _applicationName: string = null;
  private _eventEmitter: EventEmitter2 = null;
  private _uiClass: string = 'zircon-ui';
  private _parent: HTMLElement = null;
  private __mainDiv: HTMLDivElement = null;
  private __contextMenu: ZirconContextMenu = null;

  private _desktopManagerId: string = 'application-desktop-manager';
  private __desktopManager: ZirconDesktopManager = null;
  private __objectManager: ZirconObjectManager = null;
  private __pluginManager: ZirconPluginManager = null;

  /**
   * constructor
   */
  constructor(applicationName: string) {
    this.__isStarted = false;
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
    // create event dispatcher
    this._eventEmitter = new EventEmitter2();
    this._eventEmitter.setMaxListeners(1000);
    // create object manager
    this.__objectManager = new ZirconObjectManager(this);
    // register default factories

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
    this.getObjectManager().registerObjectState(state);
  }

  public isStarted(): boolean {
    return this.__isStarted;
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

  public getPluginManager(): ZirconPluginManager {
    if (!this.__pluginManager)
      this.__pluginManager = new ZirconPluginManager(this);
    return this.__pluginManager;
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

    this.getObjectManager().registerObjectState(desktopManagerState);
  }

  private registerDefaultFactories(): void {
    this.registerObjectFactory(new ZirconAppFactory(this));
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
  private async displayUIIn(parent: HTMLElement): Promise<boolean> {
    if (!parent) return false;
    const mainDiv = this.getMainDiv();
    if (!mainDiv) return false;
    if (parent.contains(mainDiv)) return false;
    if (this._parent) this.undisplayUI();
    this._parent = parent;
    // append app mainDiv in given parent
    this._parent.appendChild(mainDiv);
    // append desktopManager UI in app mainDiv
    await this.getDesktopManager().displayUIIn(this.getMainDiv());
    return true;
  }

  public registerObjectState(state: ZirconObjectState): boolean {
    return this.getObjectManager().registerObjectState(state);
  }

  public registerPlugin(plugin: ZirconPlugin): boolean {
    return this.getPluginManager().registerPlugin(plugin);
  }

  private async startEngines(): Promise<void> {
    await Promise.all(
      this.getObjectManager()
        .getRegisteredObjectsStates(ZIRCON_ENGINE_TYPE)
        .map(async (state) => {
          const engine = await this.getInstance(state.id, ZIRCON_ENGINE_TYPE);
          return this.startEngine(engine as ZirconEngine);
        }),
    );
  }

  private async startEngine(engine: ZirconEngine): Promise<void> {
    await engine?.start();
    // connect dispatcher
    engine.setEventDispatcher(this.getEventDispatcher());
  }

  /**
   * start application UI by displaying it in the body and starting engines
   */
  public async start(): Promise<void> {
    await this.createDesktopManager();
    await this.getPluginManager().startPlugins();
    await this.startEngines();
    this.__isStarted = true;
    await this.displayUIIn(document.body);
    // activate first desktop if at least one exist
    if (this.getDesktopManager().getDesktopIds().length > 0)
      this.emit('DESKTOP_ACTIVATE_REQUEST', {
        desktopId: this.getDesktopManager().getDesktopIds()[0],
      });
    this.emit('APPLICATION_STARTED', { applicationId: this.getId() });
  }

  private async createDesktopManager(): Promise<ZirconDesktopManager> {
    if (this.__desktopManager) return this.__desktopManager;
    const desktopManagerState =
      this.getObjectManager().getRegisteredObjectState(this._desktopManagerId);
    if (!desktopManagerState)
      throw new Error(`createDesktopManager does not have a valid state`);
    this.__desktopManager = new ZirconDesktopManager(
      this,
      desktopManagerState as ZirconDesktopManagerState,
    );
    return this.__desktopManager;
  }

  public getUI(): HTMLElement {
    return this.__mainDiv;
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

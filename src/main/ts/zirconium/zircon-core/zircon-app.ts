import '../zircon-ui.css';
import EventEmitter2 from 'eventemitter2';
import {
  ZirconContextMenuFactoryDesktopManager,
  ZirconDesktopManager,
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
import { ZirconContextMenuFactoryRegistry } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconContextMenu } from '../zircon-menu/zircon-context-menu';
import {
  ZirconObject,
  ZirconObjectEvents,
  ZirconObjectState,
} from '../zircon-object';
import { ZirconObjectFactory } from '../zircon-object-factory';
import { ZirconVizWindowFactory } from '../zircon-ui/zircon-window-factory';
import { ZirconDesktopFactory } from '../zircon-ui/zircon-desktop-factory';
import {
  ZirconEngine,
  ZirconEngineEvents,
  ZirconEngineState,
} from './zircon-engine';
import {
  ZirconVizWindow,
  ZirconVizWindowEvents,
} from '../zircon-ui/zircon-viz-window';
import { ZirconContextMenuFactoryVizWindow } from '../zircon-menu/zircon-viz-window-context-menu';
import { ZirconContextMenuFactoryWindow } from '../zircon-menu/zircon-window-context-menu';
import { ZirconContextMenuFactoryDesktop } from '../zircon-menu/zircon-desktop-context-menu-factory';
import { ZirconParamWindowEvents } from '../zircon-params/zircon-param-window';
import { ZirconViz } from '../zircon-ui/zircon-visualizer';
import { Zircon } from '../zircon';
import { ZirconDesktopManagerFactory } from './zircon-desktop-manager-factory';

/**
 * Composition of this application UI
 */
export interface ZirconApplicationState {
  applicationId?: string;
  uiClass?: string;
  desktopManagerId: string;
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
        PickEvents<ZirconObjectEvents, 'UNCAUGHT_EXCEPTION'>,
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
  private _applicationName: string = null;
  private _eventEmitter: EventEmitter2 = null;
  private _uiClass: string = 'zircon-ui';
  private _parent: HTMLElement = null;
  private __mainDiv: HTMLDivElement = null;
  private __contextMenu: ZirconContextMenu = null;
  private _contextMenuFactoryRegistry: ZirconContextMenuFactoryRegistry = null;
  private _desktopManagerId: string = 'application-desktop-manager';
  private _desktopManager: ZirconDesktopManager = null;

  private __registeredObjectStates: { [id: string]: ZirconObjectState } = {}; // TODO: UI Object
  private __registeredEngineStates: { [id: string]: ZirconEngineState } = {};

  private __objectInstances: { [id: string]: ZirconObject } = {}; // TODO: UI Object
  private __engineInstances: { [id: string]: ZirconEngine } = {};
  private __factories: { [type: string]: ZirconObjectFactory } = {};

  /**
   * constructor
   */
  constructor(applicationName: string) {
    this._applicationName = applicationName;
    this._eventEmitter = new EventEmitter2();
    this._eventEmitter.setMaxListeners(1000);

    this.registerObjectFactory(new ZirconDesktopManagerFactory(this));
    this.registerObjectFactory(new ZirconVizWindowFactory(this));
    this.registerObjectFactory(new ZirconDesktopFactory(this));

    this._contextMenuFactoryRegistry = new ZirconContextMenuFactoryRegistry(
      this,
    );
    this._contextMenuFactoryRegistry.registerFactory(
      new ZirconContextMenuFactoryVizWindow(this),
    );
    this._contextMenuFactoryRegistry.registerFactory(
      new ZirconContextMenuFactoryWindow(this),
    );
    this._contextMenuFactoryRegistry.registerFactory(
      new ZirconContextMenuFactoryDesktop(this),
    );
    this._contextMenuFactoryRegistry.registerFactory(
      new ZirconContextMenuFactoryDesktopManager(this),
    );
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

  public registerObjectFactory(factory: ZirconObjectFactory): boolean {
    if (!factory) return false;
    this.__factories[factory.getType()] = factory;
    return true;
  }

  private createObject(state: ZirconObjectState): Promise<ZirconObject> {
    if (!state) return Promise.resolve(null);
    if (!state.type)
      return Promise.reject(
        `Cannot create an object with undefined type: ${JSON.stringify(state)}`,
      );
    const factory: ZirconObjectFactory = this.__factories[state.type];
    if (!factory)
      Promise.reject(`No valid factory for object type ${state.type}`);
    return factory.createInstance(state).then((instance: ZirconObject) => {
      // link dispatchers
      instance.setEventDispatcher(this.getEventDispatcher());
      return instance;
    });
  }

  // public getWindow(id: string): ZirconWindow {
  //   return this._windows[id];
  // }

  // public getDesktop(id: string): ZirconDesktop {
  //   return this._desktops[id];
  // }

  private addInstance(obj: ZirconObject): ZirconObject {
    if (!obj) return null;
    if (this.__objectInstances[obj.getId()] === obj) return obj;
    this.__objectInstances[obj.getId()] = obj;
    return obj;
  }

  public getInstance(objId: string): Promise<ZirconObject> {
    const instance = this.__objectInstances[objId];
    if (instance) return Promise.resolve(instance);
    const state = this.__registeredObjectStates[objId];
    if (state)
      return this.createObject(state).then((instance: ZirconObject) => {
        return this.addInstance(instance);
      });
    return Promise.resolve(null);
  }

  // TODO: faire une methode generique getExisting et donner le type d'objet

  public getExistingViz(id: string): ZirconViz {
    const instance = this.__objectInstances[id];
    if (instance && instance instanceof ZirconViz) return instance;
    return null;
  }

  public getExistingVizWindow(id: string): ZirconVizWindow {
    const instance = this.__objectInstances[id];
    if (instance && instance instanceof ZirconVizWindow) return instance;
    return null;
  }

  public getExistingWindow(id: string): ZirconWindow {
    const instance = this.__objectInstances[id];
    if (instance && instance instanceof ZirconWindow) return instance;
    return null;
  }

  public getExistingDesktop(id: string): ZirconDesktop {
    const instance = this.__objectInstances[id];
    if (instance && instance instanceof ZirconDesktop) return instance;
    return null;
  }

  public getExistingObject(id: string): ZirconObject {
    const instance = this.__objectInstances[id];
    if (instance && instance instanceof ZirconObject) return instance;
    return null;
  }

  /**
   * register a new object state
   * @param state
   * @returns
   */
  public registerObjectState(state: ZirconObjectState): boolean {
    if (!state) return false;
    if (!state.id) throw new Error('Object state must have an id');
    if (!state.type)
      throw new Error(`Object ${state.id} state must have a type`);
    // Special case for dekstop manager which is unique
    // add or update state
    this.__registeredObjectStates[state.id] = state;
    this.emit('OBJECT_STATE_REGISTERED', { state: state });
    return true;
  }

  public getRegisteredObjectState(id: string): ZirconObjectState {
    return this.__registeredObjectStates[id];
  }

  public getRegisteredObjectStates(): { [id: string]: ZirconObjectState } {
    return this.__registeredObjectStates;
  }

  public getContextMenuFactoryRegistry(): ZirconContextMenuFactoryRegistry {
    return this._contextMenuFactoryRegistry;
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

  public registerEngineState(state: ZirconEngineState): boolean {
    if (!state) return false;
    if (!state.id) throw new Error('Engine state must have an id');
    if (!state.type)
      throw new Error(`Engine ${state.id} state must have a type`);
    this.__registeredEngineStates[state.id] = state;
    this.emit('ENGINE_STATE_REGISTERED', { state: state });
    return true;
  }

  private getEngineStates(): ZirconEngineState[] {
    return Object.values(this.__registeredEngineStates);
  }

  private startEngines(): Promise<void> {
    return Promise.all(
      this.getEngineStates().map((state) => {
        return this.getEngineInstance(state.id).then((engine) => {
          return this.startEngine(engine);
        });
      }),
    ).then(() => {});
  }

  private startEngine(engine: ZirconEngine): void {
    engine?.start();
  }

  public getEngineInstance(engineId: string): Promise<ZirconEngine> {
    const instance = this.__engineInstances[engineId];
    if (instance) return Promise.resolve(instance);
    const state = this.__registeredEngineStates[engineId];
    if (state)
      return this.createObject(state).then((instance: ZirconObject) => {
        if (!(instance instanceof ZirconEngine))
          throw new Error(`Object with id ${engineId} is not an engine`);
        return this.addEngineInstance(instance);
      });
    return Promise.resolve(null);
  }

  private addEngineInstance(engine: ZirconEngine): ZirconEngine {
    if (!engine) return null;
    this.__engineInstances[engine.getId()] = engine;
    return engine;
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
    if (this._desktopManager) return Promise.resolve(this._desktopManager);
    return this.getInstance(this._desktopManagerId).then(
      (instance: ZirconObject) => {
        this._desktopManager = Zircon.asDesktopManager(instance);
        return this._desktopManager;
      },
    );
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
    return this._desktopManager;
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

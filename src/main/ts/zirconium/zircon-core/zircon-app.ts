import '../zircon-ui.css';
import EventEmitter2 from 'eventemitter2';
import {
  ZIRCON_DESKTOP_MANAGER_TYPE,
  ZirconContextMenuFactoryDesktopManager,
  ZirconDesktopManager,
  ZirconDesktopManagerState,
} from '../zircon-ui/zircon-desktop-manager';
import { v4 as uuid } from 'uuid';

import 'jspanel4/dist/jspanel.min.css';
import {
  ZirconContextMenuFactoryWindow,
  ZirconWindow,
  ZirconWindowEvents,
} from '../zircon-ui/zircon-window';
import {
  ZirconContextMenuFactoryDesktop,
  ZirconDesktop,
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
import { Zircon } from '../zircon';
import { ZirconWindowFactory } from '../zircon-ui/zircon-window-factory';
import { ZirconDesktopFactory } from '../zircon-ui/zircon-desktop-factory';

/**
 * Composition of this application UI
 */
export interface ZirconApplicationState {
  applicationId?: string;
  uiClass?: string;
  desktopManager?: ZirconDesktopManagerState;
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
  OBJECT_STATE_REGISTERED: {
    objectId: string;
    objectType: string;
    state: ZirconObjectState;
  };
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
        PickEvents<
          ZirconApplicationEvents,
          | 'APPLICATION_START_REQUEST'
          | 'APPLICATION_STARTED'
          | 'OBJECT_STATE_REGISTERED'
          | 'SET_OBJECT_STATE_REQUEST'
        >,
        PickEvents<
          ZirconWindowEvents,
          'WINDOW_SET_PARENT_DESKTOP_DONE' | 'WINDOW_SET_PARENT_DESKTOP_ERROR'
        >,
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

  private _desktopManager: ZirconDesktopManager = null;

  private __registeredStates: { [id: string]: ZirconObjectState } = {};
  private __instances: { [id: string]: ZirconObject } = {};
  private __factories: { [type: string]: ZirconObjectFactory } = {};

  /**
   * constructor
   */
  constructor(applicationName: string) {
    this._applicationName = applicationName;
    this._eventEmitter = new EventEmitter2();
    this._eventEmitter.setMaxListeners(1000);

    this.registerObjectFactory(new ZirconWindowFactory(this));
    this.registerObjectFactory(new ZirconDesktopFactory(this));

    this._contextMenuFactoryRegistry = new ZirconContextMenuFactoryRegistry(
      this,
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
    this.registerState(state);
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
    return factory.createInstance(state);
  }

  // public getWindow(id: string): ZirconWindow {
  //   return this._windows[id];
  // }

  // public getDesktop(id: string): ZirconDesktop {
  //   return this._desktops[id];
  // }

  private addInstance(obj: ZirconObject): ZirconObject {
    if (!obj) return null;
    if (this.__instances[obj.getId()] === obj) return obj;
    this.__instances[obj.getId()] = obj;
    return obj;
  }

  public getInstance(objId: string): Promise<ZirconObject> {
    const instance = this.__instances[objId];
    if (instance) return Promise.resolve(instance);
    const state = this.__registeredStates[objId];
    if (state)
      return this.createObject(state).then((instance: ZirconObject) => {
        return this.addInstance(instance);
      });
    return Promise.resolve(null);
  }

  public getExistingWindow(id: string): ZirconWindow {
    const instance = this.__instances[id];
    if (instance && instance instanceof ZirconWindow) return instance;
    return null;
  }

  public getExistingDesktop(id: string): ZirconDesktop {
    const instance = this.__instances[id];
    if (instance && instance instanceof ZirconDesktop) return instance;
    return null;
  }

  /**
   * register a new object state
   * @param state
   * @returns
   */
  public registerState(state: ZirconObjectState): boolean {
    if (!state) return false;
    if (!state.id) return false;
    // Special case for dekstop manager which is unique
    if (state.type === ZIRCON_DESKTOP_MANAGER_TYPE) {
      this.getDesktopManager().setState(Zircon.asDesktopManagerState(state));
      this.__registeredStates[state.id] = state;
      return;
    }
    // add new state
    this.__registeredStates[state.id] = state;
    this.emit('OBJECT_STATE_REGISTERED', {
      objectId: state.id,
      objectType: state.type,
      state: state,
    });
    return true;
  }

  public getRegisteredState(id: string): ZirconObjectState {
    return this.__registeredStates[id];
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
    if (!this._eventEmitter)
      throw new Error(
        `Cannot emit events before event Bus is set[call ::connectToApplication() method]`,
      );
    return this._eventEmitter.emit(eventName as string, arg);
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
    if (!this._eventEmitter)
      throw new Error(
        `Cannot add Event Listener before event Bus is set[call ::connectToApplication() method]`,
      );
    this._eventEmitter.addListener(eventName as string, cb);
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

  public start(): void {
    this.displayUIIn(document.body);
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
    if (this._desktopManager) return this._desktopManager;
    this._desktopManager = new ZirconDesktopManager(this);
    return this._desktopManager;
  }

  public getCurrentState(): ZirconApplicationState {
    return {
      applicationId: this._applicationName,
      desktopManager: this._desktopManager?.generateCurrentState(),
      uiClass: this.getUIClass(),
    } as ZirconApplicationState;
  }
}

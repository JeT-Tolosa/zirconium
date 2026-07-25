import { setTheme } from '@ui5/webcomponents-base/dist/config/Theme.js';
setTheme('sap_horizon');

// zircon-ui must be after ui5 theme setTheme
import '../zircon-ui.css';
import '../zircon-ui5.css';
import {
  ZirconDesktopManager,
  ZirconDesktopManagerEvents,
  ZirconDesktopManagerState,
} from './zircon-desktop-manager';
import { v4 as uuid } from 'uuid';

import 'jspanel4/dist/jspanel.min.css';
import { ZirconWindowEvents } from '../zircon-ui/zircon-window';
import { ZirconDesktopEvents } from '../zircon-ui/zircon-desktop';
import {
  MergePickEvents,
  PickEvents,
  ZirconEventInfo,
} from '../zircon-event/zircon-event';
import { ZirconContextMenu } from '../zircon-menu/zircon-context-menu';
import pino from 'pino';
import {
  ZirconObject,
  ZirconObjectEvents,
  ZirconObjectState,
} from './zircon-object';
import { ZirconWindowFactory } from '../zircon-ui/zircon-window-factory';
import { ZirconEngine, ZirconEngineEvents } from './zircon-engine';
import { ZirconVizWindowEvents } from '../zircon-ui/zircon-viz-window';
import { ZirconParamWindowEvents } from '../zircon-params/zircon-param-window';
import {
  ZIRCON_DATA_PROVIDER_TYPE,
  ZIRCON_DESKTOP_MANAGER_TYPE,
  ZIRCON_ENGINE_TYPE,
  ZIRCON_OBJECT_TYPE,
} from './zircon-types';
import {
  ZirconObjectManager,
  ZirconObjectManagerEvents,
} from './zircon-object-manager';
import { ZirconDesktopFactory } from '../zircon-ui/zircon-desktop-factory';
import { ZirconDesktopManagerFactory } from './zircon-desktop-manager-factory';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconPluginManager } from '../zircon-plugin/zircon-plugin-manager';
import { ZirconPlugin } from '../zircon-plugin/zircon-plugin';
import { ZirconDataProviderManager } from '../zircon-data/zircon-data-provider-manager';
import { ZirconDataAdapterFactory } from '../zircon-data/zircon-data-adapter-factory';
import { ZirconDataProviderFactory } from '../zircon-data/zircon-data-provider-factory';
import { ZirconDataProvider } from '../zircon-data/zircon-data-provider';
import { ZirconContextMenuFactoryApplication } from '../zircon-menu/zircon-app-context-menu';
import { ZirconStateEditorManager } from '../zircon-params/zircon-state-editor-manager';
import { ZirconEngineFactory } from './zircon-engine-factory';
import { ZirconVizWindowFactory } from '../zircon-ui/zircon-viz-window-factory';
import { ZirconParamWindowFactory } from '../zircon-params/zircon-param-window-factory';
import { ZirconStateEditorPreFactory } from '../zircon-params/zircon-state-editor-pre';
import { ZirconStateJsonEditorFactory } from '../zircon-params/zircon-state-editor-jsoneditor';
import { ZirconEventDispatcher } from '../zircon-event/zircon-event-dispatcher';

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
  UNCAUGHT_EXCEPTION: { error: string };
  APPLICATION_SAVE_WORKSPACE_REQUEST: { filePath: string };
  APPLICATION_LOAD_WORKSPACE_REQUEST: { filePath: string };
  APPLICATION_QUIT_REQUEST: { filePath: string };
};

export type ZirconApplicationEventRegistry = {
  incoming: MergePickEvents<
    [
      PickEvents<
        ZirconApplicationEvents,
        | 'APPLICATION_START_REQUEST'
        | 'APPLICATION_SAVE_WORKSPACE_REQUEST'
        | 'APPLICATION_LOAD_WORKSPACE_REQUEST'
        | 'APPLICATION_QUIT_REQUEST'
        | 'UNCAUGHT_EXCEPTION'
        | 'APPLICATION_STARTED'
      >,
      PickEvents<
        ZirconWindowEvents,
        'WINDOW_SET_PARENT_DESKTOP_REQUEST' | 'WINDOW_SET_PARENT_DESKTOP_DONE'
      >,
    ]
  >;
  outgoing: MergePickEvents<
    [
      ZirconApplicationEvents,
      ZirconObjectManagerEvents,
      ZirconObjectEvents,
      ZirconWindowEvents,
      ZirconDesktopEvents,
      ZirconDesktopManagerEvents,
      ZirconParamWindowEvents,
      ZirconVizWindowEvents,
      ZirconEngineEvents,
    ]
  >;
};

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
  private _eventDispatcher: ZirconEventDispatcher<R> = null;
  private _uiClass: string = 'zircon-ui';
  private _parent: HTMLElement = null;
  private __mainDiv: HTMLDivElement = null;
  private __contextMenu: ZirconContextMenu = null;

  private _desktopManagerId: string = 'application-desktop-manager';
  private __contextMenuFactory: ZirconContextMenuFactoryApplication = null;
  private __desktopManager: ZirconDesktopManager = null;
  private __objectManager: ZirconObjectManager = null;
  private __pluginManager: ZirconPluginManager = null;
  private __dataProviderManager: ZirconDataProviderManager = null;
  private __stateEditorManager: ZirconStateEditorManager = null;

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
    this._eventDispatcher = new ZirconEventDispatcher();
    // // create object manager
    // this.__objectManager = new ZirconObjectManager(this);
    // // create data provider manager
    // this.__dataProviderManager = new ZirconDataProviderManager(this);
    // register default factories

    this.registerDefaultFactories().then(() => {
      this.registerDefaultObjectStates();
      this.listenToEvents();
    });
  }

  private listenToEvents(): void {
    this.addListener('APPLICATION_START_REQUEST', (arg) =>
      this.onAPPLICATION_START_REQUEST(arg.applicationId),
    );

    this.addListener('UNCAUGHT_EXCEPTION', (arg) => {
      this.onUNCAUGHT_EXCEPTION(arg.error);
    });
    this.addListener('APPLICATION_SAVE_WORKSPACE_REQUEST', (arg) => {
      this.onAPPLICATION_SAVE_WORKSPACE_REQUEST(arg.filePath);
    });
    this.addListener('APPLICATION_LOAD_WORKSPACE_REQUEST', (arg) => {
      this.onAPPLICATION_LOAD_WORKSPACE_REQUEST(arg.filePath);
    });
    this.addListener('APPLICATION_QUIT_REQUEST', () => {
      this.onAPPLICATION_QUIT_REQUEST();
    });
  }
  private async onAPPLICATION_SAVE_WORKSPACE_REQUEST(
    filePath: string,
  ): Promise<void> {
    const applicationState = this.getCurrentState();
    const success = await window.electronAPI.saveJson(
      filePath,
      applicationState,
    );
    if (success) {
      console.log('Préférences sauvegardées !');
    }
  }

  private async onAPPLICATION_LOAD_WORKSPACE_REQUEST(
    filePath: string,
  ): Promise<void> {
    try {
      const applicationState = await window.electronAPI.readJson(filePath);
      console.log(applicationState);
    } catch (err) {
      console.warn(
        'Aucun fichier de paramètres trouvé, chargement des valeurs par défaut.',
        err,
      );
    }
  }

  private onAPPLICATION_QUIT_REQUEST(): void {}

  private onAPPLICATION_START_REQUEST(applicationId: string): void {
    if (this.getId() === applicationId) {
      this.start();
    }
  }

  private onUNCAUGHT_EXCEPTION(error: string): void {
    console.error(`Uncaught exception in object ${this.getId()} : ${error}`);
  }

  // private onZIRCON_OBJECT_SET_STATE_REQUEST(
  //   objectId: string,
  //   state: ZirconObjectState,
  // ): void {
  //   if (objectId !== state.id) {
  //     throw new Error('Object ID mismatch');
  //   }
  //   this.getObjectManager().registerObjectState(state);
  // }

  public isStarted(): boolean {
    return this.__isStarted;
  }

  public getId(): string {
    return this._id;
  }

  public getLogger(): pino.Logger {
    return this.__logger;
  }

  public getContextMenuFactory(): ZirconContextMenuFactoryApplication {
    if (!this.__contextMenuFactory) {
      this.__contextMenuFactory = new ZirconContextMenuFactoryApplication(this);
    }
    return this.__contextMenuFactory;
  }

  public getObjectManager(): ZirconObjectManager {
    if (!this.__objectManager) {
      this.__objectManager = new ZirconObjectManager(this);
    }
    return this.__objectManager;
  }

  public getPluginManager(): ZirconPluginManager {
    if (!this.__pluginManager) {
      this.__pluginManager = new ZirconPluginManager(this);
    }
    return this.__pluginManager;
  }

  public getDataProviderManager(): ZirconDataProviderManager {
    if (!this.__dataProviderManager) {
      this.__dataProviderManager = new ZirconDataProviderManager(this);
    }
    return this.__dataProviderManager;
  }

  public getStateEditorManager(): ZirconStateEditorManager {
    if (!this.__stateEditorManager) {
      this.__stateEditorManager = new ZirconStateEditorManager(this);
      this.__stateEditorManager.registerStateEditorFactory(
        ZIRCON_OBJECT_TYPE,
        new ZirconStateEditorPreFactory(),
      );
      this.__stateEditorManager.registerStateEditorFactory(
        ZIRCON_OBJECT_TYPE,
        new ZirconStateJsonEditorFactory(),
      );
    }
    return this.__stateEditorManager;
  }

  public async getInstance(
    objId: string,
    type: string = ZIRCON_OBJECT_TYPE,
  ): Promise<ZirconObject> {
    try {
      return this.getObjectManager().getInstance(objId, type);
    } catch (error) {
      this.emit('UNCAUGHT_EXCEPTION', {
        error: error.toString(),
      });
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

  private async registerDefaultFactories(): Promise<void> {
    // await this.registerObjectFactory(new ZirconAppFactory(this));
    await this.registerObjectFactory(new ZirconDesktopFactory(this));
    await this.registerObjectFactory(new ZirconDesktopManagerFactory(this));
    await this.registerObjectFactory(new ZirconWindowFactory(this));
    await this.registerObjectFactory(new ZirconVizWindowFactory(this));
    await this.registerObjectFactory(new ZirconParamWindowFactory(this));
    await this.registerObjectFactory(new ZirconEngineFactory());
  }

  public async registerDataAdapterFactory(
    name: string,
    inputDataType: string,
    outputDataType: string,
    transformData?: (data: unknown) => unknown,
    comparData?: (a: unknown, b: unknown) => number,
  ): Promise<void> {
    const factory = new ZirconDataAdapterFactory(
      name,
      inputDataType,
      outputDataType,
      transformData,
      comparData,
    );
    await this.registerObjectFactory(factory);
  }

  public async registerDataProviderFactory(
    name: string,
    outputDataType: string,
    compareData?: (a: unknown, b: unknown) => number,
  ): Promise<void> {
    const factory = new ZirconDataProviderFactory(
      name,
      outputDataType,
      compareData,
    );
    await this.registerObjectFactory(factory);
  }

  public getContextMenu(): ZirconContextMenu {
    if (this.__contextMenu) {
      return this.__contextMenu;
    }
    this.__contextMenu = new ZirconContextMenu(this);
    return this.__contextMenu;
  }

  public getEventDispatcher(): ZirconEventDispatcher<R> {
    return this._eventDispatcher;
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
    if (!this.__mainDiv) {
      return false;
    }
    if (!this._parent) {
      return false;
    }
    this._parent.removeChild(this.__mainDiv);
    return true;
  }

  /**
   * display UI in parent
   * @returns true if something has been added to the DOM, false otherwise
   */
  private async displayUIIn(parent: HTMLElement): Promise<boolean> {
    if (!parent) {
      return false;
    }
    const mainDiv = this.getMainDiv();
    if (!mainDiv) {
      return false;
    }
    if (parent.contains(mainDiv)) {
      return false;
    }
    if (this._parent) {
      this.undisplayUI();
    }
    this._parent = parent;
    // append app mainDiv in given parent
    this._parent.appendChild(mainDiv);
    // append desktopManager UI in app mainDiv
    await this.getDesktopManager().displayUIIn(this.getMainDiv());
    return true;
  }

  public registerObjectState(state: ZirconObjectState): boolean {
    this.emit('STORE_STATE_SNAPSHOT_REQUEST', {
      state: state,
    });
    return true;
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
          if (!(engine instanceof ZirconEngine)) {
            throw new Error(
              `engine ${engine.getId()} with type ${engine.getType()} is not a subclass of ${ZirconEngine.name}`,
            );
          }
          return this.startEngine(engine);
        }),
    );
  }

  private async startEngine(engine: ZirconEngine): Promise<void> {
    await engine?.start();
    // connect dispatcher
    engine.setEventDispatcher(this.getEventDispatcher());
  }

  private async startDataProviders(): Promise<void> {
    await Promise.all(
      this.getObjectManager()
        .getRegisteredObjectsStates(ZIRCON_DATA_PROVIDER_TYPE)
        .map(async (state) => {
          const dataProvider = await this.getInstance(
            state.id,
            ZIRCON_DATA_PROVIDER_TYPE,
          );
          if (!(dataProvider instanceof ZirconDataProvider)) {
            throw new Error(
              `data provider ${dataProvider.getId()} with type ${dataProvider.getType()} is not a subclass of ${ZirconDataProvider.name}`,
            );
          }
          if (dataProvider instanceof ZirconDataProvider) {
            this.getDataProviderManager().registerDataProvider(dataProvider);
            return this.startDataProvider(dataProvider);
          }
        }),
    );
  }

  private async startDataProvider(
    dataProvider: ZirconDataProvider,
  ): Promise<void> {
    await dataProvider?.activate(true);
    // connect dispatcher
    dataProvider.setEventDispatcher(this.getEventDispatcher());
  }

  /**
   * start application UI by displaying it in the body and starting engines
   */
  public async start(): Promise<void> {
    await this.createDesktopManager();
    await this.getPluginManager().startPlugins();
    await this.startEngines();
    await this.startDataProviders();
    this.__isStarted = true;
    await this.displayUIIn(document.body);
    // activate first desktop if at least one exist
    if (this.getDesktopManager().getDesktopIds().length > 0) {
      this.emit('DESKTOP_ACTIVATE_REQUEST', {
        desktopId: this.getDesktopManager().getDesktopIds()[0],
      });
    }
    // set UI5 web components theme to sap_horizon_dark
    this.emit('APPLICATION_STARTED', {
      applicationId: this.getId(),
    });
  }

  private async createDesktopManager(): Promise<ZirconDesktopManager> {
    if (this.__desktopManager) {
      return this.__desktopManager;
    }
    const desktopManagerState =
      this.getObjectManager().getRegisteredObjectState(this._desktopManagerId);
    if (!desktopManagerState) {
      throw new Error(`createDesktopManager does not have a valid state`);
    }
    this.__desktopManager = new ZirconDesktopManager(this);
    await this.__desktopManager.setState(
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
    if (this.__mainDiv) {
      return this.__mainDiv;
    }
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

  /**
   * emit an event
   * @param event
   * @param args
   * @returns
   */
  public emit<K extends keyof R['outgoing']>(
    eventName: K,
    payload: R['outgoing'][K],
    info?: { emitterId: string; parentId: string },
  ): ZirconEventInfo {
    return this.getEventDispatcher().emit(eventName, payload, info);
  }

  /**
   * Add a listener
   * @param event
   * @param cb
   * @returns
   */
  public addListener<K extends keyof R['incoming']>(
    eventName: K,
    cb: (
      arg: R['incoming'][K],
      info?: { emitterId: string; parentId: string },
    ) => void,
  ): this {
    this.getEventDispatcher().addListener(eventName, cb);
    return this;
  }
}

import { ZirconWindow } from './zircon-window';
import {
  ZIRCON_TARGET_DESKTOP_ID,
  ZirconApplication,
} from '../zircon-core/zircon-app';
import {
  ZirconAppObject,
  ZirconAppObjectState,
  ZirconAppObjectEventRegistry,
} from '../zircon-core/zircon-app-object';
import { MergeZirconRegistries, PickEvents } from '../zircon-event';
import { ZirconObject } from '../zircon-object';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconContextMenuItem } from '../zircon-menu/zircon-context-menu';
import { ArrayComparisonResult, Zircon } from '../zircon';
import { ACTIVE_DESKTOP_CLASS } from './zircon-desktop-manager';

export const ZIRCON_DESKTOP_TYPE: string = 'ZirconDesktop';

export type ZirconDesktopEvents = {
  DESKTOP_ACTIVATE_REQUEST: { desktopId: string };
  DESKTOP_DEACTIVATE_REQUEST: { desktopId: string };
  DESKTOP_ACTIVATED: { desktopId: string };
  DESKTOP_ACTIVATE_ERROR: {
    desktopId: string;
    error: string;
  };
  DESKTOP_DEACTIVATED: { desktopId: string };
  DESKTOP_DEACTIVATE_ERROR: { desktopId: string };
  DESKTOP_NAME_CHANGED: { desktopId: string; name: string };
  DESKTOP_WINDOW_IDS_ERROR: {
    desktopId: string;
    windowIds: string[];
    error: string;
  };
  DESKTOP_WINDOW_IDS_CHANGED: { desktopId: string; windowIds: string[] };
};

export type ZirconDesktopEventRegistry = MergeZirconRegistries<
  {
    incoming: PickEvents<
      ZirconDesktopEvents,
      | 'DESKTOP_ACTIVATE_REQUEST'
      | 'DESKTOP_DEACTIVATE_REQUEST'
      | 'DESKTOP_DEACTIVATE_REQUEST'
    >;
    outgoing: PickEvents<
      ZirconDesktopEvents,
      | 'DESKTOP_ACTIVATED'
      | 'DESKTOP_ACTIVATE_ERROR'
      | 'DESKTOP_DEACTIVATED'
      | 'DESKTOP_DEACTIVATE_ERROR'
      | 'DESKTOP_WINDOW_IDS_CHANGED'
      | 'DESKTOP_WINDOW_IDS_ERROR'
    >;
  },
  ZirconAppObjectEventRegistry
>;

export interface ZirconDesktopState extends ZirconAppObjectState {
  type: typeof ZIRCON_DESKTOP_TYPE;
  name?: string;
  windowIds?: string[];
}

export const DEFAULT_DESKTOP_STATE: ZirconDesktopState = {
  type: ZIRCON_DESKTOP_TYPE,
  name: 'Zircon Desktop',
};

interface ZirconDesktopUI {
  window: ZirconWindow;
  panel: HTMLElement;
}

/**
 * A Zircon Desktop is a collection  of managed Zircon Windows
 */
export class ZirconDesktop<
  R extends ZirconDesktopEventRegistry = ZirconDesktopEventRegistry,
> extends ZirconAppObject<R> {
  private _windowIds: string[] = [];

  private __container: HTMLDivElement = null;
  private __displayedWindows: { [id: string]: ZirconDesktopUI } = {};

  /**
   * constructor
   * @param param
   */
  constructor(
    app: ZirconApplication,
    state: ZirconDesktopState = DEFAULT_DESKTOP_STATE,
  ) {
    super(app);
    this.setState(state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('DESKTOP_ACTIVATE_REQUEST', (arg) =>
      this.onDESKTOP_ACTIVATE_REQUEST(arg.desktopId),
    );
    this.addListener('DESKTOP_DEACTIVATE_REQUEST', (arg) =>
      this.onDESKTOP_DEACTIVATE_REQUEST(arg.desktopId),
    );
  }

  private onDESKTOP_ACTIVATE_REQUEST(desktopId: string): void {
    if (desktopId !== this.getId()) return;
    this.activate();
  }

  private onDESKTOP_DEACTIVATE_REQUEST(desktopId: string): void {
    if (desktopId !== this.getId()) return;
    this.deactivate();
  }

  /**
   * set desktop IDs
   * @param windowIds
   */
  private setWindowIds(windowIds: string[]): void {
    let changes: boolean = false;
    const res: ArrayComparisonResult = Zircon.arrayComparison(
      this.getWindowIds(),
      windowIds,
    );
    this._windowIds = windowIds;
    res.inserted?.forEach((windowId) => {
      this.displayWindow(windowId).catch((error) => {
        this.emit('DESKTOP_WINDOW_IDS_ERROR', {
          desktopId: this.getId(),
          windowIds: windowIds,
          error: `Error displaying window ${windowId} in desktop ${this.getId()} : ${error.message}`,
        });
      });
      changes = true;
    });
    res.deleted?.forEach((windowId) => {
      if (!this.undisplayWindow(windowId)) {
        this.emit('DESKTOP_WINDOW_IDS_ERROR', {
          desktopId: this.getId(),
          windowIds: windowIds,
          error: `Error undisplaying window ${windowId} in desktop ${this.getId()}`,
        });
      }
      changes = true;
    });
    if (changes) {
      this.emit('DESKTOP_WINDOW_IDS_CHANGED', {
        desktopId: this.getId(),
        windowIds: windowIds,
      });
    }
  }

  public override async setState(state: ZirconDesktopState): Promise<void> {
    return super.setState(state).then(() => {
      this.setWindowIds(state.windowIds);
    });
  }

  /**
   * Get displayed window
   */
  public getDisplayedWindows(): ZirconDesktopUI[] {
    return Object.values(this.__displayedWindows);
  }

  /**
   * Get managed window Ids array
   */
  public getWindowIds(): string[] {
    return this._windowIds;
  }

  /**
   * Get the state of this Desktop Object
   * @returns The state of the Desktop
   */
  public override generateCurrentState(): ZirconDesktopState {
    return {
      ...super.generateCurrentState(),
      windowIds: [...this._windowIds],
      type: ZIRCON_DESKTOP_TYPE,
    };
  }

  /**
   * @returns Desktop dimension
   **/
  public getLeft(): number {
    return this.getContainer().getBoundingClientRect().left;
  }

  /**
   * @returns Desktop dimension
   **/
  public getTop(): number {
    return this.getContainer().getBoundingClientRect().top;
  }

  /**
   * @returns Desktop dimension
   **/
  public getWidth(): number {
    return this.getContainer().getBoundingClientRect().width;
  }

  /**
   * @returns Desktop dimension
   **/
  public getHeight(): number {
    return this.getContainer().getBoundingClientRect().height;
  }

  public getContainer(): HTMLDivElement {
    if (!this.__container) this.createContainer(this.getId());
    return this.__container;
  }

  private createContainer(id: string): HTMLDivElement {
    if (this.__container)
      throw new Error(
        'Desktop container already created. Please clean object before re-creating',
      );
    this.__container = document.createElement('div');
    this.__container.id = `desktop-container-${id}`;
    this.__container.classList.add('desktop');
    this.__container.id = this.getId();
    this.__container.setAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
      this.getId(),
    );
    this.__container.setAttribute(ZIRCON_TARGET_DESKTOP_ID, this.getId());
    return this.__container;
  }

  private activate() {
    this.getContainer().classList.add(ACTIVE_DESKTOP_CLASS);
    this.emit('DESKTOP_ACTIVATED', {
      desktopId: this.getId(),
    });
  }

  private deactivate() {
    this.getContainer().classList.remove(ACTIVE_DESKTOP_CLASS);
    this.emit('DESKTOP_DEACTIVATED', {
      desktopId: this.getId(),
    });
  }

  private displayWindow(windowId: string): Promise<void> {
    if (!windowId) return Promise.resolve();
    const ui: ZirconDesktopUI = this.__displayedWindows[windowId];
    if (ui) return Promise.resolve();
    return this.getApplication()
      .getInstance(windowId)
      .then((obj: ZirconObject) => {
        const window: ZirconWindow = Zircon.asWindow(obj);
        if (!window)
          return Promise.reject(
            `Cannot display Window with id ${windowId} object is not a Window: type ${obj.getType()}`,
          );
        // add Window in desktop
        const panel: HTMLElement = window.getContainer();
        this.getContainer().appendChild(panel);
        window.setParentDesktop(this);
        this.__displayedWindows[windowId] = { window: window, panel: panel };
      });
  }

  private undisplayWindow(windowId: string): boolean {
    if (!windowId) return false;
    const ui: ZirconDesktopUI = this.__displayedWindows[windowId];
    if (!ui) return false;
    this.getContainer().removeChild(ui.panel);
    delete this.__displayedWindows[windowId];
    this.getApplication().getExistingWindow(windowId)?.setParentDesktop(null);
    return true;
  }

  private displayWindows(): Promise<void> {
    return Promise.all(
      this._windowIds.map((id) => this.displayWindow(id)),
    ).then(null);
  }
}

/**
 * Context Menu for Window
 */
export class ZirconContextMenuFactoryDesktop extends ZirconContextMenuFactory {
  constructor(appUI: ZirconApplication) {
    super(appUI);
  }

  private getAssociatedZirconDesktop(element: Element): ZirconDesktop {
    if (!element) return null;
    if (!(element instanceof HTMLElement)) return null;
    const htmlElement: HTMLElement = element;
    const zirconObjectId = htmlElement.getAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
    );
    if (!zirconObjectId) return null;
    const obj: ZirconDesktop = null;
    console.error('not implemented');

    if (!obj) return;
    return obj;
  }

  public handledThisElement(element: Element): boolean {
    return this.getAssociatedZirconDesktop(element) !== null;
  }

  public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
    const desktop: ZirconDesktop = this.getAssociatedZirconDesktop(element);
    return [
      {
        label: `Desktop ${desktop.getName()}`,
        children: [],
      },
    ];
  }

  // /**
  //  * callbacks
  //  * @param args
  //  */
  // private onWINDOW_SET_PARENT_DESKTOP_REQUEST(
  //   windowId: string,
  //   desktopTargetId: string,
  //   _: { x: number; y: number },
  // ): void {
  //   const window: ZirconWindow = this.getWindowById(windowId);
  //   const desktop: ZirconDesktop = this.getDesktopById(desktopTargetId);
  //   // TODO: Throw event
  //   if (!window) {
  //     this.emit('WINDOW_SET_PARENT_DESKTOP_ERROR', {
  //       windowId: windowId,
  //       desktopTargetId: desktopTargetId,
  //       error: `window::plugInto Cannot find window ${windowId}`,
  //     });
  //     return;
  //   }
  //   if (!desktop) {
  //     this.emit('WINDOW_SET_PARENT_DESKTOP_ERROR', {
  //       windowId: windowId,
  //       desktopTargetId: desktopTargetId,
  //       error: `window::plugInto Cannot find desktop ${desktopTargetId}`,
  //     });
  //     return;
  //   }
  //   // TODO: Throw event
  //   desktop.addWindow(window);
  // }
}

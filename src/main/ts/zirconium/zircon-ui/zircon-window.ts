import 'jspanel4/dist/jspanel.min.css';
import {
  ZIRCON_TARGET_DESKTOP_ID,
  ZirconApplication,
} from '../zircon-core/zircon-app';
import { ZirconObject, ZirconObjectState } from '../zircon-object';
import {
  ZirconAppObjectEventRegistry,
  ZirconAppObject,
} from '../zircon-core/zircon-app-object';
import menuIcon from './hamburger-icon.svg';
import { jsPanel, IJSPanelInstance, IJSPanelData } from 'jspanel4';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconContextMenuItem } from '../zircon-menu/zircon-context-menu';
import { ZirconViz } from './zircon-viz-ui';
import { ZirconDesktop } from './zircon-desktop';
import { ZirconHelper } from '../zircon-helper';

export const ZIRCON_WINDOW_TYPE: string = 'zircon-window';

export type ZirconWindowEvents = {
  WINDOW_SET_PARENT_DESKTOP_DONE: {
    windowId: string;
    desktopTargetId: string;
  };
  WINDOW_SET_PARENT_DESKTOP_ERROR: {
    windowId: string;
    desktopTargetId: string;
    error: string;
  };
  WINDOW_SET_PARENT_DESKTOP_REQUEST: {
    windowId: string;
    desktopTargetId: string;
    position: { x: number; y: number };
  };
  WINDOW_RESIZED: { windowId: string };
  WINDOW_DISPLAYED: { windowId: string };
  WINDOW_NORMALIZE_REQUEST: { windowId: string };
  WINDOW_MINIMIZE_REQUEST: { windowId: string };
  WINDOW_MAXIMIZE_REQUEST: { windowId: string };
  WINDOW_CLOSE_REQUEST: { windowId: string };
  WINDOW_NORMALIZED: { windowId: string };
  WINDOW_MINIMIZED: { windowId: string };
  WINDOW_MAXIMIZED: { windowId: string };
  WINDOW_CLOSED: { windowId: string };
  WINDOW_TITLE_CHANGED: { windowId: string; title: string };
  WINDOW_POSITION_CHANGED: { windowId: string; x: number; y: number };
  WINDOW_DIMENSION_CHANGED: { windowId: string; width: number; height: number };
  WINDOW_VISUALIZER_CHANGED: { windowId: string; vizId: string };
};

export type ZirconWindowEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconWindowEvents,
          | 'WINDOW_SET_PARENT_DESKTOP_DONE'
          | 'WINDOW_SET_PARENT_DESKTOP_ERROR'
          | 'WINDOW_NORMALIZE_REQUEST'
          | 'WINDOW_MINIMIZE_REQUEST'
          | 'WINDOW_MAXIMIZE_REQUEST'
          | 'WINDOW_CLOSE_REQUEST'
        >,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconWindowEvents,
          | 'WINDOW_RESIZED'
          | 'WINDOW_DISPLAYED'
          | 'WINDOW_SET_PARENT_DESKTOP_REQUEST'
          | 'WINDOW_NORMALIZED'
          | 'WINDOW_MINIMIZED'
          | 'WINDOW_MAXIMIZED'
          | 'WINDOW_CLOSED'
          | 'WINDOW_TITLE_CHANGED'
          | 'WINDOW_DIMENSION_CHANGED'
          | 'WINDOW_POSITION_CHANGED'
          | 'WINDOW_VISUALIZER_CHANGED'
        >,
      ]
    >;
  },
  ZirconAppObjectEventRegistry
>;

export interface ZirconWindowState extends ZirconObjectState {
  type: typeof ZIRCON_WINDOW_TYPE;
  title?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  vizId?: string;
}

export const DEFAULT_WINDOW_STATE: ZirconWindowState = {
  type: ZIRCON_WINDOW_TYPE,
  title: 'unnamed',
  left: 0,
  top: 0,
  width: 500,
  height: 500,
};

/**
 * A Zircon Frame is a floating window which can be docked in a Zircon Desktop
 */
export class ZirconWindow<
  R extends ZirconWindowEventRegistry = ZirconWindowEventRegistry,
> extends ZirconAppObject<R> {
  private __parentDesktop: ZirconDesktop = null;
  private __panel: IJSPanelInstance = null;
  private _title: string = 'untitled';
  private _left: number = 0;
  private _top: number = 0;
  private _width: number = 500;
  private _height: number = 500;
  private _vizId: string = null;
  // private __parentDesktop: ZirconDesktop = null;
  private __dragSource: HTMLElement = null; // parent element when drag is initialized
  private __dragPosition: { x: number; y: number } = null; // window position when drag is initialized
  private __viz: ZirconViz = null;

  constructor(app: ZirconApplication, state?: ZirconWindowState) {
    super(app, state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('WINDOW_NORMALIZE_REQUEST', (arg) =>
      this.onWINDOW_NORMALIZE_REQUEST(arg.windowId),
    );
    this.addListener('WINDOW_MINIMIZE_REQUEST', (arg) =>
      this.onWINDOW_MINIMIZE_REQUEST(arg.windowId),
    );
    this.addListener('WINDOW_MAXIMIZE_REQUEST', (arg) =>
      this.onWINDOW_MAXIMIZE_REQUEST(arg.windowId),
    );
    this.addListener('WINDOW_CLOSE_REQUEST', (arg) =>
      this.onWINDOW_CLOSE_REQUEST(arg.windowId),
    );
  }

  private onWINDOW_NORMALIZE_REQUEST(windowId: string): void {
    if (this.getId() === windowId) this.__panel?.normalize();
  }

  private onWINDOW_MAXIMIZE_REQUEST(windowId: string): void {
    if (this.getId() === windowId) this.__panel?.maximize();
  }

  private onWINDOW_MINIMIZE_REQUEST(windowId: string): void {
    if (this.getId() === windowId) this.__panel?.minimize();
  }

  private onWINDOW_CLOSE_REQUEST(windowId: string): void {
    if (this.getId() === windowId) this.__panel?.close();
  }

  public override getType(): string {
    return ZIRCON_WINDOW_TYPE;
  }

  public override async setState(state: ZirconWindowState): Promise<void> {
    if (!state) return;
    await super.setState(state);
    this.setTitle(state.title);
    this.setPosition(state.left, state.top);
    this.setDimension(state.width, state.height);
    this.setVisualizerId(state.vizId);
  }

  /**
   * Get the state of this window Object
   * @returns The state of the window
   */
  public override generateCurrentState(): ZirconWindowState {
    return {
      ...super.generateCurrentState(),
      title: this._title,
      left: this.__panel?.getBoundingClientRect().left,
      top: this.__panel?.getBoundingClientRect().top,
      width: this.__panel?.offsetWidth,
      height: this.__panel?.offsetHeight,
      vizId: this._vizId,
      type: ZIRCON_WINDOW_TYPE,
    };
  }

  public getParentDesktop(): ZirconDesktop {
    return this.__parentDesktop;
  }

  public setParentDesktop(parentDesktop: ZirconDesktop): void {
    this.__parentDesktop = parentDesktop;
  }

  private createPanel(): IJSPanelInstance {
    if (this.__panel) return this.__panel;
    // this.__panel is set in callback() method which is called when creation
    // is fully terminated and the panel is in the DOM.
    jsPanel.create({
      panelClass: 'zircon',
      container: document.body,
      headerTitle: this._title,
      headerLogo: `<img src="${menuIcon}" />`,
      position: {
        my: 'left-top',
        at: 'left-top',
        offsetX: this._left,
        offsetY: this._top,
        minLeft: 0,
        minTop: 0,
      },
      panelSize: `${this._width}px ${this._height}px`,
      //   iconfont: [
      //     'custom-smallify',
      //     'custom-minimize',
      //     'custom-normalize',
      //     'custom-maximize',
      //     'custom-close',
      //   ],
      boxShadow: 3,
      resizeit: {
        stop: (_position: IJSPanelInstance) => {
          this.emit('WINDOW_RESIZED', {
            windowId: this.getId(),
          });
        },
      },
      dragit: {
        start: (panel: IJSPanelInstance) => {
          // move panel to body in order to handle DOM modifications (switch desktops)
          this.getApplication()
            .getDesktopManager()
            .temporaryMoveWindowPanelToDesktopManager(this);

          panel.style.pointerEvents = 'none';
          panel.classList.add('drag');
          this.__dragSource = panel.parentElement;
          this.__dragPosition = { x: panel.offsetLeft, y: panel.offsetTop };
        },
        drag: (
          panel: IJSPanelInstance,
          _paneldata: IJSPanelData,
          _event: Event,
        ) => {
          // avoid dragging out of parent (top and left)
          panel.reposition({
            at: 'left-top',
            my: 'left-top',
            offsetX: Math.max(panel.offsetLeft, 0),
            offsetY: Math.max(panel.offsetTop, 0),
          });
          panel.style.opacity = '0.5';
        },
        stop: (
          panel: IJSPanelInstance,
          _paneldata: IJSPanelData,
          event: PointerEvent,
        ) => {
          // move panel to body in order to handle DOM modifications (switch desktops)
          this.getApplication()
            .getDesktopManager()
            .temporaryUnmoveWindowPanelFromDesktopManager(this);
          if (!event || !event.target) return;
          let targetDesktopId: string = null;
          // look for targetDekstopId in parents
          let el: HTMLElement = event.target as HTMLElement;
          while (!targetDesktopId && el) {
            targetDesktopId = el.getAttribute(ZIRCON_TARGET_DESKTOP_ID);
            if (el) el = el.parentElement;
          }

          if (!targetDesktopId) {
            alert('Cannot drop window at this location');
            return;
          }
          panel.style.pointerEvents = 'auto';
          panel.classList.remove('drag');

          ZirconHelper.moveWindowToDesktop(
            this.getApplication(),
            this.getId(),
            targetDesktopId,
          );
        },
        // drop: {
        //   dropZones: [`.${ZIRCON_DROPPABLE_CLASS}`],
        //   callback: (panel: unknown, target: HTMLElement, source: HTMLElement) => {
        //     if (!target) return;
        //     const targetDesktopId: string = target.getAttribute(
        //       ZIRCON_TARGET_DESKTOP_ID,
        //     );
        //     if (!targetDesktopId) alert('Cannot drop window on ' + target.id);
        //     console.log('parent element');
        //     console.log(panel.parentElement);
        //     console.log('drag parent element');
        //     console.log(this.__dragSource);
        //     this.__dragSource.appendChild(this.getContainer());
        //     panel.reposition(this.__dragPosition);
        //     this.emit(ZirconEvent.WINDOW_MOVETO_DESKTOP_REQUEST, {
        //       windowId: this.getId(),
        //       desktopTargetId: targetDesktopId,
        //     });
        //     console.log('panel');
        //     console.log(panel);
        //     console.log('target');
        //     console.log(target);
        //     console.log('source');
        //     console.log(source);
        //   },
        // },
      },
      onminimized: () =>
        this.emit('WINDOW_MINIMIZED', { windowId: this.getId() }),
      onmaximized: () =>
        this.emit('WINDOW_MAXIMIZED', { windowId: this.getId() }),
      onnormalized: () =>
        this.emit('WINDOW_NORMALIZED', { windowId: this.getId() }),
      onclosed: () => this.emit('WINDOW_CLOSED', { windowId: this.getId() }),

      callback: (panel: IJSPanelInstance) => {
        this.__panel = panel;
        this.displayVisualizer();
        this.emit('WINDOW_DISPLAYED', { windowId: this.getId() });
      },
      theme: 'primary',
    });
    this.__panel.header.addEventListener('click', () => {
      this.displayParameters();
    });
    this.__panel.setAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
      this.getId(),
    );
    return this.__panel;
  }

  public displayParameters(): boolean {
    alert('Window::displayParameters() Not yet implemented');
    return false;
  }

  public getVisualizer(): Promise<ZirconViz> {
    if (this.__viz && this.__viz.getId() === this._vizId)
      return Promise.resolve(this.__viz);
    return this.getApplication()
      .getInstance(this._vizId)
      .then((instance) => {
        if (!instance || !(instance instanceof ZirconViz))
          throw new Error(
            `Unable to retrieve Visualizer Id ${this._vizId} in window ${this.getId()}`,
          );
        this.__viz = instance;
        return this.__viz;
      });
  }

  private displayVisualizer(): void {
    if (!this.__panel) return;
    this.getVisualizer()
      .then((viz: ZirconViz) => {
        if (viz) {
          viz.displayIn(this);
        }
      })
      .catch((error) => {
        this.__panel.content.innerHTML = `<p>${error.toString()}</p>`;
        this.__panel.content.style.background = `red`;
      });
  }

  public getContainer(): HTMLElement {
    if (this.__panel) return this.__panel;
    this.createPanel();
    return this.__panel;
  }

  public getWindowContent(): HTMLDivElement {
    if (this.__panel) return this.__panel.content;
    this.createPanel();
    return this.__panel.content;
  }
  /**
   *
   * @param x window position X
   * @param y window position Y
   * @fires WINDOW_POSITION_CHANGED
   * @returns
   */
  public setPosition(x: number, y: number): boolean {
    if (this._left === x && this._top === y) return false;
    this._left = x;
    this._top = y;
    // change graphic position if window is displayed
    if (this.__panel)
      this.__panel.reposition({
        at: 'left-top',
        my: 'left-top',
        offsetX: x,
        offsetY: y,
      });

    this.emit('WINDOW_POSITION_CHANGED', {
      windowId: this.getId(),
      x: this._left,
      y: this._top,
    });
    return true;
  }

  public setVisualizerId(vizId: string): boolean {
    if (this._vizId === vizId) return false;
    this._vizId = vizId;
    if (this.__panel && this.__panel.closest('body') !== null) {
      if (this.__viz?.getId() === vizId) return false;
      this.getApplication()
        .getInstance(vizId)
        .then((instance) => {
          if (!instance) return false;
          if (!(instance instanceof ZirconViz)) {
            throw new Error(`Object with id ${vizId} is not a visualizer`);
          }
          this.displayVisualizer();
        });
    }
    this.emit('WINDOW_VISUALIZER_CHANGED', {
      windowId: this.getId(),
      vizId: this._vizId,
    });
    return true;
  }

  /**
   *
   * @param width window size
   * @param height window size
   * @fires WINDOW_DIMENSION_CHANGED
   * @returns
   */
  public setDimension(width: number, height: number): boolean {
    if (this._width === width && this._height === height) return false;
    this._width = width;
    this._height = height;
    if (this.__panel) this.__panel.resize({ width: width, height: height });
    this.emit('WINDOW_DIMENSION_CHANGED', {
      windowId: this.getId(),
      width: this._width,
      height: this._height,
    });
    return true;
  }

  /**
   *
   * @param title
   * @fires WINDOW_TITLE_CHANGED
   * @returns
   */
  public setTitle(title: string): boolean {
    if (this._title === title) return false;
    this._title = title;
    if (this.__panel) this.__panel.title = this._title;
    this.emit('WINDOW_TITLE_CHANGED', {
      windowId: this.getId(),
      title: this._title,
    });
    return true;
  }
}

/**
 * Context Menu for Window
 */
export class ZirconContextMenuFactoryWindow extends ZirconContextMenuFactory {
  constructor(app: ZirconApplication) {
    super(app);
  }

  private getAssociatedZirconWindow(element: Element): ZirconWindow {
    if (!element) return null;
    if (!(element instanceof HTMLElement)) return null;
    const htmlElement: HTMLElement = element;
    const zirconObjectId = htmlElement.getAttribute(
      ZirconObject.ZIRCON_OBJECT_ATTRIBUTE_ID,
    );
    if (!zirconObjectId) return null;
    const obj: ZirconWindow =
      this.getApplication().getExistingWindow(zirconObjectId);
    if (!obj) return;
    return obj;
  }

  public handledThisElement(element: Element): boolean {
    return this.getAssociatedZirconWindow(element) !== null;
  }

  public getContextMenuElements(element: Element): ZirconContextMenuItem[] {
    const window: ZirconWindow = this.getAssociatedZirconWindow(element);
    if (!window) return null;
    return [
      {
        label: 'window',
        children: [
          {
            label: 'normalize',
            action: () => {
              window.emit('WINDOW_NORMALIZE_REQUEST', {
                windowId: window.getId(),
              });
            },
          },
          {
            label: 'minimize',
            action: () => {
              window.emit('WINDOW_MINIMIZE_REQUEST', {
                windowId: window.getId(),
              });
            },
          },
          {
            label: 'maximize',
            action: () => {
              window.emit('WINDOW_MAXIMIZE_REQUEST', {
                windowId: window.getId(),
              });
            },
          },
          {
            label: 'close',
            action: () => {
              window.emit('WINDOW_CLOSE_REQUEST', { windowId: window.getId() });
            },
          },
        ],
      },
    ];
  }
}

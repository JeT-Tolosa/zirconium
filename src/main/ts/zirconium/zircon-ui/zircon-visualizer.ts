import {
  ZirconObject,
  ZirconObjectState,
  ZirconObjectEventRegistry,
} from '../zircon-object';
import { MergeZirconRegistries, PickEvents } from '../zircon-event';
import { ZirconVizWindow } from './zircon-viz-window';

/**
 * Base state for all zircon objects UI
 */
export type ZirconVizState = ZirconObjectState;
export const DEFAULT_ZIRCON_VIZ_STATE: ZirconVizState = {};

export type ZirconVizEvents = {
  VISUALIZER_DISPLAY_REQUEST: { vizId: string };
  VISUALIZER_DISPLAYED: { vizId: string; timestamp: number };
  VISUALIZER_REMOVED_FROM_WINDOW: { windowId: string; vizId: string };
};

export type ZirconVizEventRegistry = MergeZirconRegistries<
  {
    incoming: PickEvents<ZirconVizEvents, 'VISUALIZER_DISPLAY_REQUEST'>;
    outgoing: PickEvents<
      ZirconVizEvents,
      'VISUALIZER_DISPLAYED' | 'VISUALIZER_REMOVED_FROM_WINDOW'
    >;
  },
  ZirconObjectEventRegistry
>;

/**
 * A Zircon Object is the base class of all managed zircon components.
 * They are subdivided in two main categories:
 * - UI objects: ZirconWindow, ZirconDesktop, ZirconDesktopManager
 * - Core objects: Database managers ...
 */
export abstract class ZirconViz<
  R extends ZirconVizEventRegistry = ZirconVizEventRegistry,
> extends ZirconObject<R> {
  private __parentWindow: ZirconVizWindow = null;
  /**
   * constructor
   * @param appUI the application this object belongs to
   */
  constructor(state?: ZirconVizState) {
    super(state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('VISUALIZER_DISPLAY_REQUEST', (arg) => {
      this.onVISUALIZER_REFRESH_REQUEST(arg.vizId);
    });
  }

  private onVISUALIZER_REFRESH_REQUEST(vizId: string): void {
    if (this.getId() !== vizId) return;
    if (this.refreshDisplay()) {
      this.emit('VISUALIZER_DISPLAYED', {
        vizId: vizId,
        timestamp: Date.now(),
      });
    }
  }

  public refreshDisplay(): boolean {
    // do nothing by default
    return true;
  }

  public updateResize() {
    // do nothing by default
  }

  public abstract getMainDiv(): HTMLDivElement;

  /**
   * Action performed when displayIn method is called
   */
  public onDisplay(): void {}

  /**
   * @returns   true if chart was created and docked, false otherwise
   */
  public displayIn(parentWindow: ZirconVizWindow): boolean {
    if (this.__parentWindow === parentWindow) return false;
    if (this.__parentWindow) {
      this.removeFromParent();
    }
    this.__parentWindow = parentWindow;
    if (!this.__parentWindow?.getWindowContent()) return false;
    this.__parentWindow?.getWindowContent().appendChild(this.getMainDiv());
    this.onDisplay();
    return true;
  }

  /**
   * Remove visualizer from Parent (Visualizer not stopped)
   * @returns
   */
  public removeFromParent(): boolean {
    if (!this.__parentWindow) return false;
    this.__parentWindow.getWindowContent()?.removeChild(this.getMainDiv());
    const windowState = this.__parentWindow.generateCurrentState();
    windowState.vizId = null;
    this.emit('VISUALIZER_REMOVED_FROM_WINDOW', {
      windowId: this.__parentWindow.getId(),
      vizId: this.__parentWindow.getVisualizerId(),
    });
    this.__parentWindow = null;
  }

  /**
   * get Parent Window if
   * @returns
   */
  public getParentWindow(): ZirconVizWindow {
    return this.__parentWindow;
  }

  /**
   * Get the state of this UI Object
   * @returns The state of the window
   */
  public override generateCurrentState(): ZirconVizState {
    return {
      ...super.generateCurrentState(),
    };
  }
}

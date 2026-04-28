import {
  ZirconObject,
  ZirconObjectState,
  ZirconObjectEventRegistry,
} from '../zircon-object';
import { MergeZirconRegistries, PickEvents } from '../zircon-event';
import { ZirconWindow } from './zircon-window';

/**
 * Base state for all zircon objects UI
 */
export type ZirconVizState = ZirconObjectState;
export const DEFAULT_ZIRCON_VIZ_STATE: ZirconVizState = {};

export type ZirconVizEvents = {
  VISUALIZER_DISPLAY_REQUEST: { vizId: string };
  VISUALIZER_DISPLAYED: { vizId: string; timestamp: number };
};

export type ZirconVizEventRegistry = MergeZirconRegistries<
  {
    incoming: PickEvents<ZirconVizEvents, 'VISUALIZER_DISPLAY_REQUEST'>;
    outgoing: PickEvents<ZirconVizEvents, 'VISUALIZER_DISPLAYED'>;
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
  private __parentWindow: ZirconWindow = null;
  /**
   * constructor
   * @param appUI the application this object belongs to
   */
  constructor(state?: ZirconVizState) {
    super(state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
    this.getEventDispatcher().addListener(
      'VISUALIZER_REFRESH_REQUEST',
      (arg) => {
        this.onVISUALIZER_REFRESH_REQUEST(arg.vizId);
      },
    );
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
  public displayIn(parentWindow: ZirconWindow): boolean {
    if (this.__parentWindow === parentWindow) return false;
    if (this.__parentWindow) {
      this.__parentWindow.getWindowContent()?.removeChild(this.getMainDiv());
    }
    this.__parentWindow = parentWindow;
    if (!parent) return false;
    if (!this.__parentWindow?.getWindowContent()) return false;
    this.__parentWindow?.getWindowContent().appendChild(this.getMainDiv());
    this.onDisplay();
    return true;
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

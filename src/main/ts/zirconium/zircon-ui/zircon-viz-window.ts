import 'jspanel4/dist/jspanel.min.css';
import { ZirconApplication } from '../zircon-core/zircon-app';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import { ZirconViz } from './zircon-visualizer';
import {
  ZIRCON_PARAMETERS_WINDOW_TYPE,
  ZirconParamWindow,
} from '../zircon-params/zircon-param-window';
import {
  ZirconWindow,
  ZirconWindowEventRegistry,
  ZirconWindowState,
} from './zircon-window';
import { IJSPanelInstance } from 'jspanel4';

export const ZIRCON_VISUALIZER_WINDOW_TYPE: string = 'zircon-viz-window';

export type ZirconVizWindowEvents = {
  WINDOW_VISUALIZER_CHANGED: { windowId: string; vizId: string };
};

export type ZirconVizWindowEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<[]>;
    outgoing: MergePickEvents<
      [PickEvents<ZirconVizWindowEvents, 'WINDOW_VISUALIZER_CHANGED'>]
    >;
  },
  ZirconWindowEventRegistry
>;

export interface ZirconVizWindowState extends ZirconWindowState {
  type: typeof ZIRCON_VISUALIZER_WINDOW_TYPE;
  vizId?: string;
}

export const DEFAULT_VISUALIZER_WINDOW_STATE: ZirconVizWindowState = {
  type: ZIRCON_VISUALIZER_WINDOW_TYPE,
  title: 'unnamed',
  left: 0,
  top: 0,
  width: 500,
  height: 500,
};

/**
 * A Zircon Frame is a floating window which can be docked in a Zircon Desktop
 */
export class ZirconVizWindow<
  R extends ZirconVizWindowEventRegistry = ZirconVizWindowEventRegistry,
> extends ZirconWindow<R> {
  private __viz: ZirconViz = null;
  private _vizId: string = null;

  constructor(app: ZirconApplication, state?: ZirconVizWindowState) {
    super(app, state);
  }

  protected override listenToEvents(): void {
    super.listenToEvents();
  }

  public override getType(): string {
    return ZIRCON_VISUALIZER_WINDOW_TYPE;
  }

  public override async setState(state: ZirconWindowState): Promise<void> {
    if (!state) return;
    await super.setState(state);
    this.setVisualizerId(state.vizId);
  }

  private setVisualizerId(_vizId: string): boolean {
    if (this._vizId === _vizId) return false;
    this._vizId = _vizId;
    // TODO: change visusalizer's display if window is displayed...
    return true;
  }
  /**
   * Get the state of this window Object
   * @returns The state of the window
   */
  public override generateCurrentState(): ZirconWindowState {
    return {
      ...super.generateCurrentState(),
      vizId: this._vizId,
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    };
  }

  public displayParameters(): boolean {
    const paramWindowState = {
      type: ZIRCON_PARAMETERS_WINDOW_TYPE,
      name: `${this.getName()}-param`,
      left: this.getLeft() + 20,
      top: this.getTop() + 20,
      width: this.getWidth(),
      height: this.getHeight(),
    };
    const paramWindow = new ZirconParamWindow(
      this.getApplication(),
      this,
      paramWindowState,
    );
    this.getParentDesktop().displayParamWindow(paramWindow);
    return false;
  }

  protected override onPanelCreated(panel: IJSPanelInstance): void {
    if (!panel) throw new Error('Panel should have been created');
    this.displayVisualizer();
    panel?.header?.addEventListener('click', () => {
      this.displayParameters();
    });
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
    if (!this.getWindowContent()) return;
    this.getVisualizer()
      .then((viz: ZirconViz) => {
        if (viz) {
          viz.displayIn(this);
        }
      })
      .catch((error) => {
        this.getWindowContent().innerHTML = `<p>${error.toString()}</p>`;
        this.getWindowContent().style.background = `red`;
      });
  }
}

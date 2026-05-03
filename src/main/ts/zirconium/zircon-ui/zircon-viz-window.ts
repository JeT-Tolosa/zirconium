import 'jspanel4/dist/jspanel.min.css';
import 'jsoneditor/dist/jsoneditor.css';
import { ZirconApplication } from '../zircon-core/zircon-app';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../zircon-event';
import { ZirconViz, ZirconVizEvents } from './zircon-visualizer';
import {
  ZirconParamWindow,
  ZirconParamWindowState,
} from '../zircon-params/zircon-param-window';
import {
  ZirconWindow,
  ZirconWindowEventRegistry,
  ZirconWindowState,
} from './zircon-window';
import { IJSPanelInstance } from 'jspanel4';
import JSONEditor, { JSONEditorOptions } from 'jsoneditor';
import {
  ZIRCON_PARAMETER_WINDOW_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../zircon-core/zircon-types';

export const ZIRCON_VISUALIZER_WINDOW_CLASS: string = 'zircon-viz';

export type ZirconVizWindowEvents = {
  WINDOW_VISUALIZER_CHANGED: { windowId: string; vizId: string };
};

export type ZirconVizWindowEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [PickEvents<ZirconVizEvents, 'VISUALIZER_REMOVED_FROM_WINDOW'>]
    >;
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
  vizId: null,
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
    this.addListener('VISUALIZER_REMOVED_FROM_WINDOW', (arg) =>
      this.onVISUALIZER_REMOVED_FROM_WINDOW(arg.windowId, arg.vizId),
    );
  }

  private onVISUALIZER_REMOVED_FROM_WINDOW(
    windowId: string,
    vizId: string,
  ): void {
    if (this.getId() === windowId) {
      if (this._vizId !== vizId) {
        console.warn(
          `Incoherence vizId ${vizId} cannot be removed from window ${windowId}. Current vizId is ${this._vizId}`,
        );
        return;
      }
      this.removeVisualizer();
    }
  }

  public override getType(): string {
    return ZIRCON_VISUALIZER_WINDOW_TYPE;
  }

  protected override async setState(
    state: ZirconVizWindowState,
  ): Promise<void> {
    if (!state) return;
    await super.setState(state);
    this.setVisualizerId(state.vizId);
  }

  private setVisualizerId(_vizId: string): boolean {
    if (this._vizId === _vizId) return false;
    this._vizId = _vizId;
    if (this.__viz) {
      // this.__viz.stop();  // TODO implement stop in visualizers
      this.__viz = null;
      this.displayVisualizer();
    }
    // TODO: change visusalizer's display if window is displayed...
    return true;
  }

  public getVisualizerId(): string {
    return this._vizId;
  }

  /**
   * Get the state of this window Object
   * @returns The state of the window
   */
  public override generateCurrentState(): ZirconVizWindowState {
    return {
      ...super.generateCurrentState(),
      vizId: this._vizId,
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    };
  }

  public displayParameterWindow(): boolean {
    const paramWindowState: ZirconParamWindowState = {
      type: ZIRCON_PARAMETER_WINDOW_TYPE,
      name: `${this.getName()}-param`,
      title: `${this.getName()} Parameters`,
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
    if (!panel)
      throw new Error(
        `panel should not be null in Visualizer window Creation ID: ${this.getId()}`,
      );
    panel.classList.add(ZIRCON_VISUALIZER_WINDOW_CLASS);

    this.displayVisualizer();
    panel?.headerlogo?.addEventListener('click', () => {
      this.displayParameterWindow();
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

  private removeVisualizer(): void {
    this.getWindowContent().innerHTML = '';
    this._vizId = null;
    this.__viz = null;
  }

  private displayVisualizer(): void {
    if (!this.getWindowContent()) return;
    this.getWindowContent().innerHTML = '';
    if (!this._vizId) {
      this.getWindowContent().innerHTML = `<p>No Visualizer defined (vizId = null)</p>`;
      this.getWindowContent().style.background = `orange`;
      return;
    }
    this.getVisualizer()
      .then((viz: ZirconViz) => {
        if (viz) {
          viz.displayIn(this);
          this.__viz = viz;
        }
      })
      .catch((error) => {
        this.getWindowContent().innerHTML = `<p>${error.toString()}</p>`;
        this.getWindowContent().style.background = `red`;
      });
  }

  public override displayParameters(container: HTMLElement) {
    if (!container)
      throw new Error(
        `displaying parameters should not be called with an invalid container in window Id ${this.getId()}`,
      );
    super.displayParameters(container);
    let h2: HTMLHeadingElement = document.createElement('h2');
    h2.innerText = `Window ${this.getId()}`;
    container.appendChild(h2);

    const options: JSONEditorOptions = {
      mode: 'form',
      modes: ['tree', 'view', 'form', 'code', 'text', 'preview'],
      onChange: () => {
        this.setState(editor.get());
      },
    };
    const editor = new JSONEditor(container, options);
    editor.set(this.generateCurrentState());

    h2 = document.createElement('h2');
    h2.innerText = this.__viz
      ? `Visualizer ${this.__viz.getId()} [${this.__viz.getType()}]`
      : `No Visualizer Id ${this._vizId}`;

    container.appendChild(h2);
    if (this.__viz) {
      const editor = new JSONEditor(container, options);
      editor.set(this.__viz.generateCurrentState());
    }
  }
}

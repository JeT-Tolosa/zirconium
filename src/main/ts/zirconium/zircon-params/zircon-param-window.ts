import { MergeZirconRegistries } from '../zircon-event';
import { ZirconApplication } from '../zircon-core/zircon-app';
import {
  ZirconWindow,
  ZirconWindowEventRegistry,
  ZirconWindowState,
} from '../zircon-ui/zircon-window';
import { IJSPanelInstance } from 'jspanel4';

export const ZIRCON_PARAMETERS_WINDOW_TYPE = 'zircon-window-parameters';

// export interface ZirconParamWindowState extends ZirconWindowState {}

export type ZirconParamWindowEvents = {};

export type ZirconParamWindowEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: {};
  },
  ZirconWindowEventRegistry
>;

export class ZirconParamWindow<
  R extends ZirconWindowEventRegistry = ZirconWindowEventRegistry,
> extends ZirconWindow<R> {
  // TODO: uncomment next line
  //   public static readonly ZIRCON_WINDOW_PARAMETERS_TYPE =
  //     ZIRCON_WINDOW_PARAMETERS_TYPE;
  public _window: ZirconWindow = null;

  constructor(
    app: ZirconApplication,
    window: ZirconWindow,
    state?: ZirconWindowState,
  ) {
    super(app, state);
    this._window = window;
  }

  public setWindow(window: ZirconWindow): void {
    this._window = window;
  }

  public override getType(): string {
    return ZIRCON_PARAMETERS_WINDOW_TYPE;
  }

  protected override onPanelCreated(panel: IJSPanelInstance): void {
    if (!panel)
      throw new Error(
        `panel should not be null in Param window Creation ID: ${this.getId()}`,
      );
    const container: HTMLElement = super.getContainer();
    container.classList.add(ZIRCON_PARAMETERS_WINDOW_TYPE);
    // container.setAttribute( ZirconParamWindow.ZIRCON_WINDOW_PARAMETERS_TYPE);
    super.getWindowContent().innerHTML = '<p>Parameters</p>';
    super.getWindowContent().style.backgroundColor = 'green';
  }
}

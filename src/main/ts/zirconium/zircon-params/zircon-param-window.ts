import { MergeZirconRegistries } from '../zircon-event';
import { ZirconApplication } from '../zircon-core/zircon-app';
import {
  ZirconWindow,
  ZirconWindowEventRegistry,
  ZirconWindowState,
} from '../zircon-ui/zircon-window';
import { IJSPanelInstance } from 'jspanel4';
import { ZIRCON_PARAMETER_WINDOW_TYPE } from '../zircon-core/zircon-types';

export const ZIRCON_PARAMETER_WINDOW_CLASS = 'zircon-param';

export interface ZirconParamWindowState extends ZirconWindowState {}

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
    return ZIRCON_PARAMETER_WINDOW_TYPE;
  }

  protected override onPanelCreated(panel: IJSPanelInstance): void {
    if (!panel)
      throw new Error(
        `panel should not be null in Param window Creation ID: ${this.getId()}`,
      );
    panel.classList.add(ZIRCON_PARAMETER_WINDOW_CLASS);
    this._window?.displayParameters(panel.content);
  }
}

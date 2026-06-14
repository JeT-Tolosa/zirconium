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
  public _window: ZirconWindow = null;
  public __windowPanel: IJSPanelInstance = null;

  constructor(app: ZirconApplication, state?: ZirconWindowState) {
    super(app, state);
  }

  public setWindow(window: ZirconWindow): void {
    // TODO remove previous display if necessary
    this._window = window;
    if (this.__windowPanel) {
      this._window.displayParameters(this.__windowPanel.content);
    }
  }

  public override getType(): string {
    return ZIRCON_PARAMETER_WINDOW_TYPE;
  }

  protected override async onPanelCreated(
    panel: IJSPanelInstance,
  ): Promise<void> {
    if (!panel) {
      throw new Error(
        `panel should not be null in Param window Creation ID: ${this.getId()}`,
      );
    }
    panel.classList.add(ZIRCON_PARAMETER_WINDOW_CLASS);
    this.__windowPanel = panel;
    this._window?.displayParameters(panel.content);
  }
}

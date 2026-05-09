import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObjectFactory } from '../zircon-core/zircon-object-factory';
import {
  ZIRCON_APP_OBJECT_TYPE,
  ZIRCON_PARAMETER_WINDOW_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
  ZIRCON_WINDOW_TYPE,
} from '../zircon-core/zircon-types';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconContextMenuFactoryVizWindow } from '../zircon-menu/zircon-viz-window-context-menu';
import { ZirconContextMenuFactoryWindow } from '../zircon-menu/zircon-window-context-menu';
import {
  ZirconParamWindow,
  ZirconParamWindowState,
} from '../zircon-params/zircon-param-window';
import { ZirconVizWindow } from './zircon-viz-window';
import { ZirconWindow, ZirconWindowState } from './zircon-window';

export class ZirconWindowFactory implements ZirconObjectFactory {
  private readonly _app: ZirconApplication;

  public name = `zircon-window-factory`;
  public type = ZIRCON_WINDOW_TYPE;
  public ancestorType: string = ZIRCON_APP_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(app: ZirconApplication) {
    if (!app)
      throw new Error(`ZirconWindowFactory application in constructor is null`);
    if (!app)
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    this._app = app;
    this.contextMenuFactory = new ZirconContextMenuFactoryWindow(this._app);
  }

  protected getApplication(): ZirconApplication {
    return this._app;
  }

  // nullable create() enables runtime capability checks
  create: ((state: ZirconWindowState) => Promise<ZirconWindow>) | null = null;
}

export class ZirconVizWindowFactory extends ZirconWindowFactory {
  public override name = `zircon-visualizer-window-factory`;
  public override type = ZIRCON_VISUALIZER_WINDOW_TYPE;
  public override ancestorType: string = ZIRCON_WINDOW_TYPE;
  public override contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(app: ZirconApplication) {
    super(app);
    this.contextMenuFactory = new ZirconContextMenuFactoryVizWindow(app);
  }

  public override create = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    state: any,
  ): Promise<ZirconVizWindow> => {
    return new ZirconVizWindow(this.getApplication(), state);
  };
}

export class ZirconParamWindowFactory extends ZirconWindowFactory {
  public override name = `zircon-parameters-window-factory`;
  public override type = ZIRCON_PARAMETER_WINDOW_TYPE;
  public override ancestorType: string = ZIRCON_WINDOW_TYPE;
  public override contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(app: ZirconApplication) {
    super(app);
    this.contextMenuFactory = null; // no context menu for param window
  }

  public override create = async (
    state: ZirconParamWindowState,
  ): Promise<ZirconParamWindow> => {
    return new ZirconParamWindow(this.getApplication(), state);
  };
}

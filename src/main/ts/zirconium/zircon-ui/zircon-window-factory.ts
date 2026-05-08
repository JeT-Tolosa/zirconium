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
import { ZirconVizWindow, ZirconVizWindowState } from './zircon-viz-window';

export class ZirconWindowFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-window-factory`;
  public type = ZIRCON_WINDOW_TYPE;
  public ancestorType: string = ZIRCON_APP_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory =
    new ZirconContextMenuFactoryWindow(this._app);

  constructor(app: ZirconApplication) {
    this._app = app;
  }

  // explicitly set creator to null since it is an abstract class
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (_state: any) => Promise<any> = null;

  // public async create(_state: ZirconWindowState): Promise<ZirconWindow> {
  //   throw new Error(
  //     'ZirconWindow cannot be instanciated directly as an abstract class',
  //   );
  // }
}

export class ZirconVizWindowFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-visualizer-window-factory`;
  public type = ZIRCON_VISUALIZER_WINDOW_TYPE;
  public ancestorType: string = ZIRCON_WINDOW_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory =
    new ZirconContextMenuFactoryVizWindow(this._app);

  constructor(app: ZirconApplication) {
    this._app = app;
  }

  public async create(state: ZirconVizWindowState): Promise<ZirconVizWindow> {
    return new ZirconVizWindow(this._app, state);
  }
}

export class ZirconParamWindowFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-parameters-window-factory`;
  public type = ZIRCON_PARAMETER_WINDOW_TYPE;
  public ancestorType: string = ZIRCON_WINDOW_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(app: ZirconApplication) {
    this._app = app;
  }

  public async create(
    state: ZirconParamWindowState,
  ): Promise<ZirconParamWindow> {
    return new ZirconParamWindow(this._app, state);
  }
}

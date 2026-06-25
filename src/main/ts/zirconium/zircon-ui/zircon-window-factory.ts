import { ZirconApplication } from '../zircon-core/zircon-app';
import { SimpleZirconAppObjectFactory } from '../zircon-core/zircon-app-object-factory';
import {
  ZIRCON_APP_OBJECT_TYPE,
  ZIRCON_PARAMETER_WINDOW_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
  ZIRCON_WINDOW_TYPE,
} from '../zircon-core/zircon-types';
import { ZirconContextMenuFactoryVizWindow } from '../zircon-menu/zircon-viz-window-context-menu';
import { ZirconContextMenuFactoryWindow } from '../zircon-menu/zircon-window-context-menu';
import {
  ZirconParamWindow,
  ZirconParamWindowState,
} from '../zircon-params/zircon-param-window';
import { ZirconVizWindow, ZirconVizWindowState } from './zircon-viz-window';
import { ZirconWindow, ZirconWindowState } from './zircon-window';

// this factory exist for context menu stage
export class ZirconWindowFactory extends SimpleZirconAppObjectFactory {
  constructor(app: ZirconApplication) {
    super(
      app,
      ZIRCON_WINDOW_TYPE,
      ZIRCON_APP_OBJECT_TYPE,
      async (
        app: ZirconApplication,
        state: ZirconWindowState,
      ): Promise<ZirconWindow> => {
        return new ZirconWindow(app, state);
      },
      new ZirconContextMenuFactoryWindow(app),
    );
  }
}

export class ZirconVizWindowFactory extends SimpleZirconAppObjectFactory {
  constructor(app: ZirconApplication) {
    super(
      app,
      ZIRCON_VISUALIZER_WINDOW_TYPE,
      ZIRCON_WINDOW_TYPE,
      async (
        app: ZirconApplication,
        state: ZirconVizWindowState,
      ): Promise<ZirconVizWindow> => {
        return new ZirconVizWindow(app, state);
      },
      new ZirconContextMenuFactoryVizWindow(app),
    );
  }
}

export class ZirconParamWindowFactory extends SimpleZirconAppObjectFactory {
  constructor(app: ZirconApplication) {
    super(
      app,
      ZIRCON_PARAMETER_WINDOW_TYPE,
      ZIRCON_WINDOW_TYPE,
      async (
        app: ZirconApplication,
        state: ZirconParamWindowState,
      ): Promise<ZirconParamWindow> => {
        return new ZirconParamWindow(app, state);
      },
      null,
    );
  }
}

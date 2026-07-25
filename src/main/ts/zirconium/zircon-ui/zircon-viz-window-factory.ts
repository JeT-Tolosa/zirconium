import { ZirconApplication } from '../zircon-core/zircon-app';
import { SimpleZirconAppObjectFactory } from '../zircon-core/zircon-app-object-factory';
import {
  ZIRCON_VISUALIZER_WINDOW_TYPE,
  ZIRCON_WINDOW_TYPE,
} from '../zircon-core/zircon-types';
import { ZirconContextMenuFactoryVizWindow } from '../zircon-menu/zircon-viz-window-context-menu';
import { ZirconVizWindow, ZirconVizWindowState } from './zircon-viz-window';

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
        const instance = new ZirconVizWindow(app);
        await instance.setState(state);
        return instance;
      },
      new ZirconContextMenuFactoryVizWindow(app),
    );
  }
}

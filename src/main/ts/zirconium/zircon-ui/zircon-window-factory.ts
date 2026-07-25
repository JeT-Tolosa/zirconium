import { ZirconApplication } from '../zircon-core/zircon-app';
import { SimpleZirconAppObjectFactory } from '../zircon-core/zircon-app-object-factory';
import {
  ZIRCON_APP_OBJECT_TYPE,
  ZIRCON_WINDOW_TYPE,
} from '../zircon-core/zircon-types';
import { ZirconContextMenuFactoryWindow } from '../zircon-menu/zircon-window-context-menu';
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
        const instance = new ZirconWindow(app);
        await instance.setState(state);
        return instance;
      },
      new ZirconContextMenuFactoryWindow(app),
    );
  }
}

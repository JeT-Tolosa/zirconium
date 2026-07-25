import { ZirconApplication } from '../zircon-core/zircon-app';
import { SimpleZirconAppObjectFactory } from '../zircon-core/zircon-app-object-factory';
import {
  ZIRCON_PARAMETER_WINDOW_TYPE,
  ZIRCON_WINDOW_TYPE,
} from '../zircon-core/zircon-types';
import {
  ZirconParamWindow,
  ZirconParamWindowState,
} from './zircon-param-window';

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
        const instance = new ZirconParamWindow(app);
        await instance.setState(state);
        return instance;
      },
      null,
    );
  }
}

import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObjectFactory } from '../zircon-object-factory';
import {
  ZIRCON_WINDOW_TYPE,
  ZirconWindow,
  ZirconWindowState,
} from './zircon-window';

export class ZirconWindowFactory extends ZirconObjectFactory {
  private _app: ZirconApplication = null;

  constructor(app: ZirconApplication) {
    super();
    this._app = app;
  }

  public override getType(): string {
    return ZIRCON_WINDOW_TYPE;
  }
  public override createInstance(
    state: ZirconWindowState,
  ): Promise<ZirconWindow> {
    return Promise.resolve().then(() => {
      return new ZirconWindow(this._app, state);
    });
  }
}

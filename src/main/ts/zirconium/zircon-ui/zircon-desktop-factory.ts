import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObjectFactory } from '../zircon-object-factory';
import {
  ZIRCON_DESKTOP_TYPE,
  ZirconDesktop,
  ZirconDesktopState,
} from './zircon-desktop';

export class ZirconDesktopFactory extends ZirconObjectFactory {
  private _app: ZirconApplication = null;

  constructor(app: ZirconApplication) {
    super();
    this._app = app;
  }

  public override getType(): string {
    return ZIRCON_DESKTOP_TYPE;
  }
  public override createInstance(
    state: ZirconDesktopState,
  ): Promise<ZirconDesktop> {
    return Promise.resolve().then(() => {
      return new ZirconDesktop(this._app, state);
    });
  }
}

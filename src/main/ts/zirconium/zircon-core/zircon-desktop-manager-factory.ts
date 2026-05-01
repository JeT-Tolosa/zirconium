import { ZirconApplication } from './zircon-app';
import { ZirconObjectFactory } from '../zircon-object-factory';
import {
  ZIRCON_DESKTOP_MANAGER_TYPE,
  ZirconDesktopManager,
  ZirconDesktopManagerState,
} from './zircon-desktop-manager';

export class ZirconDesktopManagerFactory extends ZirconObjectFactory {
  private _app: ZirconApplication = null;

  constructor(app: ZirconApplication) {
    super();
    this._app = app;
  }

  public override getType(): string {
    return ZIRCON_DESKTOP_MANAGER_TYPE;
  }
  public override createInstance(
    state: ZirconDesktopManagerState,
  ): Promise<ZirconDesktopManager> {
    return Promise.resolve().then(() => {
      return new ZirconDesktopManager(this._app, state);
    });
  }
}

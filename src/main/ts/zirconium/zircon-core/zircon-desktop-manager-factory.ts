import { ZirconApplication } from './zircon-app';
import { ZirconObjectFactory } from '../zircon-object-factory';
import {
  ZirconDesktopManager,
  ZirconDesktopManagerState,
} from './zircon-desktop-manager';
import { ZIRCON_DESKTOP_MANAGER_TYPE } from './zircon-types';

export class ZirconDesktopManagerFactory extends ZirconObjectFactory {
  private _app: ZirconApplication = null;

  constructor(app: ZirconApplication) {
    super('ZirconDesktopManagerFactory');
    this._app = app;
  }

  public override getHandledTypes(): string[] {
    return [ZIRCON_DESKTOP_MANAGER_TYPE];
  }

  public override createInstance(
    state: ZirconDesktopManagerState,
  ): Promise<ZirconDesktopManager> {
    return Promise.resolve().then(() => {
      return new ZirconDesktopManager(this._app, state);
    });
  }
}

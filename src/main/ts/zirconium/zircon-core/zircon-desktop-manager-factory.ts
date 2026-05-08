import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconContextMenuFactoryDesktop } from '../zircon-menu/zircon-desktop-context-menu-factory';
import {
  ZirconDesktopManager,
  ZirconDesktopManagerState,
} from './zircon-desktop-manager';
import {
  ZIRCON_APP_OBJECT_TYPE,
  ZIRCON_DESKTOP_MANAGER_TYPE,
} from './zircon-types';

export class ZirconDesktopManagerFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-desktop-manager-factory`;
  public type = ZIRCON_DESKTOP_MANAGER_TYPE;
  public ancestorType: string = ZIRCON_APP_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory =
    new ZirconContextMenuFactoryDesktop(this._app);

  constructor(app: ZirconApplication) {
    this._app = app;
  }

  public async create(
    state: ZirconDesktopManagerState,
  ): Promise<ZirconDesktopManager> {
    return new ZirconDesktopManager(this._app, state);
  }
}

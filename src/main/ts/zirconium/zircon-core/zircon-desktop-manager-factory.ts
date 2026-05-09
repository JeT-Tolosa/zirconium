import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconDesktopManager } from './zircon-desktop-manager';
import {
  ZIRCON_APP_OBJECT_TYPE,
  ZIRCON_DESKTOP_MANAGER_TYPE,
} from './zircon-types';
import { ZirconContextMenuFactoryDesktopManager } from '../zircon-menu/zircon-desktop-manager-context-menu';

export class ZirconDesktopManagerFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-desktop-manager-factory`;
  public type = ZIRCON_DESKTOP_MANAGER_TYPE;
  public ancestorType: string = ZIRCON_APP_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(app: ZirconApplication) {
    if (!app)
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    this._app = app;
    this.contextMenuFactory = new ZirconContextMenuFactoryDesktopManager(
      this._app,
    );
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async create(state: any): Promise<ZirconDesktopManager> | null {
    return new ZirconDesktopManager(this._app, state);
  }
}

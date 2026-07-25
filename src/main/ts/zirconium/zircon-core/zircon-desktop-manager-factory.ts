/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconDesktopManager } from './zircon-desktop-manager';
import {
  ZIRCON_APP_OBJECT_TYPE,
  ZIRCON_DESKTOP_MANAGER_TYPE,
} from './zircon-types';
import { ZirconContextMenuFactoryDesktopManager } from '../zircon-menu/zircon-desktop-manager-context-menu';
import { ZirconAppObjectFactory } from './zircon-app-object-factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';

export class ZirconDesktopManagerFactory extends ZirconAppObjectFactory {
  private _contextMenuFactory: ZirconContextMenuFactoryDesktopManager = null;

  constructor(app: ZirconApplication) {
    super(app, `zircon-desktop-manager-factory`);
  }

  public override getObjectType(): string {
    return ZIRCON_DESKTOP_MANAGER_TYPE;
  }

  public override getAncestorType(): string {
    return ZIRCON_APP_OBJECT_TYPE;
  }

  public override getContextMenuFactory(): ZirconContextMenuFactory {
    if (!this._contextMenuFactory) {
      this._contextMenuFactory = new ZirconContextMenuFactoryDesktopManager(
        this.getApplication(),
      );
    }
    return this._contextMenuFactory;
  }

  public override async createObject(state: any): Promise<any> {
    const instance = new ZirconDesktopManager(this.getApplication());
    await instance.setState(state);
    return instance;
  }
}

import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconDesktop, ZirconDesktopState } from './zircon-desktop';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconContextMenuFactoryDesktop } from '../zircon-menu/zircon-desktop-context-menu-factory';
import {
  ZIRCON_APP_OBJECT_TYPE,
  ZIRCON_DESKTOP_TYPE,
} from '../zircon-core/zircon-types';
import { ZirconObjectFactory } from '../zircon-core/zircon-object-factory';

export class ZirconDesktopFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-desktop-factory`;
  public type = ZIRCON_DESKTOP_TYPE;
  public ancestorType: string = ZIRCON_APP_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory =
    new ZirconContextMenuFactoryDesktop(this._app);

  constructor(app: ZirconApplication) {
    this._app = app;
  }

  public async create(state: ZirconDesktopState): Promise<ZirconDesktop> {
    return new ZirconDesktop(this._app, state);
  }
}

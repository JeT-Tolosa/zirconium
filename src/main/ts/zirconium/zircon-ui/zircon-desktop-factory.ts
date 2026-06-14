import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconDesktop } from './zircon-desktop';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconContextMenuFactoryDesktop } from '../zircon-menu/zircon-desktop-context-menu';
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
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(app: ZirconApplication) {
    if (!app) {
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    }
    this._app = app;
    this.contextMenuFactory = new ZirconContextMenuFactoryDesktop(this._app);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async create(state: any): Promise<ZirconDesktop> {
    return new ZirconDesktop(this._app, state);
  }
}

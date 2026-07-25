import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconDesktop } from './zircon-desktop';
import {
  ZIRCON_APP_OBJECT_TYPE,
  ZIRCON_DESKTOP_TYPE,
} from '../zircon-core/zircon-types';
import { ZirconAppObjectFactory } from '../zircon-core/zircon-app-object-factory';
import { ZirconContextMenuFactoryDesktop } from '../zircon-menu/zircon-desktop-context-menu';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';

export class ZirconDesktopFactory extends ZirconAppObjectFactory {
  private _contextMenuFactory: ZirconContextMenuFactoryDesktop = null;
  constructor(app: ZirconApplication) {
    super(app, `zircon-desktop-factory`);
    if (!app) {
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    }
  }

  public override getObjectType(): string {
    return ZIRCON_DESKTOP_TYPE;
  }

  public override getAncestorType(): string {
    return ZIRCON_APP_OBJECT_TYPE;
  }

  public override getContextMenuFactory(): ZirconContextMenuFactory {
    if (!this._contextMenuFactory) {
      this._contextMenuFactory = new ZirconContextMenuFactoryDesktop(
        this.getApplication(),
      );
    }
    return this._contextMenuFactory;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public override async createObject(state: any): Promise<ZirconDesktop> {
    const instance = new ZirconDesktop(this.getApplication());
    await instance.setState(state);
    return instance;
  }
}

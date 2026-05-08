import { ZirconApplication } from './zircon-app';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconContextMenuFactoryDesktop } from '../zircon-menu/zircon-desktop-context-menu-factory';
import { ZirconAppObject, ZirconAppObjectState } from './zircon-app-object';
import { ZIRCON_APP_OBJECT_TYPE, ZIRCON_OBJECT_TYPE } from './zircon-types';

export class ZirconAppObjectFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-app-object-factory`;
  public type = ZIRCON_APP_OBJECT_TYPE;
  public ancestorType: string = ZIRCON_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory =
    new ZirconContextMenuFactoryDesktop(this._app);

  constructor(app: ZirconApplication) {
    this._app = app;
  }

  create: (_state: ZirconAppObjectState) => Promise<ZirconAppObject> = null;
}

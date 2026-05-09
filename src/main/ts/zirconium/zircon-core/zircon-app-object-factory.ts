import { ZirconApplication } from './zircon-app';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZIRCON_APP_OBJECT_TYPE, ZIRCON_OBJECT_TYPE } from './zircon-types';
import { ZirconAppObject } from './zircon-app-object';

export class ZirconAppObjectFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-app-object-factory`;
  public type = ZIRCON_APP_OBJECT_TYPE;
  public ancestorType: string = ZIRCON_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(app: ZirconApplication) {
    if (!app)
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    this._app = app;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (_state: any) => Promise<ZirconAppObject> = null;
}

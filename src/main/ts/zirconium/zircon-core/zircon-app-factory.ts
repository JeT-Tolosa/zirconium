import { ZirconApplication } from './zircon-app';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZIRCON_OBJECT_TYPE } from './zircon-types';
import { ZirconAppObject } from './zircon-app-object';
import { ZirconContextMenuFactoryApplication } from '../zircon-menu/zircon-app-context-menu';

export class ZirconAppFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-app-factory`;
  public type = 'zircon-application';
  public ancestorType: string = ZIRCON_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(app: ZirconApplication) {
    if (!app) {
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    }
    this._app = app;
    this.contextMenuFactory = new ZirconContextMenuFactoryApplication(
      this._app,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (_state: any) => Promise<ZirconAppObject> = null;
}

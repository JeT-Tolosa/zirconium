/* eslint-disable @typescript-eslint/no-explicit-any */
import { ZirconApplication } from './zircon-app';
import { ZirconContextMenuFactoryApplication } from '../zircon-menu/zircon-app-context-menu';
import { ZIRCON_APPLICATION_TYPE } from './zircon-types';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';

export class ZirconAppFactory extends ZirconObjectFactory {
  private _app: ZirconApplication = null;
  private _contextMenuFactory: ZirconContextMenuFactoryApplication = null;

  constructor(app: ZirconApplication) {
    super('application-factory');
    this._app = app;
    this._contextMenuFactory = new ZirconContextMenuFactoryApplication(app);
  }

  public getApplication(): ZirconApplication {
    return this._app;
  }

  public override getObjectType(): string {
    return ZIRCON_APPLICATION_TYPE;
  }

  // application has no ancestor
  public override getAncestorType(): string {
    return null;
  }

  public override getContextMenuFactory(): ZirconContextMenuFactory {
    return this._contextMenuFactory;
  }

  public override createObject(_state: any): Promise<any> {
    throw new Error(
      `No one should try to create an object of type ${ZIRCON_APPLICATION_TYPE}`,
    );
  }
}

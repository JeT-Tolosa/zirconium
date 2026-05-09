import { ZirconApplication } from './zircon-app';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconEngine } from './zircon-engine';
import { ZIRCON_ENGINE_TYPE, ZIRCON_OBJECT_TYPE } from './zircon-types';

export class ZirconEngineFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-engine-factory`;
  public type = ZIRCON_ENGINE_TYPE;
  public ancestorType: string = ZIRCON_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory = null;

  constructor(app: ZirconApplication) {
    if (!app)
      throw new Error(
        `parent application cannot be null in ${this.constructor.name} constructor`,
      );
    this._app = app;
    this.contextMenuFactory = null;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create: (_state: any) => Promise<ZirconEngine> = null;
}

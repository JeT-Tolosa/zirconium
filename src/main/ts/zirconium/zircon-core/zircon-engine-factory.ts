import { ZirconApplication } from './zircon-app';
import { ZirconObjectFactory } from './zircon-object-factory';
import { ZirconContextMenuFactory } from '../zircon-menu/zircon-context-menu-factory';
import { ZirconContextMenuFactoryDesktop } from '../zircon-menu/zircon-desktop-context-menu-factory';
import { ZirconEngine, ZirconEngineState } from './zircon-engine';
import { ZIRCON_ENGINE_TYPE, ZIRCON_OBJECT_TYPE } from './zircon-types';

export class ZirconEngineFactory implements ZirconObjectFactory {
  private _app: ZirconApplication = null;

  public name = `zircon-engine-factory`;
  public type = ZIRCON_ENGINE_TYPE;
  public ancestorType: string = ZIRCON_OBJECT_TYPE;
  public contextMenuFactory: ZirconContextMenuFactory =
    new ZirconContextMenuFactoryDesktop(this._app);

  constructor(app: ZirconApplication) {
    this._app = app;
  }

  create: (_state: ZirconEngineState) => Promise<ZirconEngine> = null;
}

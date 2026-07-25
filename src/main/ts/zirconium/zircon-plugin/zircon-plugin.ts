import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObject } from '../zircon-core/zircon-object';
import { ZIRCON_PLUGIN_TYPE } from '../zircon-core/zircon-types';

export abstract class ZirconPlugin extends ZirconObject {
  constructor(name: string) {
    super();
    this.setName(name);
  }

  public override getType(): string {
    return ZIRCON_PLUGIN_TYPE;
  }

  public abstract plugInApplication(app: ZirconApplication): Promise<void>;
}

export abstract class ZirconAppPlugin extends ZirconPlugin {
  private __app: ZirconApplication = null;

  constructor(name: string, app: ZirconApplication) {
    super(name);
    this.__app = app;
    this.setEventDispatcher(app.getEventDispatcher());
  }

  public override getType(): string {
    return ZIRCON_PLUGIN_TYPE;
  }

  protected getApplication(): ZirconApplication {
    return this.__app;
  }

  public abstract override plugInApplication(
    app: ZirconApplication,
  ): Promise<void>;
}

export class SimpleZirconPlugin extends ZirconPlugin {
  private _plugFn: (app: ZirconApplication) => Promise<void> = null;

  constructor(name: string, plugFn: (app: ZirconApplication) => Promise<void>) {
    super(name);
    this._plugFn = plugFn;
  }

  public plugInApplication(app: ZirconApplication): Promise<void> {
    return this._plugFn(app);
  }
}

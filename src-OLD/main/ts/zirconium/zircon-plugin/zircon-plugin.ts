import { v4 as uuid } from 'uuid';
import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObject } from '../zircon-core/zircon-object';

export const ZIRCON_PLUGIN = 'zircon-plugin';

export abstract class ZirconPlugin extends ZirconObject {
  constructor(name: string) {
    super({
      id: `plugin-${uuid()}`,
      name: name,
      type: ZIRCON_PLUGIN,
    });
  }

  public override getType(): string {
    return ZIRCON_PLUGIN;
  }

  public abstract plugInApplication(app: ZirconApplication): Promise<void>;
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

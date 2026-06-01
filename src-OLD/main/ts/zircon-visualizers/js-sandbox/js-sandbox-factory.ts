import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import {
  VIZ_JSSANDBOX_TYPE,
  VizJSSandbox,
  VizJSSandboxState,
} from './js-sandbox';
import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';

export class VizJSSandboxFactory extends SimpleZirconObjectFactory {
  private _app: ZirconApplication = null;

  constructor(app: ZirconApplication) {
    super(VIZ_JSSANDBOX_TYPE, SHARP_EYE_VIZ_TYPE);
    this._app = app;
  }

  public override async createObject(
    state: VizJSSandboxState,
  ): Promise<VizJSSandbox> {
    return new VizJSSandbox(this._app, state);
  }
}

import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import {
  VIZ_JSSANDBOX_TYPE,
  VizJSSandbox,
  VizJSSandboxState,
} from './js-sandbox';
import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';
import { ZirconAppObjectFactory } from '../../zirconium/zircon-core/zircon-app-object-factory';

export class VizJSSandboxFactory extends ZirconAppObjectFactory {
  constructor(app: ZirconApplication) {
    super(app, 'js-sandbox-factory');
  }

  public override getObjectType(): string {
    return VIZ_JSSANDBOX_TYPE;
  }

  public override getAncestorType(): string {
    return SHARP_EYE_VIZ_TYPE;
  }

  public override async createObject(
    state: VizJSSandboxState,
  ): Promise<VizJSSandbox> {
    return new VizJSSandbox(this.getApplication(), state);
  }
}

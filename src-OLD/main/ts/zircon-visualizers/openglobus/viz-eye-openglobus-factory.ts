import { VizOpenGlobus, VizOpenGlobusState } from './viz-eye-openglobus';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

export class VizOpenGlobusFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VizOpenGlobus.OPENGLOBUS_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: VizOpenGlobusState,
  ): Promise<VizOpenGlobus> {
    return new VizOpenGlobus(state);
  }
}

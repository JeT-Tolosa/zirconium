import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizCesium, VizCesiumState } from './viz-eye-cesium';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';

export class VizCesiumFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VizCesium.CESIUM_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: VizCesiumState,
  ): Promise<VizCesium> {
    return new VizCesium(state);
  }
}

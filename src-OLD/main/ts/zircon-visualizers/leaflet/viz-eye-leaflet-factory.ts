import { VizLeaflet, VizLeafletState } from './viz-eye-leaflet';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

export class VizLeafletFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VizLeaflet.LEAFLET_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: VizLeafletState,
  ): Promise<VizLeaflet> {
    return new VizLeaflet(state);
  }
}

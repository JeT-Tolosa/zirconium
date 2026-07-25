import { VizOpenGlobus, VizOpenGlobusState } from './viz-eye-openglobus';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
async function createObject(state: VizOpenGlobusState): Promise<VizOpenGlobus> {
  const instance = new VizOpenGlobus();
  await instance.setState(state);
  return instance;
}

export class VizOpenGlobusFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizOpenGlobus.OPENGLOBUS_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

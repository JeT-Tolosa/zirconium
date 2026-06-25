import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import {
  VizCesiumWithDataProviders,
  VizCesiumWithDataProvidersState,
} from './viz-cesium-data-provider';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';

async function createObject(
  state: VizCesiumWithDataProvidersState,
): Promise<VizCesiumWithDataProviders> {
  return new VizCesiumWithDataProviders(state);
}
export class VizCesiumDataProviderFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizCesiumWithDataProviders.CESIUM_WITH_DATA_PROVIDERS_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

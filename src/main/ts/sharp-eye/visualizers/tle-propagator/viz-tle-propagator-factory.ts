import { SimpleZirconObjectFactory } from '../../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye-app';
import {
  VIZ_TLE_PROPAGATOR_TYPE,
  VizTLEPropagator,
  VizTLEPropagatorState,
} from './viz-tle-propagator';

export class VizTLEPropagatorFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VIZ_TLE_PROPAGATOR_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: VizTLEPropagatorState,
  ): Promise<VizTLEPropagator> {
    return new VizTLEPropagator(state);
  }
}

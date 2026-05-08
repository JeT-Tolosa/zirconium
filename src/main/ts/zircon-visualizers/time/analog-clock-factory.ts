import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { AnalogClock, AnalogClockState } from './analog-clock';

export class AnalogClockFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: AnalogClockState,
  ): Promise<AnalogClock> {
    return new AnalogClock(state);
  }
}

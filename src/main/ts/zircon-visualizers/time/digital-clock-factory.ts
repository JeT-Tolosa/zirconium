import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { DigitalClock, DigitalClockState } from './digital-clock';

export class DigitalClockFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(DigitalClock.DIGITAL_CLOCK_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: DigitalClockState,
  ): Promise<DigitalClock> {
    return new DigitalClock(state);
  }
}

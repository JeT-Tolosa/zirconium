import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { DigitalClock, DigitalClockState } from './digital-clock';

async function createObject(state: DigitalClockState): Promise<DigitalClock> {
  const instance = new DigitalClock();
  await instance.setState(state);
  return instance;
}

export class DigitalClockFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      DigitalClock.DIGITAL_CLOCK_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { AnalogClock, AnalogClockState } from './analog-clock';

async function createObject(state: AnalogClockState): Promise<AnalogClock> {
  const instance = new AnalogClock();
  await instance.setState(state);
  return instance;
}

export class AnalogClockFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

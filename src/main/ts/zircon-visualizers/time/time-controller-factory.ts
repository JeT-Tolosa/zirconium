import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { TimeController, TimeControllerState } from './time-controller';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

async function createObject(
  state: TimeControllerState,
): Promise<TimeController> {
  const instance = new TimeController();
  await instance.setState(state);
  return instance;
}

export class TimeControllerFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      TimeController.TIME_CONTROLLER_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { TimeController, TimeControllerState } from './time-controller';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

export class TimeControllerFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(TimeController.TIME_CONTROLLER_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: TimeControllerState,
  ): Promise<TimeController> {
    return new TimeController(state);
  }
}

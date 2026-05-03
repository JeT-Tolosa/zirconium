import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { TimeController, TimeControllerState } from './time-controller';

export class TimeControllerFactory extends ZirconObjectFactory {
  constructor() {
    super('TimeControllerFactory');
  }

  public getHandledTypes(): string[] {
    return [TimeController.TIME_CONTROLLER_VISUALIZER_TYPE];
  }

  public override createInstance(
    state: TimeControllerState,
  ): Promise<TimeController> {
    return Promise.resolve().then(() => {
      const viz = new TimeController(state);
      return viz;
    });
  }
}

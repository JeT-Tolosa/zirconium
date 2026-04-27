import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { TimeController, TimeControllerState } from './time-controller';


export class TimeControllerFactory extends ZirconObjectFactory {
  public getType(): string {
    return TimeController.TIME_CONTROLLER_VISUALIZER_TYPE;
  }

  public override createInstance(state: TimeControllerState): Promise<TimeController> {
    return Promise.resolve().then(() => {
      const viz = new TimeController();
      viz.setState(state);
      return viz;
    });
  }
}

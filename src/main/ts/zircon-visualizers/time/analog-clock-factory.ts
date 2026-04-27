import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { AnalogClock, AnalogClockState } from './analog-clock';


export class AnalogClockFactory extends ZirconObjectFactory {
  public getType(): string {
    return AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE;
  }

  public override createInstance(state: AnalogClockState): Promise<AnalogClock> {
    return Promise.resolve().then(() => {
      const viz = new AnalogClock();
      viz.setState(state);
      return viz;
    });
  }
}

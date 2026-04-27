import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { DigitalClock, DigitalClockState } from './digital-clock';

export class DigitalClockFactory extends ZirconObjectFactory {
  public getType(): string {
    return DigitalClock.DIGITAL_CLOCK_VISUALIZER_TYPE;
  }

  public override createInstance(
    state: DigitalClockState,
  ): Promise<DigitalClock> {
    return Promise.resolve().then(() => {
      const viz = new DigitalClock(state);
      return viz;
    });
  }
}

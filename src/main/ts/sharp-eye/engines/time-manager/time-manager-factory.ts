import { ZirconObjectFactory } from '../../../zirconium/zircon-object-factory';
import {
  TimeManagerEngine,
  TimeManagerEngineState,
} from './time-manager-engine';

/**
 * Time Manager Engine Factory
 */
export class TimeManagerEngineFactory extends ZirconObjectFactory {
  constructor() {
    super();
  }

  public override getType(): string {
    return TimeManagerEngine.TIME_MANAGER_ENGINE_TYPE;
  }

  public override createInstance(
    state: TimeManagerEngineState,
  ): Promise<TimeManagerEngine> {
    return Promise.resolve().then(() => {
      return new TimeManagerEngine(state);
    });
  }
}

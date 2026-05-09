import { SimpleZirconObjectFactory } from '../../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_ENGINE_TYPE } from '../../sharp-eye-app';
import {
  TimeManagerEngine,
  TimeManagerEngineState,
} from './time-manager-engine';

export class TimeManagerEngineFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(TimeManagerEngine.TIME_MANAGER_ENGINE_TYPE, SHARP_EYE_ENGINE_TYPE);
  }

  public override async createObject(
    state: TimeManagerEngineState,
  ): Promise<TimeManagerEngine> {
    return new TimeManagerEngine(state);
  }
}

import { SimpleZirconObjectFactory } from '../../../zirconium/zircon-core/zircon-object-factory';
import { SHARP_EYE_ENGINE_TYPE } from '../../sharp-eye-app';
import {
  TimeManagerEngine,
  TimeManagerEngineState,
} from './time-manager-engine';

async function createObject(
  state: TimeManagerEngineState,
): Promise<TimeManagerEngine> {
  return new TimeManagerEngine(state);
}
export class TimeManagerEngineFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      TimeManagerEngine.TIME_MANAGER_ENGINE_TYPE,
      SHARP_EYE_ENGINE_TYPE,
      createObject,
      null,
    );
  }
}

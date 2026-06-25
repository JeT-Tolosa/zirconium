import {
  VizMessageLogger,
  VizMessageLoggerState,
} from './viz-eye-message-logger';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

async function createObject(
  state: VizMessageLoggerState,
): Promise<VizMessageLogger> {
  return new VizMessageLogger(state);
}
export class VizMessageLoggerFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizMessageLogger.MESSAGE_LOGGER_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

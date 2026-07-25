import { VizEventLogger, VizEventLoggerState } from './viz-eye-event-logger';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

async function createObject(
  state: VizEventLoggerState,
): Promise<VizEventLogger> {
  const instance = new VizEventLogger();
  await instance.setState(state);
  return instance;
}

export class VizEventLoggerFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizEventLogger.EVENT_LOGGER_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

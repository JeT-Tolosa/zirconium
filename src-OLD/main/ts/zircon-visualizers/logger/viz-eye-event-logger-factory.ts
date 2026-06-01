import { VizEventLogger, VizEventLoggerState } from './viz-eye-event-logger';
import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';

export class VizEventLoggerFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VizEventLogger.EVENT_LOGGER_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: VizEventLoggerState,
  ): Promise<VizEventLogger> {
    return new VizEventLogger(state);
  }
}

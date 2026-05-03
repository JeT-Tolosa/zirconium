import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-visualizer';
import { VizEventLogger } from './viz-eye-event-logger';

export class VizEventLoggerFactory extends ZirconObjectFactory {
  constructor() {
    super('VizEventLoggerFactory');
  }

  public getHandledTypes(): string[] {
    return [VizEventLogger.EVENT_LOGGER_VISUALIZER_TYPE];
  }

  public override createInstance(
    state: ZirconVizState,
  ): Promise<VizEventLogger> {
    return Promise.resolve().then(() => {
      const viz = new VizEventLogger(state);
      return viz;
    });
  }
}

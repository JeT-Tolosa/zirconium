import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizMessageLogger } from './viz-eye-message-logger';

export class VizMessageLoggerFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizMessageLogger.MESSAGE_LOGGER_VISUALIZER_TYPE;
  }

  public override createInstance(
    state: ZirconVizState,
  ): Promise<VizMessageLogger> {
    return Promise.resolve().then(() => {
      const viz = new VizMessageLogger(state);
      return viz;
    });
  }
}

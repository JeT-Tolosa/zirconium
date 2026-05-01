import { ZirconApplication } from '../zircon-core/zircon-app';
import { ZirconObjectFactory } from '../zircon-object-factory';
import {
  ZIRCON_VISUALIZER_WINDOW_TYPE,
  ZirconVizWindow,
  ZirconVizWindowState,
} from './zircon-viz-window';

export class ZirconVizWindowFactory extends ZirconObjectFactory {
  private _app: ZirconApplication = null;

  constructor(app: ZirconApplication) {
    super();
    this._app = app;
  }

  public override getType(): string {
    return ZIRCON_VISUALIZER_WINDOW_TYPE;
  }
  public override createInstance(
    state: ZirconVizWindowState,
  ): Promise<ZirconVizWindow> {
    return Promise.resolve().then(() => {
      return new ZirconVizWindow(this._app, state);
    });
  }
}

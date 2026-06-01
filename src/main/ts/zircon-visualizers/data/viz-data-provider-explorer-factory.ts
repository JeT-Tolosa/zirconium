import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import {
  VizDataProviderExplorer,
  VizDataProviderExplorerState,
} from './viz-data-provider-explorer';

export class VizDataProviderFactory extends SimpleZirconObjectFactory {
  private _app: ZirconApplication = null;

  constructor(app: ZirconApplication) {
    super(VizDataProviderExplorer.VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
    this._app = app;
  }

  public override async createObject(
    state: VizDataProviderExplorerState,
  ): Promise<VizDataProviderExplorer> {
    return new VizDataProviderExplorer(this._app, state);
  }
}

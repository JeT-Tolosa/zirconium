import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';
import { SimpleZirconAppObjectFactory } from '../../zirconium/zircon-core/zircon-app-object-factory';
import {
  VizDataProviderExplorer,
  VizDataProviderExplorerState,
} from './viz-data-provider-explorer';

export class VizDataProviderFactory extends SimpleZirconAppObjectFactory {
  constructor(app: ZirconApplication) {
    super(
      app,
      VizDataProviderExplorer.DATA_EXPLORER_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      async (
        app: ZirconApplication,
        state: VizDataProviderExplorerState,
      ): Promise<VizDataProviderExplorer> => {
        return new VizDataProviderExplorer(app, state);
      },
      null,
    );
  }
}

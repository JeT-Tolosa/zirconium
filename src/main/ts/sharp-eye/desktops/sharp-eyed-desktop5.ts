import { SharpEyedApp } from '../sharp-eye-app';
import { v4 as uuid } from 'uuid';
import { ZirconVizWindowState } from '../../zirconium/zircon-ui/zircon-viz-window';
import { ZirconDesktopState } from '../../zirconium/zircon-ui/zircon-desktop';
import { VizAISLoaderFactory } from '../../zircon-visualizers/maritime/viz-eye-ais-loader-factory';
import {
  VizAISCatalogTabulator,
  VizAISCatalogTabulatorState,
} from '../../zircon-visualizers/maritime/viz-eye-ais-catalog-tabulator';
import { VIZ_AIS_LOADER_TYPE } from '../../zircon-visualizers/maritime/viz-eye-ais-loader';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../../zirconium/zircon-core/zircon-types';
import { VizAISCatalogTabulatorFactory } from '../../zircon-visualizers/maritime/viz-eye-ais-catalog-tabulator-factory';
import { VizDataProviderFactory } from '../../zircon-visualizers/data/viz-data-provider-explorer-factory';

import { VizLoaderState } from '../../zircon-visualizers/data-loader/viz-loader';

/**
 * DESKTOP5
 */
export async function createDesktop5(
  app: SharpEyedApp,
): Promise<ZirconDesktopState> {
  await app.registerObjectFactory(new VizAISLoaderFactory());
  await app.registerObjectFactory(new VizAISCatalogTabulatorFactory());
  await app.registerObjectFactory(new VizDataProviderFactory(app));

  const aisLoaderViz: VizLoaderState = {
    id: 'aisLoaderVizId',
    type: VIZ_AIS_LOADER_TYPE,
    name: 'AIS Loader',
  };
  app.registerObjectState(aisLoaderViz);

  const AISLoaderWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'AIS Loader',
    left: 10,
    top: 470,
    width: 400,
    height: 220,
    vizIds: [aisLoaderViz.id],
  };
  app.registerObjectState(AISLoaderWindowState);

  const aisCatalogViz: VizAISCatalogTabulatorState = {
    id: 'aisCatalogVizId',
    type: VizAISCatalogTabulator.VIZ_AIS_CATALOG_TABULATOR_TYPE,
    name: 'AIS Catalog',
  };
  app.registerObjectState(aisCatalogViz);

  const AISCatalogWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'AIS Catalog',
    left: 710,
    top: 10,
    width: 600,
    height: 1080,
    vizIds: [aisCatalogViz.id],
  };
  app.registerObjectState(AISCatalogWindowState);

  const desktop5State: ZirconDesktopState = {
    type: ZIRCON_DESKTOP_TYPE,
    id: `desktop5-${uuid()}`,
    name: 'Maritime',
    windowIds: [AISLoaderWindowState.id, AISCatalogWindowState.id],
  };
  app.registerObjectState(desktop5State);
  return Promise.resolve(desktop5State);
}

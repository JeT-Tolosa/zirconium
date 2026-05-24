import { SharpEyedApp } from '../sharp-eye-app';
import { v4 as uuid } from 'uuid';
import { ZirconVizWindowState } from '../../zirconium/zircon-ui/zircon-viz-window';
import { ZirconDesktopState } from '../../zirconium/zircon-ui/zircon-desktop';
import { VizGroundStationLoaderFactory } from '../../zircon-visualizers/spatial/viz-eye-ground-station-loader-factory';
import { VizGroundStationCatalogTabulatorFactory } from '../../zircon-visualizers/spatial/viz-eye-ground-station-catalog-tabulator-factory';
import {
  VizGroundStationCatalogTabulator,
  VizGroundStationCatalogTabulatorState,
} from '../../zircon-visualizers/spatial/viz-eye-ground-station-catalog-tabulator';
import {
  VizGroundStationLoader,
  VizGroundStationLoaderState,
} from '../../zircon-visualizers/spatial/viz-eye-ground-station-loader';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../../zirconium/zircon-core/zircon-types';

/**
 * DESKTOP4
 */
export async function createDesktop4(
  app: SharpEyedApp,
): Promise<ZirconDesktopState> {
  await app.registerObjectFactory(new VizGroundStationLoaderFactory());
  await app.registerObjectFactory(
    new VizGroundStationCatalogTabulatorFactory(),
  );

  const vizGSLoaderState: VizGroundStationLoaderState = {
    id: 'groundStationLoaderVizId',
    type: VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE,
    name: 'Ground Station Loader',
  };
  app.registerObjectState(vizGSLoaderState);

  const vizGSCatalogState: VizGroundStationCatalogTabulatorState = {
    id: 'groundStationCatalogVizId',
    type: VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE,
    name: 'Ground Station Catalog',
  };
  app.registerObjectState(vizGSCatalogState);

  const groundStationLoaderWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Ground Station Loader',
    left: 1320,
    top: 270,
    width: 385,
    height: 220,
    vizId: vizGSLoaderState.id,
  };
  app.registerObjectState(groundStationLoaderWindowState);

  const groundStationCatalog1WindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Ground Station Catalog 1',
    left: 100,
    top: 10,
    width: 600,
    height: 1080,
    vizId: vizGSCatalogState.id,
  };
  app.registerObjectState(groundStationCatalog1WindowState);

  const desktop4State: ZirconDesktopState = {
    type: ZIRCON_DESKTOP_TYPE,
    id: `desktop4-${uuid()}`,
    name: 'Spatial',
    windowIds: [
      groundStationLoaderWindowState.id,
      groundStationCatalog1WindowState.id,
    ],
  };
  app.registerObjectState(desktop4State);
  return Promise.resolve(desktop4State);
}

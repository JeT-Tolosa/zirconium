import { SharpEyedApp } from '../sharp-eye-app';
import { v4 as uuid } from 'uuid';
import { ZirconVizWindowState } from '../../zirconium/zircon-ui/zircon-viz-window';
import { ZirconDesktopState } from '../../zirconium/zircon-ui/zircon-desktop';
import { VizSatCatLoaderFactory } from '../../zircon-visualizers/spatial/viz-eye-satellite-loader-factory';
import { VizSatelliteCatalogTabulatorFactory } from '../../zircon-visualizers/spatial/viz-eye-satellite-catalog-tabulator-factory';
import {
  VizSatelliteCatalogTabulator,
  VizSatelliteCatalogTabulatorState,
} from '../../zircon-visualizers/spatial/viz-eye-satellite-catalog-tabulator';
import {
  VizSatCatLoader,
  VizSatCatLoaderState,
} from '../../zircon-visualizers/spatial/viz-eye-satellite-loader';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../../zirconium/zircon-core/zircon-types';

/**
 * DESKTOP3
 */
export async function createDesktop3(
  app: SharpEyedApp,
): Promise<ZirconDesktopState> {
  await app.registerObjectFactory(new VizSatCatLoaderFactory());
  await app.registerObjectFactory(new VizSatelliteCatalogTabulatorFactory());

  // Spatial Loaders
  const vizSatCatLoader: VizSatCatLoaderState = {
    id: 'satelliteLoaderVizId',
    type: VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE,
    name: 'Satellite Loader',
  };
  app.registerObjectState(vizSatCatLoader);

  // Catalog Visualizers
  const vizSatCatalog1: VizSatelliteCatalogTabulatorState = {
    id: 'satcat1VizId',
    type: VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
    name: 'Satellite Catalog 1',
  };
  app.registerObjectState(vizSatCatalog1);

  const vizSatCatalog2: VizSatelliteCatalogTabulatorState = {
    id: 'satcat2VizId',
    type: VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
    name: 'Satellite Catalog 2',
  };
  app.registerObjectState(vizSatCatalog2);

  const satcat1WindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Satellite Catalog 1',
    left: 100,
    top: 10,
    width: 600,
    height: 1080,
    vizId: vizSatCatalog1.id,
  };
  app.registerObjectState(satcat1WindowState);

  const satcat2WindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Satellite Catalog 2',
    left: 710,
    top: 10,
    width: 600,
    height: 1080,
    vizId: vizSatCatalog2.id,
  };
  app.registerObjectState(satcat2WindowState);

  const satelliteLoaderWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Satellite Loader',
    left: 1320,
    top: 10,
    width: 385,
    height: 220,
    vizId: vizSatCatLoader.id,
  };
  // window4.setContentObject(new VizSatelliteLoader());
  app.registerObjectState(satelliteLoaderWindowState);

  const desktop3State: ZirconDesktopState = {
    type: ZIRCON_DESKTOP_TYPE,
    id: `desktop3-${uuid()}`,
    name: 'Desktop 3',
    windowIds: [
      satcat1WindowState.id,
      satcat2WindowState.id,
      satelliteLoaderWindowState.id,
    ],
  };
  app.registerObjectState(desktop3State);
  return Promise.resolve(desktop3State);
}

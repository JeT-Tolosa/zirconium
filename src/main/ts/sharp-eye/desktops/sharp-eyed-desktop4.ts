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
import { VizGroundStationLoader } from '../../zircon-visualizers/spatial/viz-eye-ground-station-loader';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../../zirconium/zircon-core/zircon-types';
import { CESIUM_VISUALIZER_TYPE } from '../../zircon-visualizers/cesium/viz-eye-cesium';
import { VizCesiumState } from '../../zircon-visualizers/cesium/viz-eye-cesium';
import { VizLoaderState } from '../../zircon-visualizers/data-loader/viz-loader';
import { VizCesiumFactory } from '../../zircon-visualizers/cesium/viz-eye-cesium-factory';

export const GROUND_STATION_TO_CESIUM_ADAPTER_TYPE =
  'ground-station-to-cesium-adapter';

// function compareGroundStation(gs1: GroundStation, gs2: GroundStation): number {
//   return gs1.id.localeCompare(gs2.id);
// }

// function transformGroundStationToCesiumLayer(
//   stations: GroundStation[],
// ): Cesium.CustomDataSource {
//   const dataSource = new Cesium.CustomDataSource('groundStations');

//   stations.forEach((station) => {
//     dataSource.entities.add({
//       id: station.id,
//       name: station.name,
//       position: Cesium.Cartesian3.fromDegrees(
//         station.coordinates.lon,
//         station.coordinates.lat,
//       ),
//       point: {
//         pixelSize: 10,
//         color: Cesium.Color.CYAN,
//         outlineColor: Cesium.Color.WHITE,
//         outlineWidth: 2,
//       },
//       label: {
//         text: station.name,
//         font: '14px sans-serif',
//         pixelOffset: new Cesium.Cartesian2(0, -20),
//         showBackground: true,
//       },
//       properties: {
//         data_imagery: station.data_imagery,
//         imagery: station.imagery,
//         state: station.state,
//         country: station.country,
//         URL: station.URL,
//         satellites: station.satellites,
//       },
//     });
//   });

//   return dataSource;
// }

/**
 * DESKTOP4
 */
export async function createDesktop4(
  app: SharpEyedApp,
): Promise<ZirconDesktopState> {
  await app.registerObjectFactory(new VizCesiumFactory());
  // await app.registerObjectFactory(
  //   new ZirconDataAdapterFactory(
  //     app,
  //     'default-ground-station-to-cesium-adapter',
  //     GROUND_STATION_TO_CESIUM_ADAPTER_TYPE,
  //     CESIUM_LAYER_TYPE,
  //     transformGroundStationToCesiumLayer,
  //     compareGroundStation,
  //   ),
  // );

  await app.registerObjectFactory(new VizGroundStationLoaderFactory());
  await app.registerObjectFactory(
    new VizGroundStationCatalogTabulatorFactory(),
  );

  // await app.registerObjectFactory(
  //   new ZirconDataAdapterFactory(
  //     app,
  //     'ground-station-catalog-to-loader-adapter',
  //     GROUND_STATION_TO_CESIUM_ADAPTER_TYPE,
  //     GROUND_STATION_TYPE,
  //     GroundStationToCesiumConverter.groundStationToBillboard,
  //     groundStationComparator,
  //   ),
  // );

  const vizGSLoaderState: VizLoaderState = {
    id: 'groundStationLoaderVizId',
    type: VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE,
    name: 'Ground Station Loader',
  };
  app.registerObjectState(vizGSLoaderState);

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

  const vizGSCatalogState: VizGroundStationCatalogTabulatorState = {
    id: 'groundStationCatalogVizId',
    type: VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE,
    name: 'Ground Station Catalog',
  };
  app.registerObjectState(vizGSCatalogState);
  const groundStationCatalog1WindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Ground Station Catalog 1',
    left: 10,
    top: 10,
    width: 600,
    height: 1080,
    vizId: vizGSCatalogState.id,
  };
  app.registerObjectState(groundStationCatalog1WindowState);
  const vizCesiumState: VizCesiumState = {
    id: 'cesiumVizId',
    type: CESIUM_VISUALIZER_TYPE,
    name: 'Cesium Visualizer',
    token:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI1MTQ3MzJjOS1jY2MwLTRiOGUtYTU5Ny1kNTMxNTQ2MDIxOGIiLCJpZCI6Mzk2Mzc0LCJpYXQiOjE3NzI0MTE2OTB9.O-0_Gu3rYf-7ijUGGlWZtrybQ3OhKMtx0mjBidAcBIw',
  };
  app.registerObjectState(vizCesiumState);
  const cesiumWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Cesium Visualizer',
    left: 620,
    top: 10,
    width: 600,
    height: 1080,
    vizId: vizCesiumState.id,
  };
  app.registerObjectState(cesiumWindowState);

  const desktop4State: ZirconDesktopState = {
    type: ZIRCON_DESKTOP_TYPE,
    id: `desktop4-${uuid()}`,
    name: 'Spatial',
    windowIds: [
      groundStationLoaderWindowState.id,
      groundStationCatalog1WindowState.id,
      cesiumWindowState.id,
    ],
  };
  app.registerObjectState(desktop4State);
  return Promise.resolve(desktop4State);
}

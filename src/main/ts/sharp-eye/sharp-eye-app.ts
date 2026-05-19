import './sharp-eye.css';
import { v4 as uuid } from 'uuid';
import { ZirconDesktopState } from '../zirconium/zircon-ui/zircon-desktop';
import { ZirconApplication } from '../zirconium/zircon-core/zircon-app';
import {
  SatelliteCatalogEngine,
  SatelliteCatalogEngineState,
} from './engines/spatial/satellite-catalog-engine';
import {
  GroundStationCatalogEngine,
  GroundStationCatalogEngineState,
} from './engines/spatial/ground-station-catalog-engine';
import { TimingHelper } from '../libraries/timing/timing';
import { VizFetchFactory } from '../zircon-visualizers/fetch/viz-eye-fetch-factory';
import { ZirconDesktopManagerState } from '../zirconium/zircon-core/zircon-desktop-manager';

// 3D Visualizers
import { VizCesiumFactory } from '../zircon-visualizers/cesium/viz-eye-cesium-factory';
import { VizLeafletFactory } from '../zircon-visualizers/leaflet/viz-eye-leaflet-factory';
import { VizOpenGlobusFactory } from '../zircon-visualizers/openglobus/viz-eye-openglobus-factory';
import { VizOpenGlobus } from '../zircon-visualizers/openglobus/viz-eye-openglobus';

// Three.js Visualizers
import { VizCubeSampleThreeJSFactory } from '../zircon-visualizers/threeJS/viz-eye-cube-sample-threeJS-factory';
import { VizHelmetSampleThreeJSFactory } from '../zircon-visualizers/threeJS/viz-eye-helmet-sample-threeJS-factory';

// Chart.js Visualizers
import { VizBarJSChartFactory } from '../zircon-visualizers/jschart/bar-jschart-factory';
import { VizBubbleJSChartFactory } from '../zircon-visualizers/jschart/bubble-jschart-factory';
import { VizLineJSChartFactory } from '../zircon-visualizers/jschart/line-jschart-factory';
import { VizPieJSChartFactory } from '../zircon-visualizers/jschart/pie-jschart-factory';
import { VizRadarJSChartFactory } from '../zircon-visualizers/jschart/radar-jschart-factory';
import { VizScatterJSChartFactory } from '../zircon-visualizers/jschart/scatter-jschart-factory';

// Logger Visualizers
import { VizEventLoggerFactory } from '../zircon-visualizers/logger/viz-eye-event-logger-factory';
import { VizMessageLoggerFactory } from '../zircon-visualizers/logger/viz-eye-message-logger-factory';

// Time Visualizers
import { DigitalClockFactory } from '../zircon-visualizers/time/digital-clock-factory';
import { AnalogClockFactory } from '../zircon-visualizers/time/analog-clock-factory';
import { TimeControllerFactory } from '../zircon-visualizers/time/time-controller-factory';

// Spatial Loaders
import { VizSatCatLoaderFactory } from '../zircon-visualizers/spatial/viz-eye-satellite-loader-factory';
import { VizGroundStationLoaderFactory } from '../zircon-visualizers/spatial/viz-eye-ground-station-loader-factory';

// Spatial Catalogs
import { VizSatelliteCatalogTabulator } from '../zircon-visualizers/spatial/viz-eye-satellite-catalog-tabulator';
import { VizGroundStationCatalogTabulator } from '../zircon-visualizers/spatial/viz-eye-ground-station-catalog-tabulator';
import { VizLeaflet } from '../zircon-visualizers/leaflet/viz-eye-leaflet';
import { VizCubeSampleThreeJS } from '../zircon-visualizers/threeJS/viz-eye-cube-sample-threeJS';
import { VizHelmetSampleThreeJS } from '../zircon-visualizers/threeJS/viz-eye-helmet-sample-threeJS';
import {
  VizBarJSChart,
  VizBarJSChartState,
} from '../zircon-visualizers/jschart/bar-jschart';
import {
  VizLineJSChart,
  VizLineJSChartState,
} from '../zircon-visualizers/jschart/line-jschart';
import { VizEventLogger } from '../zircon-visualizers/logger/viz-eye-event-logger';
import { DigitalClock } from '../zircon-visualizers/time/digital-clock';
import { AnalogClock } from '../zircon-visualizers/time/analog-clock';
import { TimeController } from '../zircon-visualizers/time/time-controller';
import { VizSatCatLoader } from '../zircon-visualizers/spatial/viz-eye-satellite-loader';
import { VizGroundStationLoader } from '../zircon-visualizers/spatial/viz-eye-ground-station-loader';
import { VizFetch } from '../zircon-visualizers/fetch/viz-eye-fetch';
import { VizSatelliteCatalogTabulatorFactory } from '../zircon-visualizers/spatial/viz-eye-satellite-catalog-tabulator-factory';
import { VizGroundStationCatalogTabulatorFactory } from '../zircon-visualizers/spatial/viz-eye-ground-station-catalog-tabulator-factory';
import { createSeriesBar, createSeriesLine } from './sharp-eye-panels';
import { SatelliteCatalogEngineFactory } from './engines/spatial/satellite-catalog-engine-factory';
import { GroundStationCatalogEngineFactory } from './engines/spatial/ground-station-catalog-engine-factory';
import { TimeManagerEngineFactory } from './engines/time-manager/time-manager-factory';
import {
  TimeManagerEngine,
  TimeManagerEngineState,
} from './engines/time-manager/time-manager-engine';
import { ZirconVizWindowState } from '../zirconium/zircon-ui/zircon-viz-window';
import {
  ZIRCON_DESKTOP_MANAGER_TYPE,
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_ENGINE_TYPE,
  ZIRCON_VISUALIZER_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../zirconium/zircon-core/zircon-types';
import { AISCatalogEngineFactory } from './engines/maritime/ais-catalog-engine-factory';
import {
  AISCatalogEngine,
  AISCatalogEngineState,
} from './engines/maritime/ais-catalog-engine';
import { VizAISCatalogTabulatorFactory } from '../zircon-visualizers/maritime/viz-eye-ais-catalog-tabulator-factory';
import {
  VIZ_AIS_CATALOG_TABULATOR_TYPE,
  VizAISCatalogTabulatorState,
} from '../zircon-visualizers/maritime/viz-eye-ais-catalog-tabulator';
import {
  VIZ_AIS_LOADER_TYPE,
  VizAISLoaderState,
} from '../zircon-visualizers/maritime/viz-eye-ais-loader';
import { VizAISLoaderFactory } from '../zircon-visualizers/maritime/viz-eye-ais-loader-factory';
import { UserConnectUIZirconPlugin } from '../zircon-plugins/connect-ui/connect-ui-plugin';

export const SHARP_EYE_ENGINE_TYPE = ZIRCON_ENGINE_TYPE;
export const SHARP_EYE_VIZ_TYPE = ZIRCON_VISUALIZER_TYPE;

export class SharpEyedApp extends ZirconApplication {
  /**
   * constructor
   */
  constructor() {
    super('Sharp Eye');
    this.setUIClass('sharp-eye-ui');
  }

  private async registerPlugins(): Promise<void> {
    this.getPluginManager().registerPlugin(new UserConnectUIZirconPlugin());
  }

  private async registerEngines(): Promise<void> {
    await this.registerObjectFactory(new SatelliteCatalogEngineFactory());
    await this.registerObjectFactory(new GroundStationCatalogEngineFactory());
    await this.registerObjectFactory(new TimeManagerEngineFactory());
    await this.registerObjectFactory(new AISCatalogEngineFactory());

    this.registerObjectState({
      id: `time-manager-${uuid()}`,
      type: TimeManagerEngine.TIME_MANAGER_ENGINE_TYPE,
      timeDescriptor: TimingHelper.createRealTimeDescriptor(),
    } as TimeManagerEngineState);

    this.registerObjectState({
      id: `satellite-catalog-${uuid()}`,
      type: SatelliteCatalogEngine.SATELLITE_CATALOG_ENGINE_TYPE,
    } as SatelliteCatalogEngineState);

    this.registerObjectState({
      id: `gs-catalog-${uuid()}`,
      type: AISCatalogEngine.AIS_CATALOG_ENGINE_TYPE,
    } as AISCatalogEngineState);

    this.registerObjectState({
      id: `qis-catalog-${uuid()}`,
      type: GroundStationCatalogEngine.GROUND_STATION_CATALOG_ENGINE_TYPE,
    } as GroundStationCatalogEngineState);
  }

  public async create(): Promise<void> {
    await this.registerPlugins();
    await this.registerEngines();
    await this.registerVisualizers();
    this.registerVisualizerStates();

    // TODO: la creation du DesktopManager n'a rien a foutre là. Il faut que ce soit dans ZirconApp
    const desktopManagerState: ZirconDesktopManagerState = {
      type: ZIRCON_DESKTOP_MANAGER_TYPE,
      id: this.getDesktopManagerId(),
      desktopIds: [
        this.createDesktops1().id,
        this.createDesktops2().id,
        this.createDesktops3().id,
        this.createDesktops4().id,
        this.createDesktops5().id,
      ],
    };
    this.registerObjectState(desktopManagerState);
  }

  public async registerVisualizers(): Promise<void> {
    // 3D Visualizers
    await this.registerObjectFactory(new VizCesiumFactory());
    await this.registerObjectFactory(new VizLeafletFactory());
    await this.registerObjectFactory(new VizOpenGlobusFactory());

    // Three.js Visualizers
    await this.registerObjectFactory(new VizCubeSampleThreeJSFactory());
    await this.registerObjectFactory(new VizHelmetSampleThreeJSFactory());

    // Chart.js Visualizers
    await this.registerObjectFactory(new VizBarJSChartFactory());
    await this.registerObjectFactory(new VizBubbleJSChartFactory());
    await this.registerObjectFactory(new VizLineJSChartFactory());
    await this.registerObjectFactory(new VizPieJSChartFactory());
    await this.registerObjectFactory(new VizRadarJSChartFactory());
    await this.registerObjectFactory(new VizScatterJSChartFactory());

    // Logger Visualizers
    await this.registerObjectFactory(new VizEventLoggerFactory());
    await this.registerObjectFactory(new VizMessageLoggerFactory());

    // Time Visualizers
    await this.registerObjectFactory(new DigitalClockFactory());
    await this.registerObjectFactory(new AnalogClockFactory());
    await this.registerObjectFactory(new TimeControllerFactory());

    // Spatial Catalogs & Loaders
    await this.registerObjectFactory(new VizSatCatLoaderFactory());
    await this.registerObjectFactory(new VizGroundStationLoaderFactory());
    await this.registerObjectFactory(new VizSatelliteCatalogTabulatorFactory());
    await this.registerObjectFactory(
      new VizGroundStationCatalogTabulatorFactory(),
    );

    // Maritime Catalogs & Loaders
    await this.registerObjectFactory(new VizAISLoaderFactory());
    await this.registerObjectFactory(new VizAISCatalogTabulatorFactory());

    // Existing Fetch Visualizer
    await this.registerObjectFactory(new VizFetchFactory());
  }

  public registerVisualizerStates(): void {
    // 3D Visualizers
    this.registerObjectState({
      id: 'globusVizId',
      type: VizOpenGlobus.OPENGLOBUS_VISUALIZER_TYPE,
      name: 'OpenGlobus Globe',
    });

    this.registerObjectState({
      id: 'leafletVizId',
      type: VizLeaflet.LEAFLET_VISUALIZER_TYPE,
      name: 'Leaflet Map',
    });

    // Three.js Visualizers
    this.registerObjectState({
      id: 'cubeVizId',
      type: VizCubeSampleThreeJS.CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE,
      name: 'Three.js Cube Sample',
    });

    this.registerObjectState({
      id: 'helmetVizId',
      type: VizHelmetSampleThreeJS.HELMET_SAMPLE_THREEJS_VISUALIZER_TYPE,
      name: 'Three.js Helmet Sample',
    });

    // Chart.js Visualizers
    this.registerObjectState({
      id: 'barChartVizId',
      type: VizBarJSChart.BAR_JSCHART_VISUALIZER_TYPE,
      name: 'Bar Chart',
      series: createSeriesBar(),
    } as VizBarJSChartState);

    this.registerObjectState({
      id: 'lineChartVizId',
      type: VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE,
      series: createSeriesLine(),
      name: 'Line Chart',
    } as VizLineJSChartState);

    // Logger Visualizers
    this.registerObjectState({
      id: 'loggerVizId',
      type: VizEventLogger.EVENT_LOGGER_VISUALIZER_TYPE,
      name: 'Event Logger',
    });

    // Time Visualizers
    this.registerObjectState({
      id: 'clock1VizId',
      type: DigitalClock.DIGITAL_CLOCK_VISUALIZER_TYPE,
      name: 'Digital Clock',
    });

    this.registerObjectState({
      id: 'clock2VizId',
      type: AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE,
      name: 'Analog Clock',
    });

    this.registerObjectState({
      id: 'timeControllerVizId',
      type: TimeController.TIME_CONTROLLER_VISUALIZER_TYPE,
      name: 'Time Controller',
    });

    // Spatial Loaders
    this.registerObjectState({
      id: 'satelliteLoaderVizId',
      type: VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE,
      name: 'Satellite Loader',
    });

    this.registerObjectState({
      id: 'groundStationLoaderVizId',
      type: VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE,
      name: 'Ground Station Loader',
    });

    // Fetch Visualizer
    this.registerObjectState({
      id: 'fetchVizId',
      type: VizFetch.FETCH_VISUALIZER_TYPE,
      name: 'Data Fetcher',
    });

    // Catalog Visualizers
    this.registerObjectState({
      id: 'satcat1VizId',
      type: VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
      name: 'Satellite Catalog 1',
    });

    this.registerObjectState({
      id: 'satcat2VizId',
      type: VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
      name: 'Satellite Catalog 2',
    });

    this.registerObjectState({
      id: 'groundStationCatalogVizId',
      type: VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE,
      name: 'Ground Station Catalog',
    });

    this.registerObjectState({
      id: 'aisLoaderVizId',
      type: VIZ_AIS_LOADER_TYPE,
      name: 'AIS Loader',
    } as VizAISLoaderState);

    this.registerObjectState({
      id: 'aisCatalogVizId',
      type: VIZ_AIS_CATALOG_TABULATOR_TYPE,
      name: 'AIS Catalog',
    } as VizAISCatalogTabulatorState);
  }

  /**
   * DESKTOP1
   */
  public createDesktops1(): ZirconDesktopState {
    const barChartState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Bar Chart',
      left: 10,
      top: 10,
      width: 320,
      height: 520,
      vizId: 'barChartVizId',
    };
    this.registerObjectState(barChartState);
    const helmetState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Helmet 3D',
      left: 350,
      top: 10,
      width: 320,
      height: 520,
      vizId: 'helmetVizId',
    };
    this.registerObjectState(helmetState);
    const cubeState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Cube3D',
      left: 700,
      top: 10,
      width: 320,
      height: 520,
      vizId: 'cubeVizId',
    };
    this.registerObjectState(cubeState);
    const globusState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Globus',
      left: 510,
      top: 550,
      width: 520,
      height: 520,
      vizId: 'globusVizId',
    };
    this.registerObjectState(globusState);

    const clock2State: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Clock2',
      left: 50,
      top: 550,
      width: 385,
      height: 420,
      vizId: 'clock2VizId',
    };
    this.registerObjectState(clock2State);

    const desktop1State: ZirconDesktopState = {
      type: ZIRCON_DESKTOP_TYPE,
      id: `desktop1-${uuid()}`,
      name: 'Desktop 1',
      windowIds: [
        barChartState.id,
        helmetState.id,
        cubeState.id,
        globusState.id,
        clock2State.id,
      ],
    };
    this.registerObjectState(desktop1State);
    return desktop1State;
  }

  /**
   * DESKTOP2
   */
  public createDesktops2(): ZirconDesktopState {
    const lineChartState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Line Chart',
      left: 10,
      top: 550,
      width: 320,
      height: 520,
      vizId: 'lineChartVizId',
    };
    this.registerObjectState(lineChartState);

    const leafletState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Leaflet',
      left: 350,
      top: 550,
      width: 320,
      height: 520,
      vizId: 'leafletVizId',
    };
    // createVisualizerLeafletJS(),
    this.registerObjectState(leafletState);

    const fetchState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'fetch',
      left: 350,
      top: 550,
      width: 320,
      height: 520,
      vizId: 'fetchVizId',
    };
    // createVisualizerFetch(),
    this.registerObjectState(fetchState);

    const loggerState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Logger',
      left: 710,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'loggerVizId',
    };
    // createVisualizerLogger(),
    this.registerObjectState(loggerState);

    const clock1State: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Clock 1',
      left: 100,
      top: 10,
      width: 250,
      height: 200,
      vizId: 'clock1VizId',
    };
    // window.setContentObject(digitalClock);
    this.registerObjectState(clock1State);

    const timeControllerState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Time Controller',
      left: 50,
      top: 220,
      width: 400,
      height: 300,
      vizId: 'timeControllerVizId',
    };
    //const timeController = new TimeController();
    this.registerObjectState(timeControllerState);

    const desktop2State: ZirconDesktopState = {
      type: ZIRCON_DESKTOP_TYPE,
      id: `desktop2-${uuid()}`,
      name: 'Desktop 2',
      windowIds: [
        timeControllerState.id,
        clock1State.id,
        loggerState.id,
        fetchState.id,
        leafletState.id,
        lineChartState.id,
      ],
    };
    this.registerObjectState(desktop2State);
    return desktop2State;
  }

  /**
   * DESKTOP3
   */
  public createDesktops3(): ZirconDesktopState {
    const satcat1WindowState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Satellite Catalog 1',
      left: 100,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'satcat1VizId',
    };
    this.registerObjectState(satcat1WindowState);

    const satcat2WindowState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Satellite Catalog 2',
      left: 710,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'satcat2VizId',
    };
    this.registerObjectState(satcat2WindowState);

    const satelliteLoaderWindowState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Satellite Loader',
      left: 1320,
      top: 10,
      width: 385,
      height: 220,
      vizId: 'satelliteLoaderVizId',
    };
    // window4.setContentObject(new VizSatelliteLoader());
    this.registerObjectState(satelliteLoaderWindowState);

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
    this.registerObjectState(desktop3State);
    return desktop3State;
  }

  /**
   * DESKTOP4
   */
  public createDesktops4(): ZirconDesktopState {
    const groundStationLoaderWindowState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Ground Station Loader',
      left: 1320,
      top: 270,
      width: 385,
      height: 220,
      vizId: 'groundStationLoaderVizId',
    };
    this.registerObjectState(groundStationLoaderWindowState);

    const groundStationCatalog1WindowState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Ground Station Catalog 1',
      left: 100,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'groundStationCatalogVizId',
    };
    this.registerObjectState(groundStationCatalog1WindowState);

    const groundStationCatalog2WindowState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Ground Station Catalog 2',
      left: 710,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'groundStationCatalogVizId',
    };
    this.registerObjectState(groundStationCatalog2WindowState);

    const desktop4State: ZirconDesktopState = {
      type: ZIRCON_DESKTOP_TYPE,
      id: `desktop4-${uuid()}`,
      name: 'Spatial',
      windowIds: [
        groundStationLoaderWindowState.id,
        groundStationCatalog1WindowState.id,
        groundStationCatalog2WindowState.id,
      ],
    };
    this.registerObjectState(desktop4State);
    return desktop4State;
  }

  /**
   * DESKTOP5
   */
  public createDesktops5(): ZirconDesktopState {
    const AISLoaderWindowState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'AIS Loader',
      left: 20,
      top: 270,
      width: 385,
      height: 220,
      vizId: 'aisLoaderVizId',
    };
    this.registerObjectState(AISLoaderWindowState);
    const AISCatalogWindowState: ZirconVizWindowState = {
      type: ZIRCON_VISUALIZER_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'AIS Catalog',
      left: 710,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'aisCatalogVizId',
    };
    this.registerObjectState(AISCatalogWindowState);

    const desktop5State: ZirconDesktopState = {
      type: ZIRCON_DESKTOP_TYPE,
      id: `desktop5-${uuid()}`,
      name: 'Maritime',
      windowIds: [AISLoaderWindowState.id, AISCatalogWindowState.id],
    };
    this.registerObjectState(desktop5State);
    return desktop5State;
  }
}

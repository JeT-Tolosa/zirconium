import './sharp-eye.css';
import {
  ZIRCON_WINDOW_TYPE,
  ZirconWindowState,
} from '../zirconium/zircon-ui/zircon-window';
import { v4 as uuid } from 'uuid';
import {
  ZIRCON_DESKTOP_TYPE,
  ZirconDesktopState,
} from '../zirconium/zircon-ui/zircon-desktop';
import { ZirconApplication } from '../zirconium/zircon-core/zircon-app';
import { SatelliteCatalogEngine } from './engines/spatial/satellite-catalog-engine';
import { GroundStationCatalogEngine } from './engines/spatial/ground-station-catalog-engine';
import { TimeManager } from './engines/timing/timing';
import { VizFetchFactory } from '../zircon-visualizers/fetch/viz-eye-fetch-factory';
import {
  ZIRCON_DESKTOP_MANAGER_TYPE,
  ZirconDesktopManagerState,
} from '../zirconium/zircon-ui/zircon-desktop-manager';

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

export class SharpEyedApp extends ZirconApplication {
  private _timeManager: TimeManager = null;
  private _satcat: SatelliteCatalogEngine = null;
  private _gscat: GroundStationCatalogEngine = null;

  /**
   * constructor
   */
  constructor() {
    super('Sharp Eye');
    this._timeManager = new TimeManager();
    this._satcat = new SatelliteCatalogEngine('Satellites Catalog');
    this._gscat = new GroundStationCatalogEngine('Ground Station Catalog');
    this.setUIClass('sharp-eye-ui');
  }

  public create(): void {
    this.registerVisualizers();
    this.registerVisualizerStates();

    const desktopManagerState: ZirconDesktopManagerState = {
      type: ZIRCON_DESKTOP_MANAGER_TYPE,
      id: `window-${uuid()}`,
      desktopIds: [
        this.createDesktops1().id,
        this.createDesktops2().id,
        this.createDesktops3().id,
        this.createDesktops4().id,
      ],
    };
    this.registerState(desktopManagerState);
  }

  public registerVisualizers(): void {
    // 3D Visualizers
    this.registerObjectFactory(new VizCesiumFactory());
    this.registerObjectFactory(new VizLeafletFactory());
    this.registerObjectFactory(new VizOpenGlobusFactory());

    // Three.js Visualizers
    this.registerObjectFactory(new VizCubeSampleThreeJSFactory());
    this.registerObjectFactory(new VizHelmetSampleThreeJSFactory());

    // Chart.js Visualizers
    this.registerObjectFactory(new VizBarJSChartFactory());
    this.registerObjectFactory(new VizBubbleJSChartFactory());
    this.registerObjectFactory(new VizLineJSChartFactory());
    this.registerObjectFactory(new VizPieJSChartFactory());
    this.registerObjectFactory(new VizRadarJSChartFactory());
    this.registerObjectFactory(new VizScatterJSChartFactory());

    // Logger Visualizers
    this.registerObjectFactory(new VizEventLoggerFactory());
    this.registerObjectFactory(new VizMessageLoggerFactory());

    // Time Visualizers
    this.registerObjectFactory(new DigitalClockFactory());
    this.registerObjectFactory(new AnalogClockFactory());
    this.registerObjectFactory(new TimeControllerFactory());

    // Spatial Loaders
    this.registerObjectFactory(new VizSatCatLoaderFactory());
    this.registerObjectFactory(new VizGroundStationLoaderFactory());

    // Spatial Catalogs
    this.registerObjectFactory(new VizSatelliteCatalogTabulatorFactory());
    this.registerObjectFactory(new VizGroundStationCatalogTabulatorFactory());

    // Existing Fetch Visualizer
    this.registerObjectFactory(new VizFetchFactory());
  }

  public registerVisualizerStates(): void {
    // 3D Visualizers
    this.registerState({
      id: 'globusVizId',
      type: VizOpenGlobus.OPENGLOBUS_VISUALIZER_TYPE,
      name: 'OpenGlobus Globe',
    });

    this.registerState({
      id: 'leafletVizId',
      type: VizLeaflet.LEAFLET_VISUALIZER_TYPE,
      name: 'Leaflet Map',
    });

    // Three.js Visualizers
    this.registerState({
      id: 'cubeVizId',
      type: VizCubeSampleThreeJS.CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE,
      name: 'Three.js Cube Sample',
    });

    this.registerState({
      id: 'helmetVizId',
      type: VizHelmetSampleThreeJS.HELMET_SAMPLE_THREEJS_VISUALIZER_TYPE,
      name: 'Three.js Helmet Sample',
    });

    // Chart.js Visualizers
    this.registerState({
      id: 'barChartVizId',
      type: VizBarJSChart.BAR_JSCHART_VISUALIZER_TYPE,
      name: 'Bar Chart',
      series: createSeriesBar(),
    } as VizBarJSChartState);

    this.registerState({
      id: 'lineChartVizId',
      type: VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE,
      series: createSeriesLine(),
      name: 'Line Chart',
    } as VizLineJSChartState);

    // Logger Visualizers
    this.registerState({
      id: 'loggerVizId',
      type: VizEventLogger.EVENT_LOGGER_VISUALIZER_TYPE,
      name: 'Event Logger',
    });

    // Time Visualizers
    this.registerState({
      id: 'clock1VizId',
      type: DigitalClock.DIGITAL_CLOCK_VISUALIZER_TYPE,
      name: 'Digital Clock',
    });

    this.registerState({
      id: 'clock2VizId',
      type: AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE,
      name: 'Analog Clock',
    });

    this.registerState({
      id: 'timeControllerVizId',
      type: TimeController.TIME_CONTROLLER_VISUALIZER_TYPE,
      name: 'Time Controller',
    });

    // Spatial Loaders
    this.registerState({
      id: 'satelliteLoaderVizId',
      type: VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE,
      name: 'Satellite Loader',
    });

    this.registerState({
      id: 'groundStationVizId',
      type: VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE,
      name: 'Ground Station Loader',
    });

    // Fetch Visualizer
    this.registerState({
      id: 'fetchVizId',
      type: VizFetch.FETCH_VISUALIZER_TYPE,
      name: 'Data Fetcher',
    });

    // Catalog Visualizers
    this.registerState({
      id: 'satcat1VizId',
      type: VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
      name: 'Satellite Catalog 1',
    });

    this.registerState({
      id: 'satcat2VizId',
      type: VizSatelliteCatalogTabulator.VIZ_SATELLITE_CATALOG_TABULATOR_TYPE,
      name: 'Satellite Catalog 2',
    });

    this.registerState({
      id: 'groundStationCatalogVizId',
      type: VizGroundStationCatalogTabulator.VIZ_GROUND_STATION_CATALOG_TABULATOR_TYPE,
      name: 'Ground Station Catalog',
    });
  }

  /**
   * DESKTOP1
   */
  public createDesktops1(): ZirconDesktopState {
    const barChartState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Bar Chart',
      left: 10,
      top: 10,
      width: 320,
      height: 520,
      vizId: 'barChartVizId',
    };
    this.registerState(barChartState);
    const helmetState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Helmet 3D',
      left: 350,
      top: 10,
      width: 320,
      height: 520,
      vizId: 'helmetVizId',
    };
    this.registerState(helmetState);
    const cubeState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Cube3D',
      left: 700,
      top: 10,
      width: 320,
      height: 520,
      vizId: 'cubeVizId',
    };
    this.registerState(cubeState);
    const globusState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Globus',
      left: 510,
      top: 550,
      width: 520,
      height: 520,
      vizId: 'globusVizId',
    };
    this.registerState(globusState);

    const clock2State: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Clock2',
      left: 50,
      top: 550,
      width: 385,
      height: 420,
      vizId: 'clock2VizId',
    };
    this.registerState(clock2State);

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
    this.registerState(desktop1State);
    return desktop1State;
  }

  /**
   * DESKTOP2
   */
  public createDesktops2(): ZirconDesktopState {
    const lineChartState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Line Chart',
      left: 10,
      top: 550,
      width: 320,
      height: 520,
      vizId: 'lineChartVizId',
    };
    this.registerState(lineChartState);

    const leafletState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Leaflet',
      left: 350,
      top: 550,
      width: 320,
      height: 520,
      vizId: 'leafletVizId',
    };
    // createVisualizerLeafletJS(),
    this.registerState(leafletState);

    const fetchState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'fetch',
      left: 350,
      top: 550,
      width: 320,
      height: 520,
      vizId: 'fetchVizId',
    };
    // createVisualizerFetch(),
    this.registerState(fetchState);

    const loggerState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Logger',
      left: 710,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'loggerVizId',
    };
    // createVisualizerLogger(),
    this.registerState(loggerState);

    const clock1State: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Clock 1',
      left: 100,
      top: 10,
      width: 250,
      height: 200,
      vizId: 'clock1VizId',
    };
    // window.setContentObject(digitalClock);
    this.registerState(clock1State);

    const timeControllerState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Time Controller',
      left: 50,
      top: 220,
      width: 400,
      height: 300,
      vizId: 'timeControllerVizId',
    };
    //const timeController = new TimeController();
    this.registerState(timeControllerState);

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
    this.registerState(desktop2State);
    return desktop2State;
  }

  /**
   * DESKTOP3
   */
  public createDesktops3(): ZirconDesktopState {
    const satcat1WindowState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Satellite Catalog 1',
      left: 100,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'satcat1VizId',
    };
    //const timeController = new TimeController();
    this.registerState(satcat1WindowState);

    const satcat2WindowState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Satellite Catalog 2',
      left: 710,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'satcat2VizId',
    };
    // createVisualizerSatelliteCatalog(),
    this.registerState(satcat2WindowState);

    const satelliteLoaderWindowState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Satellite Loader',
      left: 1320,
      top: 10,
      width: 385,
      height: 220,
      vizId: 'satelltieLoaderVizId',
    };
    // window4.setContentObject(new VizSatelliteLoader());
    this.registerState(satelliteLoaderWindowState);

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
    this.registerState(desktop3State);
    return desktop3State;
  }

  /**
   * DESKTOP4
   */
  public createDesktops4(): ZirconDesktopState {
    const groundStationLoaderWindowState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Ground Station Loader',
      left: 1320,
      top: 270,
      width: 385,
      height: 220,
      vizId: 'groundStationVizId',
    };
    // window5.setContentObject(new VizGroundStationLoader());
    this.registerState(groundStationLoaderWindowState);

    const groundStationCatalog1WindowState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Ground Station Catalog 1',
      left: 100,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'groundStationCatalogVizId',
    };
    // createVisualizerGroundStationCatalog(),
    this.registerState(groundStationCatalog1WindowState);

    const groundStationCatalog2WindowState: ZirconWindowState = {
      type: ZIRCON_WINDOW_TYPE,
      id: `window-${uuid()}`,
      title: 'Ground Station Catalog 2',
      left: 710,
      top: 10,
      width: 600,
      height: 1080,
      vizId: 'groundStationCatalogVizId',
    };
    // createVisualizerGroundStationCatalog(),
    this.registerState(groundStationCatalog2WindowState);

    const desktop4State: ZirconDesktopState = {
      type: ZIRCON_DESKTOP_TYPE,
      id: `desktop4-${uuid()}`,
      name: 'Desktop 4',
      windowIds: [
        groundStationLoaderWindowState.id,
        groundStationCatalog1WindowState.id,
        groundStationCatalog2WindowState.id,
      ],
    };
    this.registerState(desktop4State);
    return desktop4State;
  }
}

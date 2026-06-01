import { SharpEyedApp } from '../sharp-eye-app';
import { v4 as uuid } from 'uuid';
import { ZirconVizWindowState } from '../../zirconium/zircon-ui/zircon-viz-window';
import { ZirconDesktopState } from '../../zirconium/zircon-ui/zircon-desktop';
import { TimeControllerFactory } from '../../zircon-visualizers/time/time-controller-factory';
import { DigitalClockFactory } from '../../zircon-visualizers/time/digital-clock-factory';
import { VizEventLoggerFactory } from '../../zircon-visualizers/logger/viz-eye-event-logger-factory';
import { VizFetchFactory } from '../../zircon-visualizers/fetch/viz-eye-fetch-factory';
import { VizLeafletFactory } from '../../zircon-visualizers/leaflet/viz-eye-leaflet-factory';
import { VizLineJSChartFactory } from '../../zircon-visualizers/jschart/line-jschart-factory';
import {
  VizLineJSChart,
  VizLineJSChartState,
} from '../../zircon-visualizers/jschart/line-jschart';
import { createSeriesLine } from '.././sharp-eye-panels';
import {
  VizEventLogger,
  VizEventLoggerState,
} from '../../zircon-visualizers/logger/viz-eye-event-logger';
import {
  DigitalClock,
  DigitalClockState,
} from '../../zircon-visualizers/time/digital-clock';
import { TimingHelper } from '../../libraries/timing/timing';
import {
  VizFetch,
  VizFetchState,
} from '../../zircon-visualizers/fetch/viz-eye-fetch';
import {
  VizLeaflet,
  VizLeafletState,
} from '../../zircon-visualizers/leaflet/viz-eye-leaflet';
import {
  TimeController,
  TimeControllerState,
} from '../../zircon-visualizers/time/time-controller';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../../zirconium/zircon-core/zircon-types';

/**
 * DESKTOP2
 */
export async function createDesktop2(
  app: SharpEyedApp,
): Promise<ZirconDesktopState> {
  await app.registerObjectFactory(new TimeControllerFactory());
  await app.registerObjectFactory(new DigitalClockFactory());
  await app.registerObjectFactory(new VizEventLoggerFactory());
  await app.registerObjectFactory(new VizFetchFactory());
  await app.registerObjectFactory(new VizLeafletFactory());
  await app.registerObjectFactory(new VizLineJSChartFactory());

  const lineChartVizState: VizLineJSChartState = {
    id: 'lineChartVizId',
    type: VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE,
    series: createSeriesLine(),
    name: 'Line Chart',
  };

  app.registerObjectState(lineChartVizState);

  const loggerVizState: VizEventLoggerState = {
    id: 'loggerVizId',
    type: VizEventLogger.EVENT_LOGGER_VISUALIZER_TYPE,
    name: 'Event Logger',
  };
  app.registerObjectState(loggerVizState);

  // Time Visualizers
  const clock1VizState: DigitalClockState = {
    id: 'clock1VizId',
    type: DigitalClock.DIGITAL_CLOCK_VISUALIZER_TYPE,
    timeZoneOffset: +2,
    timeSource: null,
    locationName: 'Paris',
    name: 'Digital Clock',
  };
  app.registerObjectState(clock1VizState);

  const timeControllerVizState: TimeControllerState = {
    id: 'timeControllerVizId',
    type: TimeController.TIME_CONTROLLER_VISUALIZER_TYPE,
    name: 'Time Controller',
    timeDescriptorId: TimingHelper.MAIN_TIME_SOURCE_ID,
  };
  app.registerObjectState(timeControllerVizState);

  // Fetch Visualizer
  const fetchVizState: VizFetchState = {
    id: 'fetchVizId',
    type: VizFetch.FETCH_VISUALIZER_TYPE,
    name: 'Data Fetcher',
  };
  app.registerObjectState(fetchVizState);

  const leafletVizState: VizLeafletState = {
    id: 'leafletVizId',
    type: VizLeaflet.LEAFLET_VISUALIZER_TYPE,
    name: 'Leaflet Map',
  };
  app.registerObjectState(leafletVizState);

  const leafletWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Leaflet',
    left: 350,
    top: 550,
    width: 320,
    height: 520,
    vizId: leafletVizState.id,
  };

  const lineChartWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Line Chart',
    left: 10,
    top: 550,
    width: 320,
    height: 520,
    vizId: lineChartVizState.id,
  };
  app.registerObjectState(lineChartWindowState);

  // createVisualizerLeafletJS(),
  app.registerObjectState(leafletWindowState);

  const fetchWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'fetch',
    left: 350,
    top: 550,
    width: 320,
    height: 520,
    vizId: fetchVizState.id,
  };
  // createVisualizerFetch(),
  app.registerObjectState(fetchWindowState);

  const loggerWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Logger',
    left: 280,
    top: 10,
    width: 400,
    height: 480,
    vizId: loggerVizState.id,
  };
  // createVisualizerLogger(),
  app.registerObjectState(loggerWindowState);

  const clock1WindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Clock 1',
    left: 20,
    top: 10,
    width: 250,
    height: 200,
    vizId: clock1VizState.id,
  };
  // window.setContentObject(digitalClock);
  app.registerObjectState(clock1WindowState);

  const timeControllerWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Time Controller',
    left: 850,
    top: 10,
    width: 500,
    height: 650,
    vizId: timeControllerVizState.id,
  };
  //const timeController = new TimeController();
  app.registerObjectState(timeControllerWindowState);

  const desktop2State: ZirconDesktopState = {
    type: ZIRCON_DESKTOP_TYPE,
    id: `desktop2-${uuid()}`,
    name: 'Desktop 2',
    windowIds: [
      timeControllerWindowState.id,
      clock1WindowState.id,
      loggerWindowState.id,
      fetchWindowState.id,
      leafletWindowState.id,
      lineChartWindowState.id,
    ],
  };
  app.registerObjectState(desktop2State);
  return Promise.resolve(desktop2State);
}

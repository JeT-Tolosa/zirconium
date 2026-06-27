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
  VizEventLogger,
  VizEventLoggerState,
} from '../../zircon-visualizers/logger/viz-eye-event-logger';
import {
  VizFetch,
  VizFetchState,
} from '../../zircon-visualizers/fetch/viz-eye-fetch';
import {
  VizLeaflet,
  VizLeafletState,
} from '../../zircon-visualizers/leaflet/viz-eye-leaflet';
import {
  ZIRCON_DATA_PROVIDER_TYPE,
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../../zirconium/zircon-core/zircon-types';
import {
  VizLineJSChart,
  VizLineJSChartState,
} from '../../zircon-visualizers/jschart/line-jschart';
import { DataProviderChartJS } from '../../zircon-visualizers/jschart/jschart-data-provider';
import { VIZ_JSCHART_REGISTRY } from '../../zircon-visualizers/jschart/viz-jschart-types';
import { ZirconDataProviderState } from '../../zirconium/zircon-data/zircon-data-provider';
import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';
import { ChartData, ChartOptions } from 'chart.js';

function lineChartOptions(): ChartOptions<'line'> {
  return {
    animation: false,
    responsive: true,
    scales: {
      x: {
        display: false,
      },
      y: {
        min: -1.5,
        max: 1.5,
      },
    },
  };
}

function registerDataProviderLine(
  app: ZirconApplication,
): DataProviderChartJS<'line'> {
  const state: ZirconDataProviderState = {
    id: 'line-data-provider',
    name: 'line-data-provider',
    type: ZIRCON_DATA_PROVIDER_TYPE,
    outputDataType: VIZ_JSCHART_REGISTRY['line'].dataType,
  };
  const data: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        label: 'Signal',
        data: [],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79,70,229,0.15)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
        fill: true,
      },
    ],
  };
  const dataProvider: DataProviderChartJS<'line'> =
    new DataProviderChartJS<'line'>('line', state);
  dataProvider.setData(data);

  app.registerDataProviderFactory(`${state.id}-factory`, state.outputDataType);
  app.getDataProviderManager().registerDataProvider(dataProvider);

  return dataProvider;
}

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

  const dataProviderLine: DataProviderChartJS<'line'> =
    registerDataProviderLine(app);

  const lineChartVizState: VizLineJSChartState = {
    id: 'lineChartVizId',
    type: VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE,
    chartType: 'line',
    name: 'Line Chart',
    chartOptions: lineChartOptions(),
    dataProviderId: dataProviderLine.getId(),
  };

  app.registerObjectState(lineChartVizState);

  const loggerVizState: VizEventLoggerState = {
    id: 'loggerVizId',
    type: VizEventLogger.EVENT_LOGGER_VISUALIZER_TYPE,
    name: 'Event Logger',
  };
  app.registerObjectState(loggerVizState);

  // Time Visualizers

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
    vizIds: [leafletVizState.id],
  };

  // const lineChartWindowState: ZirconVizWindowState = {
  //   type: ZIRCON_VISUALIZER_WINDOW_TYPE,
  //   id: `window-${uuid()}`,
  //   title: 'Line Chart',
  //   left: 10,
  //   top: 550,
  //   width: 320,
  //   height: 520,
  //   vizIds: [lineChartVizState.id],
  // };
  // app.registerObjectState(lineChartWindowState);

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
    vizIds: [fetchVizState.id],
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
    vizIds: [loggerVizState.id],
  };
  // createVisualizerLogger(),
  app.registerObjectState(loggerWindowState);

  const desktop2State: ZirconDesktopState = {
    type: ZIRCON_DESKTOP_TYPE,
    id: `desktop2-${uuid()}`,
    name: 'Desktop 2',
    windowIds: [
      loggerWindowState.id,
      fetchWindowState.id,
      leafletWindowState.id,
      // lineChartWindowState.id,
    ],
  };
  app.registerObjectState(desktop2State);
  return Promise.resolve(desktop2State);
}

import { SharpEyedApp } from '../sharp-eye-app';
import { v4 as uuid } from 'uuid';
import { ZirconVizWindowState } from '../../zirconium/zircon-ui/zircon-viz-window';
import { ZirconDesktopState } from '../../zirconium/zircon-ui/zircon-desktop';

import { VizThreeJSState } from '../../zircon-visualizers/threeJS/viz-eye-threeJS';
import {
  VizCubeSampleThreeJS,
  VizCubeSampleThreeJSState,
} from '../../zircon-visualizers/threeJS/viz-eye-cube-sample-threeJS';
import { VizHelmetSampleThreeJS } from '../../zircon-visualizers/threeJS/viz-eye-helmet-sample-threeJS';
import {
  VizBarJSChart,
  VizBarJSChartState,
} from '../../zircon-visualizers/jschart/bar-jschart';
import {
  AnalogClock,
  AnalogClockState,
} from '../../zircon-visualizers/time/analog-clock';
import { TimingHelper } from '../../libraries/timing/timing';
import {
  VizOpenGlobus,
  VizOpenGlobusState,
} from '../../zircon-visualizers/openglobus/viz-eye-openglobus';
import {
  ZIRCON_DESKTOP_TYPE,
  ZIRCON_VISUALIZER_WINDOW_TYPE,
} from '../../zirconium/zircon-core/zircon-types';
import { VizBarJSChartFactory } from '../../zircon-visualizers/jschart/bar-jschart-factory';
import { AnalogClockFactory } from '../../zircon-visualizers/time/analog-clock-factory';
import { VizCubeSampleThreeJSFactory } from '../../zircon-visualizers/threeJS/viz-eye-cube-sample-threeJS-factory';
import { VizHelmetSampleThreeJSFactory } from '../../zircon-visualizers/threeJS/viz-eye-helmet-sample-threeJS-factory';
import { VizOpenGlobusFactory } from '../../zircon-visualizers/openglobus/viz-eye-openglobus-factory';
import { ZirconDataProviderState } from '../../zirconium/zircon-data/zircon-data-provider';
import { ZIRCON_DATA_PROVIDER_TYPE } from '../../zirconium/zircon-core/zircon-types';
import { DataProviderChartJS } from '../../zircon-visualizers/jschart/jschart-data-provider';
import { ChartData, ChartOptions } from 'chart.js';
import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';
import { VIZ_JSCHART_REGISTRY } from '../../zircon-visualizers/jschart/viz-jschart-types';

function barChartOptions(): ChartOptions<'bar'> {
  return {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Évolution du chiffre d’affaires 2025',
        font: {
          size: 20,
          weight: 'bold',
        },
        padding: {
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: '#111827',
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context) => context.parsed.y.toLocaleString('fr-FR') + ' €',
        },
      },
    },

    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#E5E7EB99',
        },
        ticks: {
          callback: (value) => value.toLocaleString('fr-FR') + ' €',
        },
      },
    },
  };
}

function registerDataProviderBar(
  app: ZirconApplication,
): DataProviderChartJS<'bar'> {
  const state: ZirconDataProviderState = {
    id: 'bar-data-provider',
    name: 'bar-data-provider',
    type: ZIRCON_DATA_PROVIDER_TYPE,
    outputDataType: VIZ_JSCHART_REGISTRY['bar'].dataType,
  };
  const data: ChartData<'bar'> = {
    labels: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin'],
    datasets: [
      {
        label: 'CA 2024',
        data: [10500, 14500, 13200, 17800, 21000, 24500],
        backgroundColor: '#406fb2',
        borderRadius: 4,
        borderSkipped: false,
      },
      {
        label: 'CA 2025',
        data: [12500, 19200, 15800, 24300, 28100, 32500],
        backgroundColor: '#e54646',
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };
  const dataProvider: DataProviderChartJS<'bar'> =
    new DataProviderChartJS<'bar'>('bar', state);
  dataProvider.setData(data);

  app.registerDataProviderFactory(`${state.id}-factory`, state.outputDataType);
  app.getDataProviderManager().registerDataProvider(dataProvider);

  return dataProvider;
}

export async function createDesktop1(
  app: SharpEyedApp,
): Promise<ZirconDesktopState> {
  await app.registerObjectFactory(new VizBarJSChartFactory());
  await app.registerObjectFactory(new AnalogClockFactory());
  await app.registerObjectFactory(new VizCubeSampleThreeJSFactory());
  await app.registerObjectFactory(new VizHelmetSampleThreeJSFactory());
  await app.registerObjectFactory(new VizOpenGlobusFactory());

  const dataProviderBar: DataProviderChartJS<'bar'> =
    registerDataProviderBar(app);

  // Chart.js Visualizers
  const barChartVizState: VizBarJSChartState = {
    id: 'barChartVizId',
    type: VizBarJSChart.BAR_JSCHART_VISUALIZER_TYPE,
    chartType: 'bar',
    name: 'Bar Chart',
    chartOptions: barChartOptions(),
    dataProviderId: dataProviderBar.getId(),
  };
  app.registerObjectState(barChartVizState);

  const clock2VizState: AnalogClockState = {
    id: 'clock2VizId',
    type: AnalogClock.ANALOG_CLOCK_VISUALIZER_TYPE,
    name: 'Analog Clock',
    timeSource: TimingHelper.MAIN_TIME_SOURCE_ID,
    timeZoneOffset: 0,
  };

  app.registerObjectState(clock2VizState);
  // 3D Visualizers
  const globusVizState: VizOpenGlobusState = {
    id: 'globusVizId',
    type: VizOpenGlobus.OPENGLOBUS_VISUALIZER_TYPE,
    name: 'OpenGlobus Globe',
  };
  app.registerObjectState(globusVizState);

  // Three.js Visualizers
  const cubeVizState: VizCubeSampleThreeJSState = {
    id: 'cubeVizId',
    type: VizCubeSampleThreeJS.CUBE_SAMPLE_THREEJS_VISUALIZER_TYPE,
    name: 'Three.js Cube Sample',
  };
  app.registerObjectState(cubeVizState);

  const helmetVizState: VizThreeJSState = {
    id: 'helmetVizId',
    type: VizHelmetSampleThreeJS.HELMET_SAMPLE_THREEJS_VISUALIZER_TYPE,
    name: 'Three.js Helmet Sample',
  };
  app.registerObjectState(helmetVizState);

  const barChartState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Bar Chart',
    left: 10,
    top: 10,
    width: 320,
    height: 520,
    vizId: barChartVizState.id,
  };
  app.registerObjectState(barChartState);
  const helmetState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Helmet 3D',
    left: 350,
    top: 10,
    width: 320,
    height: 520,
    vizId: helmetVizState.id,
  };
  app.registerObjectState(helmetState);
  const cubeState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Cube3D',
    left: 700,
    top: 10,
    width: 320,
    height: 520,
    vizId: cubeVizState.id,
  };
  app.registerObjectState(cubeState);
  const globusState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Globus',
    left: 510,
    top: 550,
    width: 520,
    height: 520,
    vizId: globusVizState.id,
  };
  app.registerObjectState(globusState);

  const clock2State: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Clock2',
    left: 50,
    top: 550,
    width: 385,
    height: 420,
    vizId: clock2VizState.id,
  };
  app.registerObjectState(clock2State);

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
  app.registerObjectState(desktop1State);
  return Promise.resolve(desktop1State);
}

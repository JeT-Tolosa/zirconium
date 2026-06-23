import { SharpEyedApp } from '../sharp-eye-app';
import { v4 as uuid } from 'uuid';
import { ZirconVizWindowState } from '../../zirconium/zircon-ui/zircon-viz-window';
import { ZirconDesktopState } from '../../zirconium/zircon-ui/zircon-desktop';
import { VizLineJSChartFactory } from '../../zircon-visualizers/jschart/line-jschart-factory';

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

function generateRRIntervals(
  bpm: number,
  durationSec: number,
  irregular: boolean = false,
) {
  const rrMean = 60 / bpm;
  const intervals = [];
  let t = 0;

  while (t < durationSec) {
    let rr = rrMean;

    if (irregular) {
      // variation ±25%
      rr *= 1 + (Math.random() - 0.5) * 0.5;
    }

    intervals.push(rr);
    t += rr;
  }

  return intervals;
}

function generateHeartSignal(
  bpm: number,
  durationSec: number,
  irregular: boolean = false,
  samplingRate: number = 100,
  systoleAmp: number = 1,
  diastoleAmp: number = 0.4,
) {
  const rr = generateRRIntervals(bpm, durationSec, irregular);
  const data = [];
  let t: number;
  let beatIndex = 0;
  const totalSamples = durationSec * samplingRate;
  for (let i = 0; i < totalSamples; i++) {
    t = i / samplingRate;
    // reposition beat index
    let beatTime = 0;
    for (let j = 0; j < beatIndex; j++) {
      beatTime += rr[j];
    }
    if (beatIndex < rr.length - 1 && t > beatTime + rr[beatIndex]) {
      beatIndex++;
    }
    beatTime = 0;
    for (let j = 0; j < beatIndex; j++) {
      beatTime += rr[j];
    }
    const dt = t - beatTime;
    // systole = gaussian narrow peak
    const systole = systoleAmp * Math.exp(-Math.pow(dt - 0.1, 2) / 0.0015);
    // diastole = broader wave
    const diastole = diastoleAmp * Math.exp(-Math.pow(dt - 0.4, 2) / 0.02);
    const signal = systole - diastole;
    data.push({ x: t, y: signal });
  }
  return data;
}

function cardiacChartOptions(): ChartOptions<'line'> {
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

const athleteSystole = generateHeartSignal(55, 10, false);
const athleteDiastole = generateHeartSignal(55, 10, false, 0.6, 0.5);
const arrhythmiaSystole = generateHeartSignal(80, 10, true);
const arrhythmiaDiastole = generateHeartSignal(80, 10, true, 0.6, 0.5);

function registerCardiacDataProviderLine(
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
        label: 'Athlete - Systole',
        data: athleteSystole,
        borderColor: 'red',
        fill: false,
      },
      {
        label: 'Athlete - Diastole',
        data: athleteDiastole,
        borderColor: 'blue',
        fill: false,
      },
      {
        label: 'Arrhythmie - Systole',
        data: arrhythmiaSystole,
        borderColor: 'orange',
        fill: false,
      },
      {
        label: 'Arrhythmie - Diastole',
        data: arrhythmiaDiastole,
        borderColor: 'purple',
        fill: false,
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
export async function createDesktop7(
  app: SharpEyedApp,
): Promise<ZirconDesktopState> {
  await app.registerObjectFactory(new VizLineJSChartFactory());

  const dataProviderLine: DataProviderChartJS<'line'> =
    registerCardiacDataProviderLine(app);

  const cardiacChartVizState: VizLineJSChartState = {
    id: 'cardiacChartVizId',
    type: VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE,
    chartType: 'line',
    name: 'Cardiac Chart',
    chartOptions: cardiacChartOptions(),
    dataProviderId: dataProviderLine.getId(),
  };

  const cardiacChartWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Caridac rythms',
    left: 280,
    top: 10,
    width: 400,
    height: 480,
    vizId: cardiacChartVizState.id,
  };
  // createVisualizerLogger(),
  app.registerObjectState(cardiacChartWindowState);

  const desktop7State: ZirconDesktopState = {
    type: ZIRCON_DESKTOP_TYPE,
    id: `desktop7-${uuid()}`,
    name: 'Medic',
    windowIds: [cardiacChartWindowState.id],
  };
  app.registerObjectState(desktop7State);
  return Promise.resolve(desktop7State);
}

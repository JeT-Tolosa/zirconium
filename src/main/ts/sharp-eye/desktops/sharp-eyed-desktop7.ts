/* eslint-disable @typescript-eslint/no-explicit-any */
import { SharpEyedApp } from '../sharp-eye-app';
import { v4 as uuid } from 'uuid';
import { ZirconVizWindowState } from '../../zirconium/zircon-ui/zircon-viz-window';
import { ZirconDesktopState } from '../../zirconium/zircon-ui/zircon-desktop';

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

interface RealtimeHeartState {
  currentTime: number;
  lastBeatTime: number;
  nextBeatTime: number;
  currentRR: number;
  cursor: number;
}

export class CardiacDataProvider extends DataProviderChartJS<'line'> {
  private static readonly BUFFER_SIZE = 250;

  public athleteSignal: { x: number; y: number }[] = [];
  public arrhythmiaSignal: { x: number; y: number }[] = [];

  private timer?: ReturnType<typeof setInterval>;

  private athleteState!: RealtimeHeartState;
  private arrhythmiaState!: RealtimeHeartState;

  constructor() {
    super('line', null);
    this.athleteSignal = this.createEmptyBuffer();
    this.arrhythmiaSignal = this.createEmptyBuffer();
    this.athleteState = this.createState(55, false);
    this.arrhythmiaState = this.createState(80, true);
    this.start();
  }

  public getChartData(): ChartData<'line'> {
    return {
      datasets: [
        {
          label: 'Athlète',
          data: this.athleteSignal,
          borderColor: '#2563eb',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.25,
          parsing: false,
          spanGaps: false,
        },
        {
          label: 'Arythmie',
          data: this.arrhythmiaSignal,
          borderColor: '#dc2626',
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.25,
          parsing: false,
          spanGaps: false,
        },
      ],
    };
  }

  public override async start(): Promise<void> {
    this.stopRealtimeAnimation();
    this.timer = setInterval(() => {
      this.updateSignal(this.athleteSignal, this.athleteState, 55, false);
      this.updateSignal(this.arrhythmiaSignal, this.arrhythmiaState, 80, true);
      this.setData(this.getChartData());
    }, 10);
  }

  public override async stop(): Promise<void> {
    this.stopRealtimeAnimation();
  }

  private stopRealtimeAnimation(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private createEmptyBuffer(): { x: number; y: number }[] {
    return Array.from({ length: CardiacDataProvider.BUFFER_SIZE }, (_, i) => ({
      x: i,
      y: NaN,
    }));
  }

  private createState(bpm: number, irregular: boolean): RealtimeHeartState {
    const rr = CardiacDataProvider.nextRR(bpm, irregular);

    return {
      currentTime: 0,
      lastBeatTime: 0,
      currentRR: rr,
      nextBeatTime: rr,
      cursor: 0,
    };
  }

  private static nextRR(bpm: number, irregular: boolean): number {
    let rr = 60 / bpm;
    if (!irregular) {
      return rr;
    }
    // variation normale
    rr *= 1 + (Math.random() - 0.5) * 0.5;
    // extrasystole
    if (Math.random() < 0.05) {
      rr *= 0.55;
    }
    // battement manqué
    if (Math.random() < 0.03) {
      rr *= 1.9;
    }
    return rr;
  }

  private static computeHeartbeat(
    dt: number,
    systoleAmp: number,
    diastoleAmp: number,
  ): number {
    const systole = systoleAmp * Math.exp(-Math.pow(dt - 0.1, 2) / 0.0015);
    const diastole = diastoleAmp * Math.exp(-Math.pow(dt - 0.4, 2) / 0.02);
    const noise = (Math.random() - 0.5) * 0.02;
    return systole - diastole + noise;
  }

  private updateSignal(
    dataset: { x: number; y: number }[],
    state: RealtimeHeartState,
    bpm: number,
    irregular: boolean,
  ): void {
    state.currentTime += 0.01;
    while (state.currentTime >= state.nextBeatTime) {
      state.lastBeatTime = state.nextBeatTime;
      state.currentRR = CardiacDataProvider.nextRR(bpm, irregular);
      state.nextBeatTime += state.currentRR;
    }

    const dt = state.currentTime - state.lastBeatTime;
    let systoleAmp = 1;
    if (irregular) {
      systoleAmp = 0.7 + Math.random() * 0.6;
    }

    const y = CardiacDataProvider.computeHeartbeat(dt, systoleAmp, 0.4);
    dataset[state.cursor].y = y;

    // rupture du tracé pour éviter
    // la ligne entre fin et début du buffer

    const breakIndex = (state.cursor + 1) % CardiacDataProvider.BUFFER_SIZE;
    dataset[breakIndex].y = NaN;
    state.cursor = (state.cursor + 1) % CardiacDataProvider.BUFFER_SIZE;
  }
}

function cardiacChartOptions(): ChartOptions<'line'> {
  return {
    normalized: true,
    parsing: false,
    responsive: true,
    maintainAspectRatio: false,
    animation: false,

    scales: {
      x: {
        type: 'linear',
        min: 0,
        max: 250,
      },

      y: {
        min: -0.5,
        max: 1.1,
        title: {
          display: true,
          text: 'y',
        },
      },
    },

    plugins: {
      legend: {
        display: true,
      },
    },

    elements: {
      point: {
        radius: 0, // cache les points
      },
      line: {
        tension: 0, // segments droits
      },
    },
  };
}

function registerCardiacDataProviderLine(
  app: ZirconApplication,
): DataProviderChartJS<'line'> {
  const state: ZirconDataProviderState = {
    id: 'cardiac-line-data-provider',
    name: 'cardiac-line-data-provider',
    type: ZIRCON_DATA_PROVIDER_TYPE,
    outputDataType: VIZ_JSCHART_REGISTRY['line'].dataType,
  };

  const dataProvider: CardiacDataProvider = new CardiacDataProvider();
  dataProvider.setData(dataProvider.getChartData());

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
  // already exists in desktop2
  // await app.registerObjectFactory(new VizLineJSChartFactory());

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
  app.registerObjectState(cardiacChartVizState);

  const cardiacChartWindowState: ZirconVizWindowState = {
    type: ZIRCON_VISUALIZER_WINDOW_TYPE,
    id: `window-${uuid()}`,
    title: 'Cardiac rythms',
    left: 280,
    top: 10,
    width: 400,
    height: 480,
    vizIds: [cardiacChartVizState.id],
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

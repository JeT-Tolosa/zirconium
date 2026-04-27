import { VizBarJSChart } from '../zircon-visualizers/jschart/bar-jschart';
import { DataSeries } from '../libraries/data-series/data-series';
import { ChartData } from 'chart.js';
import { VizCesium } from '../zircon-visualizers/cesium/viz-eye-cesium';
import { VizCubeSampleThreeJS } from '../zircon-visualizers/threeJS/viz-eye-cube-sample-threeJS';
import { VizFetch } from '../zircon-visualizers/fetch/viz-eye-fetch';
import { VizCatalogCollectionTabulator } from '../zircon-visualizers/catalog/viz-eye-catalog-tabulator';
import {
  GROUND_STATION_TYPE,
  GroundStation,
} from '../libraries/spatial/ground-station';
import { groundStationIndexationMethod } from '../libraries/spatial/ground-station-catalog';
import { VizThreeJS } from '../zircon-visualizers/threeJS/viz-eye-threeJS';
import { VizHelmetSampleThreeJS } from '../zircon-visualizers/threeJS/viz-eye-helmet-sample-threeJS';
import { VizLeaflet } from '../zircon-visualizers/leaflet/viz-eye-leaflet';
import { VizLineJSChart } from '../zircon-visualizers/jschart/line-jschart';
import { VizEventLogger } from '../zircon-visualizers/logger/viz-eye-event-logger';
import { VizOpenGlobus } from '../zircon-visualizers/openglobus/viz-eye-openglobus';
import { Satellite, SATELLITE_TYPE } from '../libraries/spatial/satellite';
import { satelliteIndexationMethod } from '../libraries/spatial/satellite-catalog';

export function createVisualizerSatelliteCatalog(): VizCatalogCollectionTabulator<Satellite> {
  const viz: VizCatalogCollectionTabulator<Satellite> =
    new VizCatalogCollectionTabulator(
      SATELLITE_TYPE,
      satelliteIndexationMethod,
    );

  return viz;
}

export function createVisualizerOpenGlobusJS(): VizOpenGlobus {
  const viz: VizOpenGlobus = new VizOpenGlobus();
  // viz.setAPIKey('fMewEQFJcPQN35729l8o');
  return viz;
}

export function createVisualizerLogger(): VizEventLogger {
  const viz: VizEventLogger = new VizEventLogger();
  return viz;
}

interface FunctionData {
  label: string;
  data: number[];
  borderColor: string;
}

interface FunctionsData {
  labels: string[];
  datasets: FunctionData[];
}

/**
 * Chart 2
 */

export function createSeriesLine(): DataSeries<FunctionsData> {
  const series = new DataSeries<FunctionsData>();
  series.setData({
    labels: Array.from({ length: 20 }, (_, i) => `Label ${i + 1}`),
    datasets: [
      {
        label: 'Dataset 1',
        data: Array.from({ length: 20 }, () => Math.random()),
        borderColor: 'rgb(12, 84, 241)',
      },
      {
        label: 'Dataset 2',
        data: Array.from({ length: 20 }, () => Math.random()),
        borderColor: 'rgb(218, 143, 4)',
      },
      {
        label: 'Dataset 3',
        data: Array.from({ length: 20 }, () => Math.random()),
        borderColor: 'rgb(192, 2, 2)',
      },
    ],
  });
  setInterval(() => {
    const data: FunctionsData = series.getData();
    for (let i = 0; i <= 2; i++) {
      const values: number[] = <number[]>data.datasets[i].data;
      const newValues: number[] = values.slice(1);
      newValues.push(newValues[newValues.length - 1] + Math.random() * 10 - 5);
      data.datasets[i].data = newValues;
    }
    series.setData(data);
  }, 500);
  return series;
}

export function createVisualizerLineJS(): VizLineJSChart {
  const viz: VizLineJSChart = new VizLineJSChart();
  viz.setSeries(createSeriesLine());

  return viz;
}

export function createVisualizerLeafletJS(): VizLeaflet {
  const viz: VizLeaflet = new VizLeaflet();
  viz.setAPIKey('fMewEQFJcPQN35729l8o');
  return viz;
}

export function createVisualizerHelmetThreeJS(): VizThreeJS {
  const viz: VizThreeJS = new VizHelmetSampleThreeJS();
  return viz;
}

export function createVisualizerGroundStationCatalog(): VizCatalogCollectionTabulator<GroundStation> {
  const viz: VizCatalogCollectionTabulator<GroundStation> =
    new VizCatalogCollectionTabulator(
      GROUND_STATION_TYPE,
      groundStationIndexationMethod,
    );

  return viz;
}

export function createVisualizerFetch(): VizFetch {
  const viz: VizFetch = new VizFetch();
  // viz.setURL('http://localhost:8080/api/v1/fetch');
  return viz;
}

export function createVisualizerCubeThreeJS(): VizThreeJS {
  const viz: VizThreeJS = new VizCubeSampleThreeJS();
  return viz;
}
export function createVisualizerCesiumJS(): VizCesium {
  return new VizCesium();
}

export function createSeriesBar(): DataSeries<ChartData<'bar'>> {
  const series: DataSeries<ChartData<'bar'>> = new DataSeries<
    ChartData<'bar'>
  >();

  const labels = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul'];
  const data: ChartData<'bar'> = {
    labels: labels,
    datasets: [
      {
        label: 'Dataset 1',
        data: [10, 10, 10, 10, 10, 10, 10, 10],
      },
      {
        label: 'Dataset 2',
        data: [10, 10, 10, 10, 10, 10, 10, 10],
      },
    ],
  };
  series.setData(data);
  setInterval(() => {
    const data = series.getData();
    for (let i = 0; i <= 1; i++) {
      const values: number[] = <number[]>data.datasets[i].data;
      const newValues: number[] = values.slice(1);
      newValues.push(newValues[newValues.length - 1] + (Math.random() - 0.5));
      data.datasets[i].data = newValues;
    }
    series.setData(data);
  }, 50);
  return series;
}

export function createVisualizerBarJS(): VizBarJSChart {
  const viz: VizBarJSChart = new VizBarJSChart();
  viz.setSeries(createSeriesBar());
  return viz;
}

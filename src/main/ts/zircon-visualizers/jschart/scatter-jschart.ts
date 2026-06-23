import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  PointElement,
  ScatterController,
  Tooltip,
} from 'chart.js';
import { VizJSChart, VizJSChartState } from './viz-jschart';

export interface VizScatterJSChartState extends VizJSChartState<'scatter'> {
  dataType: 'scatter';
}
/**
 * Scatter chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/scatter.html
 * https://www.chartjs.org/docs/latest/samples/other-charts/scatter.html
 */

export class VizScatterJSChart extends VizJSChart<'scatter'> {
  public static readonly SCATTER_JSCHART_VISUALIZER_TYPE =
    'jschar-scatter-visualizer-type';

  constructor(state?: VizScatterJSChartState) {
    super(state);
    Chart.register(
      ScatterController,
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend,
      PointElement,
    );
  }

  public override getType(): string {
    return VizScatterJSChart.SCATTER_JSCHART_VISUALIZER_TYPE;
  }
}

import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  PieController,
  Tooltip,
} from 'chart.js';
import { VizJSChart, VizJSChartState } from './viz-jschart';

/**
 * Pie chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/doughnut.html
 * https://www.chartjs.org/docs/latest/samples/other-charts/pie.html
 */

export interface VizPieJSChartState extends VizJSChartState<'pie'> {
  dataType: 'pie';
}

export class VizPieJSChart extends VizJSChart<'pie'> {
  public static readonly PIE_JSCHART_VISUALIZER_TYPE =
    'jschar-pie-visualizer-type';

  constructor() {
    super();
    Chart.register(PieController, CategoryScale, LinearScale, Tooltip, Legend);
  }

  public override getType(): string {
    return VizPieJSChart.PIE_JSCHART_VISUALIZER_TYPE;
  }
}

import { VizJSChart, VizJSChartState } from './viz-jschart';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

/**
 * Bar chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/bar.html
 * https://www.chartjs.org/docs/latest/samples/bar/vertical.html
 */

export interface VizBarJSChartState extends VizJSChartState<'bar'> {
  chartType: 'bar';
}

export class VizBarJSChart extends VizJSChart<'bar'> {
  public static readonly BAR_JSCHART_VISUALIZER_TYPE =
    'jschar-bar-visualizer-type';

  constructor() {
    super();
    Chart.register(
      BarController,
      BarElement,
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend,
    );
  }

  public override getType(): string {
    return VizBarJSChart.BAR_JSCHART_VISUALIZER_TYPE;
  }
}

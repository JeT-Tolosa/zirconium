import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { VizJSChart, VizJSChartState } from './viz-jschart';

/**
 * Line chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/line.html
 * https://www.chartjs.org/docs/latest/samples/line/line.html
 */
export interface VizLineJSChartState extends VizJSChartState<'line'> {}
export class VizLineJSChart extends VizJSChart<'line'> {
  public static readonly LINE_JSCHART_VISUALIZER_TYPE =
    'jschar-line-visualizer-type';

  constructor(state?: VizLineJSChartState) {
    super(state);
    Chart.register(
      LineController,
      LineElement,
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend,
      PointElement,
    );
  }

  public override getType(): string {
    return VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE;
  }
}

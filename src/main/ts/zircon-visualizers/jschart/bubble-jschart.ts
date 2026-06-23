import {
  BubbleController,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { VizJSChart, VizJSChartState } from './viz-jschart';

/**
 * Bubble chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/bubble.html
 * https://www.chartjs.org/docs/latest/samples/other-charts/bubble.html
 
 */
export interface VizBubbleJSChartState extends VizJSChartState<'bubble'> {
  dataType: 'bubble';
}
export class VizBubbleJSChart extends VizJSChart<'bubble'> {
  public static readonly BUBBLE_JSCHART_VISUALIZER_TYPE =
    'jschar-bubble-visualizer-type';

  constructor(state?: VizBubbleJSChartState) {
    super(state);
    Chart.register(
      BubbleController,
      CategoryScale,
      LinearScale,
      Tooltip,
      Legend,
    );
  }

  public override getType(): string {
    return VizBubbleJSChart.BUBBLE_JSCHART_VISUALIZER_TYPE;
  }
}

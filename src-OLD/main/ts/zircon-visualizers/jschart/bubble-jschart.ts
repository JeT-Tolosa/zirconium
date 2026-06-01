import {
  BubbleController,
  CategoryScale,
  Chart,
  ChartData,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { VizJSChart } from './viz-eye-chartJS';
import { DataSeries } from '../../libraries/data-series/data-series';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-visualizer';

/**
 * Bubble chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/bubble.html
 * https://www.chartjs.org/docs/latest/samples/other-charts/bubble.html
 
 */
export interface VizBubbleJSChartState extends ZirconVizState {
  series?: DataSeries<ChartData<'bubble'>>;
}

export class VizBubbleJSChart extends VizJSChart<'bubble'> {
  public static readonly BUBBLE_JSCHART_VISUALIZER_TYPE =
    'BUBBLE_JSCHART_VISUALIZER_TYPE';

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

  /**
   * get chart JS type
   * @returns chart type to set into 'type' field of chart config
   */
  public getChartType(): 'bubble' {
    return 'bubble';
  }

  public override getType(): string {
    return VizBubbleJSChart.BUBBLE_JSCHART_VISUALIZER_TYPE;
  }
}

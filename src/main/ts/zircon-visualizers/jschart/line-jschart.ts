import {
  CategoryScale,
  Chart,
  ChartData,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { VizJSChart } from './viz-eye-chartJS';
import { DataSeries } from '../../libraries/data-series/data-series';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-visualizer';

/**
 * Line chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/line.html
 * https://www.chartjs.org/docs/latest/samples/line/line.html
 */
export interface VizLineJSChartState extends ZirconVizState {
  series?: DataSeries<ChartData<'line'>>;
}

export class VizLineJSChart extends VizJSChart<'line'> {
  public static readonly LINE_JSCHART_VISUALIZER_TYPE =
    'LINE_JSCHART_VISUALIZER_TYPE';

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

  /**
   * get chart JS type
   * @returns chart type to set into 'type' field of chart config
   */
  public getChartType(): 'line' {
    return 'line';
  }

  public override getType(): string {
    return VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE;
  }
}

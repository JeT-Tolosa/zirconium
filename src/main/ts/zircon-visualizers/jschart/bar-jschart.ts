import { DataSeries } from '../../libraries/data-series/data-series';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizJSChart } from './viz-eye-chartJS';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js'; /**
 * Bar chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/bar.html
 * https://www.chartjs.org/docs/latest/samples/bar/vertical.html
 */
export interface VizBarJSChartState extends ZirconVizState {
  series?: DataSeries<ChartData<'bar'>>;
}

export class VizBarJSChart extends VizJSChart<'bar'> {
  public static readonly BAR_JSCHART_VISUALIZER_TYPE = 'BAR_JSCHART_VISUALIZER_TYPE';

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

  /**
   * get chart JS type
   * @returns chart type to set into 'type' field of chart config
   */
  public getChartType(): 'bar' {
    return 'bar';
  }
}

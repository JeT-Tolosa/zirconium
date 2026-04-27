import {
  CategoryScale,
  Chart,
  ChartData,
  Legend,
  LinearScale,
  PieController,
  Tooltip,
} from 'chart.js';
import { VizJSChart } from './viz-eye-chartJS';
import { DataSeries } from '../../libraries/data-series/data-series';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';

/**
 * Pie chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/doughnut.html
 * https://www.chartjs.org/docs/latest/samples/other-charts/pie.html
 */

export interface VizPieJSChartState extends ZirconVizState {
  series?: DataSeries<ChartData<'pie'>>;
}

export class VizPieJSChart extends VizJSChart<'pie'> {
  public static readonly PIE_JSCHART_VISUALIZER_TYPE = 'PIE_JSCHART_VISUALIZER_TYPE';
  constructor() {
    super();
    Chart.register(PieController, CategoryScale, LinearScale, Tooltip, Legend);
  }

  /**
   * get chart JS type
   * @returns chart type to set into 'type' field of chart config
   */
  public getChartType(): 'pie' {
    return 'pie';
  }
  
  public override getType(): string {
    return VizPieJSChart.PIE_JSCHART_VISUALIZER_TYPE;
  }
}

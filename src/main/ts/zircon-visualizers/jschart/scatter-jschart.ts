import {
  CategoryScale,
  Chart,
  ChartData,
  Legend,
  LinearScale,
  PointElement,
  ScatterController,
  Tooltip,
} from 'chart.js';
import { VizJSChart } from './viz-eye-chartJS';
import { DataSeries } from '../../libraries/data-series/data-series';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';

export interface VizScatterJSChartState extends ZirconVizState {
  series?: DataSeries<ChartData<'scatter'>>;
}
/**
 * Scatter chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/scatter.html
 * https://www.chartjs.org/docs/latest/samples/other-charts/scatter.html
 */

export class VizScatterJSChart extends VizJSChart<'scatter'> {
  public static readonly SCATTER_JSCHART_VISUALIZER_TYPE = 'SCATTER_JSCHART_VISUALIZER_TYPE';
  constructor() {
    super();
    Chart.register(
      ScatterController,
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
  public getChartType(): 'scatter' {
    return 'scatter';
  }

  public override getType(): string {
    return VizScatterJSChart.SCATTER_JSCHART_VISUALIZER_TYPE;
  }
}

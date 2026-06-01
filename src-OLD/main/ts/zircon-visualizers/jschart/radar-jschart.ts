import {
  CategoryScale,
  Chart,
  ChartData,
  Legend,
  LinearScale,
  RadarController,
  Tooltip,
} from 'chart.js';
import { VizJSChart } from './viz-eye-chartJS';
import { DataSeries } from '../../libraries/data-series/data-series';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-visualizer';

/**
 * Radar chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/radar.html
 * https://www.chartjs.org/docs/latest/samples/other-charts/radar.html
 */

export interface VizRadarJSChartState extends ZirconVizState {
  series?: DataSeries<ChartData<'radar'>>;
}

export class VizRadarJSChart extends VizJSChart<'radar'> {
  public static readonly RADAR_JSCHART_VISUALIZER_TYPE =
    'RADAR_JSCHART_VISUALIZER_TYPE';

  constructor(state?: VizRadarJSChartState) {
    super(state);
    Chart.register(
      RadarController,
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
  public getChartType(): 'radar' {
    return 'radar';
  }

  public override getType(): string {
    return VizRadarJSChart.RADAR_JSCHART_VISUALIZER_TYPE;
  }
}

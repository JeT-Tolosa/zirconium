import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  RadarController,
  Tooltip,
} from 'chart.js';
import { VizJSChart, VizJSChartState } from './viz-jschart';

/**
 * Radar chart receives an input series with format:
 * https://www.chartjs.org/docs/latest/charts/radar.html
 * https://www.chartjs.org/docs/latest/samples/other-charts/radar.html
 */

export interface VizRadarJSChartState extends VizJSChartState<'radar'> {
  dataType: 'radar';
}
export class VizRadarJSChart extends VizJSChart<'radar'> {
  public static readonly RADAR_JSCHART_VISUALIZER_TYPE =
    'jschar-radar-visualizer-type';

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

  public override getType(): string {
    return VizRadarJSChart.RADAR_JSCHART_VISUALIZER_TYPE;
  }
}

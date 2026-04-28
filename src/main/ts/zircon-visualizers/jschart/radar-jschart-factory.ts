import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { VizRadarJSChart, VizRadarJSChartState } from './radar-jschart';

export class VizRadarJSChartFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizRadarJSChart.RADAR_JSCHART_VISUALIZER_TYPE;
  }

  public override createInstance(
    state: VizRadarJSChartState,
  ): Promise<VizRadarJSChart> {
    return Promise.resolve().then(() => {
      const viz = new VizRadarJSChart(state);
      return viz;
    });
  }
}

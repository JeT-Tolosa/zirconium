import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { VizScatterJSChart, VizScatterJSChartState } from './scatter-jschart';

export class VizScatterJSChartFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizScatterJSChart.SCATTER_JSCHART_VISUALIZER_TYPE;
  }

  public override createInstance(
    state: VizScatterJSChartState,
  ): Promise<VizScatterJSChart> {
    return Promise.resolve().then(() => {
      const viz = new VizScatterJSChart(state);
      return viz;
    });
  }
}

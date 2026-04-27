import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { VizBarJSChart, VizBarJSChartState } from './bar-jschart';

export class VizBarJSChartFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizBarJSChart.BAR_JSCHART_VISUALIZER_TYPE;
  }

  public override createInstance(
    state: VizBarJSChartState,
  ): Promise<VizBarJSChart> {
    return Promise.resolve().then(() => {
      const viz = new VizBarJSChart(state);
      return viz;
    });
  }
}

import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { VizLineJSChart, VizLineJSChartState } from './line-jschart';

export class VizLineJSChartFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE;
  }

  public override createInstance(
    state: VizLineJSChartState,
  ): Promise<VizLineJSChart> {
    return Promise.resolve().then(() => {
      const viz = new VizLineJSChart(state);
      return viz;
    });
  }
}

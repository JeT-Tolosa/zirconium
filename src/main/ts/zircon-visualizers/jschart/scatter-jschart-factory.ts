import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizScatterJSChart, VizScatterJSChartState } from './scatter-jschart';


export class VizScatterJSChartFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizScatterJSChart.SCATTER_JSCHART_VISUALIZER_TYPE;
  }

  public override createInstance(state: VizScatterJSChartState): Promise<VizScatterJSChart> {
    return Promise.resolve().then(() => {
      const viz = new VizScatterJSChart();
      viz.setState(state);
      return viz;
    });
  }
}

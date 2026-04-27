import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizPieJSChart, VizPieJSChartState } from './pie-jschart';


export class VizPieJSChartFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizPieJSChart.PIE_JSCHART_VISUALIZER_TYPE;
  }

  public override createInstance(state: VizPieJSChartState): Promise<VizPieJSChart> {
    return Promise.resolve().then(() => {
      const viz = new VizPieJSChart();
      viz.setState(state);
      return viz;
    });
  }
}

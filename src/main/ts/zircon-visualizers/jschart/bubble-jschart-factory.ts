import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizBubbleJSChart, VizBubbleJSChartState } from './bubble-jschart';


export class VizBubbleJSChartFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizBubbleJSChart.BUBBLE_JSCHART_VISUALIZER_TYPE;
  }

  public override createInstance(state: VizBubbleJSChartState): Promise<VizBubbleJSChart> {
    return Promise.resolve().then(() => {
      const viz = new VizBubbleJSChart();
      viz.setState(state);
      return viz;
    });
  }
}

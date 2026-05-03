import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { VizBubbleJSChart, VizBubbleJSChartState } from './bubble-jschart';

export class VizBubbleJSChartFactory extends ZirconObjectFactory {
  constructor() {
    super('VizBubbleJSChartFactory');
  }

  public getHandledTypes(): string[] {
    return [VizBubbleJSChart.BUBBLE_JSCHART_VISUALIZER_TYPE];
  }

  public override createInstance(
    state: VizBubbleJSChartState,
  ): Promise<VizBubbleJSChart> {
    return Promise.resolve().then(() => {
      const viz = new VizBubbleJSChart(state);
      return viz;
    });
  }
}

import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizBubbleJSChart, VizBubbleJSChartState } from './bubble-jschart';

export class VizBubbleJSChartFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VizBubbleJSChart.BUBBLE_JSCHART_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: VizBubbleJSChartState,
  ): Promise<VizBubbleJSChart> {
    return new VizBubbleJSChart(state);
  }
}

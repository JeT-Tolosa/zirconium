import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizBubbleJSChart, VizBubbleJSChartState } from './bubble-jschart';

async function createObject(
  state: VizBubbleJSChartState,
): Promise<VizBubbleJSChart> {
  const instance = new VizBubbleJSChart();
  await instance.setState(state);
  return instance;
}

export class VizBubbleJSChartFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizBubbleJSChart.BUBBLE_JSCHART_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

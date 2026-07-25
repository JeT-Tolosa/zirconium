import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizLineJSChart, VizLineJSChartState } from './line-jschart';

async function createObject(
  state: VizLineJSChartState,
): Promise<VizLineJSChart> {
  const instance = new VizLineJSChart();
  await instance.setState(state);
  return instance;
}

export class VizLineJSChartFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

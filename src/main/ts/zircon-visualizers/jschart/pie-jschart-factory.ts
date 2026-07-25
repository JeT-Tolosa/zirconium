import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizPieJSChart, VizPieJSChartState } from './pie-jschart';

async function createObject(state: VizPieJSChartState): Promise<VizPieJSChart> {
  const instance = new VizPieJSChart();
  await instance.setState(state);
  return instance;
}

export class VizPieJSChartFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizPieJSChart.PIE_JSCHART_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

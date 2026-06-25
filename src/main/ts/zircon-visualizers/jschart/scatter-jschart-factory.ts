import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizScatterJSChart, VizScatterJSChartState } from './scatter-jschart';

async function createObject(
  state: VizScatterJSChartState,
): Promise<VizScatterJSChart> {
  return new VizScatterJSChart(state);
}

export class VizScatterJSChartFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizScatterJSChart.SCATTER_JSCHART_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

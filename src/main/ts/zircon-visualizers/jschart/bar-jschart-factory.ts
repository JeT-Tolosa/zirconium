import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizBarJSChart, VizBarJSChartState } from './bar-jschart';

async function createObject(state: VizBarJSChartState): Promise<VizBarJSChart> {
  return new VizBarJSChart(state);
}
export class VizBarJSChartFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizBarJSChart.BAR_JSCHART_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

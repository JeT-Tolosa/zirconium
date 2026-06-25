import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizRadarJSChart, VizRadarJSChartState } from './radar-jschart';

async function createObject(
  state: VizRadarJSChartState,
): Promise<VizRadarJSChart> {
  return new VizRadarJSChart(state);
}

export class VizRadarJSChartFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(
      VizRadarJSChart.RADAR_JSCHART_VISUALIZER_TYPE,
      SHARP_EYE_VIZ_TYPE,
      createObject,
      null,
    );
  }
}

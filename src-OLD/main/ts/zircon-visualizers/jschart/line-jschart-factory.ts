import { SHARP_EYE_VIZ_TYPE } from '../../sharp-eye/sharp-eye-app';
import { SimpleZirconObjectFactory } from '../../zirconium/zircon-core/zircon-object-factory';
import { VizLineJSChart, VizLineJSChartState } from './line-jschart';

export class VizLineJSChartFactory extends SimpleZirconObjectFactory {
  constructor() {
    super(VizLineJSChart.LINE_JSCHART_VISUALIZER_TYPE, SHARP_EYE_VIZ_TYPE);
  }

  public override async createObject(
    state: VizLineJSChartState,
  ): Promise<VizLineJSChart> {
    return new VizLineJSChart(state);
  }
}

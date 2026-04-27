import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizRadarJSChart } from './radar-jschart';


export class VizRadarJSChartFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizRadarJSChart.RADAR_JSCHART_VISUALIZER_TYPE;
  }

  public override createInstance(state: ZirconVizState): Promise<VizRadarJSChart> {
    return Promise.resolve().then(() => {
      const viz = new VizRadarJSChart();
      viz.setState(state);
      return viz;
    });
  }
}

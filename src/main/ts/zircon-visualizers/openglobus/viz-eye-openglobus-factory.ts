import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { VizOpenGlobus, VizOpenGlobusState } from './viz-eye-openglobus';


export class VizOpenGlobusFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizOpenGlobus.OPENGLOBUS_VISUALIZER_TYPE;
  }

  public override createInstance(state: VizOpenGlobusState): Promise<VizOpenGlobus> {
    return Promise.resolve().then(() => {
      const viz = new VizOpenGlobus();
      viz.setState(state);
      return viz;
    });
  }
}

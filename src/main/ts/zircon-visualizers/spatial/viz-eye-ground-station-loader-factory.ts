import { ZirconObjectFactory } from '../../zirconium/zircon-object-factory';
import { ZirconVizState } from '../../zirconium/zircon-ui/zircon-viz-ui';
import { VizGroundStationLoader, VizGroundStationLoaderState } from './viz-eye-ground-station-loader';



export class VizGroundStationLoaderFactory extends ZirconObjectFactory {
  public getType(): string {
    return VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE;
  }

  public override createInstance(state: VizGroundStationLoaderState): Promise<VizGroundStationLoader> {
    return Promise.resolve().then(() => {
      const viz = new VizGroundStationLoader();
      viz.setState(state);
      return viz;
    });
  }
}

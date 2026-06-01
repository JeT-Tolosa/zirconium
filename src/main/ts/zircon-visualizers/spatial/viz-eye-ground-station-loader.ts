import usRadioGuyGroundJson from '../../../../../assets/data/spatial/usradioguy/ground.json';
import usRadioGuyXFilesJson from '../../../../../assets/data/spatial/usradioguy/xfiles.json';
import usRadioGuyNOAAJson from '../../../../../assets/data/spatial/usradioguy/NASANOAA.json';
import { USRadioGuyGroundStationLocalLoaderJson } from '../../libraries/spatial/ground-station/ground-station-loader-usradioguy';
import {
  LoaderDescriptor,
  VizLoader,
  VizLoaderState,
} from '../data-loader/viz-loader';
import {
  GROUND_STATION_TYPE,
  GroundStation,
} from '../../libraries/spatial/ground-station/ground-station';

const loaderDescriptors: { [id: string]: LoaderDescriptor<GroundStation> } = {
  'usradioguy-ground': {
    name: 'USRadioGuy Ground',
    loader: new USRadioGuyGroundStationLocalLoaderJson(
      usRadioGuyGroundJson as unknown as string,
    ),
  },
  'usradioguy-XFiles': {
    name: 'USRadioGuy XFiles',
    loader: new USRadioGuyGroundStationLocalLoaderJson(
      usRadioGuyXFilesJson as unknown as string,
    ),
  },
  'usradioguy-NOAA': {
    name: 'USRadioGuy NOAA',
    loader: new USRadioGuyGroundStationLocalLoaderJson(
      usRadioGuyNOAAJson as unknown as string,
    ),
  },
};

export class VizGroundStationLoader extends VizLoader<GroundStation> {
  public static readonly VIZ_GROUND_STATION_LOADER_TYPE =
    'VIZ_GROUND_STATION_LOADER_TYPE';

  constructor(state?: VizLoaderState) {
    super(GROUND_STATION_TYPE, loaderDescriptors, state);
  }

  public override getType(): string {
    return VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE;
  }
}

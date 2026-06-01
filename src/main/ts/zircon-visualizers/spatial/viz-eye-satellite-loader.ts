import {
  Satellite,
  SATELLITE_TYPE,
} from '../../libraries/spatial/satellite/satellite';
import {
  LoaderDescriptor,
  VizLoader,
  VizLoaderState,
} from '../data-loader/viz-loader';

import gpsJson from '../../../../../assets/data/spatial/celestrak/gps-celestrak.json';
import starlinkJson from '../../../../../assets/data/spatial/celestrak/starlink-celestrak.json';
import activeJson from '../../../../../assets/data/spatial/celestrak/active-celestrak.json';
import scienceJson from '../../../../../assets/data/spatial/celestrak/science-celestrak.json';
import oneCelestrakJson from '../../../../../assets/data/spatial/celestrak/one-celestrak.json';
import { SatelliteLocalFileLoaderCelestrakJson } from '../../libraries/spatial/satellite/satellite-loader-celestrak';

const loaderDescriptors: { [id: string]: LoaderDescriptor<Satellite> } = {
  'celestrak-starlink': {
    name: 'StarLink Celestrak',
    loader: new SatelliteLocalFileLoaderCelestrakJson(
      'Celestrak Loader',
      starlinkJson as unknown as string,
    ),
  },
  'one-celestrak-satellite': {
    name: 'One Celestrak',
    loader: new SatelliteLocalFileLoaderCelestrakJson(
      'Celestrak Loader',
      oneCelestrakJson as unknown as string,
    ),
  },
  'celestrak-active': {
    name: 'Active Celestrak',
    loader: new SatelliteLocalFileLoaderCelestrakJson(
      'Celestrak Loader',
      activeJson as unknown as string,
    ),
  },
  'celestrak-gps': {
    name: 'GPS Celestrak',
    loader: new SatelliteLocalFileLoaderCelestrakJson(
      'Celestrak Loader',
      gpsJson as unknown as string,
    ),
  },
  'celestrak-science': {
    name: 'Science Celestrak',
    loader: new SatelliteLocalFileLoaderCelestrakJson(
      'Celestrak Loader',
      scienceJson as unknown as string,
    ),
  },
};

export class VizSatCatLoader extends VizLoader<Satellite> {
  public static readonly VIZ_SAT_CAT_LOADER_TYPE = 'VIZ_SAT_CAT_LOADER_TYPE';

  constructor(state?: VizLoaderState) {
    super(SATELLITE_TYPE, loaderDescriptors, state);
  }

  public override getType(): string {
    return VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE;
  }
}

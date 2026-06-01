import {
  LoaderDescriptor,
  VizLoader,
  VizLoaderState,
} from '../data-loader/viz-loader';
import { AISLoaderAISStreamLocalJson } from '../../libraries/maritime/aisStream-loader-AISStream';
import aisStreamFile from '../../../../../assets/data/maritime/aisStream/ais-stream-github.json';
import { AIS, AIS_TYPE } from '../../libraries/maritime/ais';

export const VIZ_AIS_LOADER_TYPE: string = 'viz-ais-loader';

const loaderDescriptors: { [id: string]: LoaderDescriptor<AIS> } = {
  'ais-stream': {
    name: 'AIS Stream',
    loader: new AISLoaderAISStreamLocalJson(
      'AISStream AIS Loader (local sample)',
      aisStreamFile as unknown as string,
    ),
  },
};

export class VizAISLoader extends VizLoader<AIS> {
  public static readonly VIZ_AIS_LOADER_TYPE = VIZ_AIS_LOADER_TYPE;

  constructor(state?: VizLoaderState) {
    super(AIS_TYPE, loaderDescriptors, state);
  }

  public override getType(): string {
    return VizAISLoader.VIZ_AIS_LOADER_TYPE;
  }
}

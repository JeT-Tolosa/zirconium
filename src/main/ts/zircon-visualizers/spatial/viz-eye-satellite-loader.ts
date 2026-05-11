import './viz-eye-satellite-loader.css';
import { v4 as uuid } from 'uuid';
import gpsJson from '../../../../../assets/data/spatial/celestrak/gps-celestrak.json';
import starlinkJson from '../../../../../assets/data/spatial/celestrak/starlink-celestrak.json';
import activeJson from '../../../../../assets/data/spatial/celestrak/active-celestrak.json';
import scienceJson from '../../../../../assets/data/spatial/celestrak/science-celestrak.json';
import oneCelestrakJson from '../../../../../assets/data/spatial/celestrak/one-celestrak.json';
import { SatelliteLocalFileLoaderCelestrakJson } from '../../libraries/spatial/satellite-loader-celestrak';
import { ElementLoader } from '../../libraries/catalog/element-loader';
import { Satellite, SATELLITE_TYPE } from '../../libraries/spatial/satellite';
import {
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import { CatalogEngineEvents } from '../../sharp-eye/engines/catalog-engine';
import {
  ZirconViz,
  ZirconVizEventRegistry,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import { IonButton } from '@ionic/core/components/ion-button';

interface SatelliteLoaderDescriptor {
  name: string;
  loader: ElementLoader<Satellite>;
}

const loaderDescriptors: { [id: string]: SatelliteLoaderDescriptor } = {
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

export type VizSatCatLoaderEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: PickEvents<
      CatalogEngineEvents<Satellite>,
      'COLLECTION_CREATE_CATALOG_REQUEST'
    >;
  },
  ZirconVizEventRegistry
>;

export interface VizSatCatLoaderState {
  type: typeof VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE;
}

export class VizSatCatLoader<
  R extends VizSatCatLoaderEventRegistry = VizSatCatLoaderEventRegistry,
> extends ZirconViz<R> {
  public static readonly VIZ_SAT_CAT_LOADER_TYPE = 'VIZ_SAT_CAT_LOADER_TYPE';
  private _div: HTMLDivElement = null;
  private _fetchButton: IonButton = null;
  private _dataSelector: HTMLSelectElement = null;

  /**
   * constructor
   */
  constructor(state?: VizSatCatLoaderState) {
    super(state);
  }

  public override getType(): string {
    return VizSatCatLoader.VIZ_SAT_CAT_LOADER_TYPE;
  }

  public updateData(): boolean {
    // this.fetchData(URL_CELESTRACK);
    return true;
  }

  public update(): void {}

  public start(): void {}

  public close(): void {}

  // private celestrakJsonToSat(json: unknown): Satellite[] {
  //   if (!json) return [];
  //   if (!json.length) return [];
  //   const result: Satellite[] = [];
  //   json.forEach((element: unknown) => {
  //     result.push({
  //       OBJECT_NAME: element.OBJECT_NAME,
  //       OBJECT_ID: element.OBJECT_ID,
  //     });
  //   });
  //   return result;
  // }

  private getDataSelector(): HTMLSelectElement {
    if (this._dataSelector) return this._dataSelector;
    this._dataSelector = document.createElement('select');
    Object.keys(loaderDescriptors).forEach((descriptorId: string) => {
      const desc: SatelliteLoaderDescriptor = loaderDescriptors[descriptorId];
      const option: HTMLOptionElement = document.createElement('option');
      option.setAttribute('value', descriptorId);
      option.innerHTML = desc.name;
      this._dataSelector.appendChild(option);
    });

    return this._dataSelector;
  }

  //   const selectedRows = table.rows({ selected: true }).data();
  // console.log(selectedRows);

  public getFetchButton(): HTMLElement {
    if (this._fetchButton) return this._fetchButton;
    this._fetchButton = document.createElement('ion-button');
    this._fetchButton.classList.add('satcat-button');
    this._fetchButton.innerText = 'Load Data';

    this._fetchButton.addEventListener('click', () => {
      const dataDescriptorId: string =
        this.getDataSelector().options[this.getDataSelector().selectedIndex]
          ?.value;
      if (!dataDescriptorId) throw new Error('Unable to fetch data');
      const dataDescriptor: SatelliteLoaderDescriptor =
        loaderDescriptors[dataDescriptorId];
      return dataDescriptor.loader
        .getData()
        .then((satellites: Satellite[]) => {
          this.emit('COLLECTION_CREATE_CATALOG_REQUEST', {
            catalogType: SATELLITE_TYPE,
            catalogDescriptor: { id: 'null', name: dataDescriptor.name },
            elements: satellites,
          });
        })
        .catch((error) => {
          this.emit('UNCAUGHT_EXCEPTION', {
            error: `An error occured fetching ${dataDescriptor.name}: ${error}`,
          });
        });
    });

    return this._fetchButton;
  }

  /**
   * Get chart's div element
   * @returns   Chart's div element
   */
  public getMainDiv(): HTMLDivElement {
    if (this._div) return this._div;
    this._div = document.createElement('div');
    this._div.id = uuid();
    this._div.classList.add('satcat-container');

    const div1: HTMLDivElement = document.createElement('div');
    div1.appendChild(this.getDataSelector());
    this._div.appendChild(div1);

    const div2: HTMLDivElement = document.createElement('div');
    div2.appendChild(this.getFetchButton());
    this._div.appendChild(div2);

    return this._div;
  }

  // /**
  //  * Get chart's div element
  //  * @returns   Chart's div element
  //  */
  // public getSatCatDiv(): HTMLDivElement {
  //   if (this._satCatLoaderDiv) return this._satCatLoaderDiv;
  //   this._satCatLoaderDiv = document.createElement('div');
  //   this._satCatLoaderDiv.id = `tabulator-div-${uuid()}`;
  //   this._satCatLoaderDiv.classList.add('satcat-grid');
  //   return this._satCatLoaderDiv;
  // }

  public override updateResize(): boolean {
    // console.log(`update resize satcat ${this.getName()}`);
    return true;
  }
}

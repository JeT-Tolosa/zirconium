import './viz-eye-satellite-loader.css';
import { v4 as uuid } from 'uuid';
import gpsJson from '../../../../../assets/orbital-data/celestrak/gps-celestrak.json';
import starlinkJson from '../../../../../assets/orbital-data/celestrak/starlink-celestrak.json';
import activeJson from '../../../../../assets/orbital-data/celestrak/active-celestrak.json';
import scienceJson from '../../../../../assets/orbital-data/celestrak/science-celestrak.json';
import oneCelestrakJson from '../../../../../assets/orbital-data/celestrak/one-celestrak.json';
import { SatelliteLoaderCelestrakJson } from '../../libraries/spatial/satellite-loader-celestrak';
import { ElementLoader } from '../../libraries/spatial/satellite-loader';
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

const celestrakLoader: SatelliteLoaderCelestrakJson =
  new SatelliteLoaderCelestrakJson('Celestrak Loader');

interface SatelliteLoaderDescriptor {
  name: string;
  localFile: string;
  loader: ElementLoader<Satellite>;
}

const loaderDescriptors: { [id: string]: SatelliteLoaderDescriptor } = {
  'celestrak-starlink': {
    name: 'StarLink Celestrak',
    localFile: starlinkJson as unknown as string,
    loader: celestrakLoader,
  },
  'one-celestrak-satellite': {
    name: 'One Celestrak',
    localFile: oneCelestrakJson as unknown as string,
    loader: celestrakLoader,
  },
  'celestrak-active': {
    name: 'Active Celestrak',
    localFile: activeJson as string,
    loader: celestrakLoader,
  },
  'celestrak-gps': {
    name: 'GPS Celestrak',
    localFile: gpsJson as unknown as string,
    loader: celestrakLoader,
  },
  'celestrak-science': {
    name: 'Science Celestrak',
    localFile: scienceJson as unknown as string,
    loader: celestrakLoader,
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

  // /**
  //  * Local fetch of Celestrak data
  //  */
  // private fetchData(loader : ): Promise<Satellite[]> {
  //   let retrievedData: Promise<unknown> = null;
  //   // if (this._local) retrievedData = this.fetchDataCelestrakLocal();
  //   // else retrievedData = this.fetchDataCelestrakOnline();

  //   retrievedData = Promise.resolve(starlinkJson);
  //   // return this.fetchDataCelestrakOnline()
  //   return retrievedData.then((data: unknown) => {
  //     // const convertCelestrakToSatellite: Satellite[] = this.celestrakJsonToSat(
  //     //   JSON.parse(data),
  //     // );
  //     return data.map((element: unknown) => {
  //       return {
  //         OBJECT_NAME: element.OBJECT_NAME,
  //         OBJECT_ID: element.OBJECT_ID,
  //         NORAD: element.NORAD_CAT_ID,
  //       };
  //     });
  //   });
  // }

  // /**
  //  * Local fetch of Celestrak data
  //  */
  // private fetchDataCelestrakLocal(): Promise<Satellite[]> {
  //   const filepath: string =
  //     './assets/orbital-data/celestrak/active-celestrak.json';
  //   this.displayMessage(
  //     DISPLAY_MESSAGE_LEVEL.INFO,
  //     `Local Fetching celestrak data from ${filepath}`,
  //   );
  //   return fs.readFile(filepath).then((data: unknown) => {
  //     this.displayMessage(
  //       DISPLAY_MESSAGE_LEVEL.SUCCESS,
  //       `Local Fetch completed: preparing data. ${data.length} rows`,
  //     );
  //     return JSON.parse(data);
  //   });
  // }

  // /**
  //  * Fetch Celestrak data online
  //  */
  // private fetchDataCelestrakOnline(): Promise<unknown> {
  //   const url: string = CELESTRAK_URL;

  //   this.displayMessage(DISPLAY_MESSAGE_LEVEL.INFO, `Fetching ${url}...`);
  //   return fetch(url)
  //     .then((response) => response.json())
  //     .then((data) => {
  //       this.displayMessage(
  //         DISPLAY_MESSAGE_LEVEL.SUCCESS,
  //         `Fetch completed: preparing data. ${data.length} rows`,
  //       );
  //       this.setData(data);
  //       this.displayMessage(
  //         DISPLAY_MESSAGE_LEVEL.SUCCESS,
  //         `Fetch completed: data size = ${data.length}`,
  //       );
  //     })
  //     .catch((error) => {
  //       this.displayMessage(
  //         DISPLAY_MESSAGE_LEVEL.ERROR,
  //         `Fetch failed: ${error}`,
  //       );
  //     });
  // }

  /**
   * Display Context Menu
   * @param event
   * @returns
   */
  private displayContextMenu(event: MouseEvent): void {
    event.preventDefault();

    const tr = (event.target as HTMLElement).closest('tr');
    if (!tr) return;

    // const row = this._dataTable.getData(tr);

    // // Sélection automatique si la ligne n’est pas sélectionnée
    // if (!tr.classList.contains('selected')) {
    //   this._dataTable.rows().deselect(); // désélectionner toutes les autres
    //   row.select();
    // }
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
        .loadLocalJson(dataDescriptor.localFile)
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

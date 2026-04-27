import { v4 as uuid } from 'uuid';
import usRadioGuyGroundJson from '../../../../../assets/orbital-data/usradioguy/ground.json';
import usRadioGuyXFilesJson from '../../../../../assets/orbital-data/usradioguy/xfiles.json';
import usRadioGuyNOAAJson from '../../../../../assets/orbital-data/usradioguy/NASANOAA.json';
import { ElementLoader } from '../../libraries/spatial/satellite-loader';
import {
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import { CatalogEngineEvents } from '../../sharp-eye/engines/catalog-engine';
import { USRadioGuyGroundStationLoaderJson } from '../../libraries/spatial/ground-station-loader-usradioguy';
import {
  GROUND_STATION_TYPE,
  GroundStation,
} from '../../libraries/spatial/ground-station';
import {
  ZirconViz,
  ZirconVizEventRegistry,
} from '../../zirconium/zircon-ui/zircon-viz-ui';

const usRadioGuyGroundStationLoader: USRadioGuyGroundStationLoaderJson =
  new USRadioGuyGroundStationLoaderJson();

interface GroundStationLoaderDescriptor {
  name: string;
  localFile: string;
  loader: ElementLoader<GroundStation>;
}

const loaderDescriptors: { [id: string]: GroundStationLoaderDescriptor } = {
  'usradioguy-ground': {
    name: 'USRadioGuy Ground',
    localFile: usRadioGuyGroundJson as unknown as string,
    loader: usRadioGuyGroundStationLoader,
  },
  'usradioguy-XFiles': {
    name: 'USRadioGuy XFiles',
    localFile: usRadioGuyXFilesJson as unknown as string,
    loader: usRadioGuyGroundStationLoader,
  },
  'usradioguy-NOAA': {
    name: 'USRadioGuy NOAA',
    localFile: usRadioGuyNOAAJson as unknown as string,
    loader: usRadioGuyGroundStationLoader,
  },
};

export interface VizGroundStationLoaderState {
  type: typeof VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE;
}

export type VizGroundStationLoaderEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: PickEvents<
      CatalogEngineEvents<GroundStation>,
      'COLLECTION_CREATE_CATALOG_REQUEST'
    >;
  },
  ZirconVizEventRegistry
>;

export class VizGroundStationLoader<
  R extends VizGroundStationLoaderEventRegistry =
    VizGroundStationLoaderEventRegistry,
> extends ZirconViz<R> {
  public static readonly VIZ_GROUND_STATION_LOADER_TYPE =
    'VIZ_GROUND_STATION_LOADER_TYPE';
  private _div: HTMLDivElement = null;
  private _satCatLoaderDiv: HTMLDivElement = null;
  private _fetchButton: HTMLButtonElement = null;
  private _dataSelector: HTMLSelectElement = null;

  /**
   * constructor
   */
  constructor() {
    super();
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
      const desc: GroundStationLoaderDescriptor =
        loaderDescriptors[descriptorId];
      const option: HTMLOptionElement = document.createElement('option');
      option.setAttribute('value', descriptorId);
      option.innerHTML = desc.name;
      this._dataSelector.appendChild(option);
    });

    return this._dataSelector;
  }

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

  public getFetchButton(): HTMLButtonElement {
    if (this._fetchButton) return this._fetchButton;
    this._fetchButton = document.createElement('button');
    this._fetchButton.classList.add('satcat-button');
    this._fetchButton.innerText = 'Load Data';
    this._fetchButton.addEventListener('click', () => {
      const dataDescriptorId: string =
        this.getDataSelector().options[this.getDataSelector().selectedIndex]
          ?.value;
      if (!dataDescriptorId) throw new Error('Unable to fetch data');
      const dataDescriptor: GroundStationLoaderDescriptor =
        loaderDescriptors[dataDescriptorId];
      return dataDescriptor.loader
        .loadLocalJson(dataDescriptor.localFile)
        .then((groundStations: GroundStation[]) => {
          // this.setSatelliteData(satellites);

          this.emit('COLLECTION_CREATE_CATALOG_REQUEST', {
            catalogType: GROUND_STATION_TYPE,
            catalogDescriptor: { id: 'null', name: dataDescriptor.name },
            elements: groundStations,
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
    this._div.appendChild(this.getFetchButton());
    // this._div.appendChild(this.getSatCatDiv());
    this._div.appendChild(this.getDataSelector());

    return this._div;
  }

  public override updateResize(): boolean {
    // console.log(`update resize satcat ${this.getName()}`);
    return true;
  }
}

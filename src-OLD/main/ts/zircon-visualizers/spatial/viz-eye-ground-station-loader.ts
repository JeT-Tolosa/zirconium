import './viz-eye-ground-station-loader.css';
import { v4 as uuid } from 'uuid';
import usRadioGuyGroundJson from '../../../../../assets/data/spatial/usradioguy/ground.json';
import usRadioGuyXFilesJson from '../../../../../assets/data/spatial/usradioguy/xfiles.json';
import usRadioGuyNOAAJson from '../../../../../assets/data/spatial/usradioguy/NASANOAA.json';
import { ItemLoader } from '../../libraries/collection/item-loader';
import {
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import { CatalogEngineEvents } from '../../sharp-eye/engines/catalog-engine';
import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import { IonButton } from '@ionic/core/components/ion-button';
import { USRadioGuyGroundStationLocalLoaderJson } from '../../libraries/spatial/ground-station/ground-station-loader-usradioguy';
import {
  GROUND_STATION_TYPE,
  GroundStation,
} from '../../libraries/spatial/ground-station/ground-station';

interface GroundStationLoaderDescriptor {
  name: string;
  loader: ItemLoader<GroundStation>;
}

const loaderDescriptors: { [id: string]: GroundStationLoaderDescriptor } = {
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

export interface VizGroundStationLoaderState extends ZirconVizState {
  type: typeof VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE;
}

export type VizGroundStationLoaderEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: PickEvents<
      CatalogEngineEvents<GroundStation>,
      'COLLECTION_CATALOG_CREATE_REQUEST'
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
  private _fetchButton: IonButton = null;
  private _dataSelector: HTMLSelectElement = null;

  /**
   * constructor
   */
  constructor(state?: VizGroundStationLoaderState) {
    super(state);
  }

  public override getType(): string {
    return VizGroundStationLoader.VIZ_GROUND_STATION_LOADER_TYPE;
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

  public getFetchButton(): HTMLElement {
    if (this._fetchButton) return this._fetchButton;
    this._fetchButton = document.createElement('ion-button');
    this._fetchButton.classList.add('loader-button');
    this._fetchButton.innerText = 'Load Data';
    this._fetchButton.addEventListener('click', async () => {
      const dataDescriptorId: string =
        this.getDataSelector().options[this.getDataSelector().selectedIndex]
          ?.value;
      if (!dataDescriptorId) throw new Error('Unable to fetch data');
      const dataDescriptor: GroundStationLoaderDescriptor =
        loaderDescriptors[dataDescriptorId];
      const groundStations: GroundStation[] =
        await dataDescriptor.loader.getData();

      this.emit('COLLECTION_CATALOG_CREATE_REQUEST', {
        dataType: GROUND_STATION_TYPE,
        catalogDescriptor: { name: dataDescriptor.name },
        elements: groundStations,
      });
    });

    return this._fetchButton;
  }

  /**
   * Get chart's div element
   * @returns   Chart's div element
   */
  public getContainer(): HTMLDivElement {
    if (this._div) return this._div;
    this._div = document.createElement('div');
    this._div.id = uuid();
    this._div.classList.add('groundstation-container');

    // this._div.appendChild(this.getSatCatDiv());
    const div1: HTMLDivElement = document.createElement('div');
    div1.appendChild(this.getDataSelector());
    this._div.appendChild(div1);

    const div2: HTMLDivElement = document.createElement('div');
    div2.appendChild(this.getFetchButton());
    this._div.appendChild(div2);
    return this._div;
  }

  public override updateResize(): boolean {
    // console.log(`update resize groundstation ${this.getName()}`);
    return true;
  }
}

import './viz-eye-ais-loader.css';
import { v4 as uuid } from 'uuid';
import { ItemLoader } from '../../libraries/collection/item-loader';
import {
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
import { CatalogEngineEvents } from '../../sharp-eye/engines/catalog-engine';
import { AIS_TYPE, AIS } from '../../libraries/maritime/ais';
import {
  ZirconViz,
  ZirconVizEventRegistry,
  ZirconVizState,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import { IonButton } from '@ionic/core/components/ion-button';
import { AISLoaderAISStreamLocalJson } from '../../libraries/maritime/aisStream-loader-AISStream';
import aisStreamFile from '../../../../../assets/data/maritime/aisStream/ais-stream-github.json';

export const VIZ_AIS_LOADER_TYPE: string = 'viz-ais-loader';

interface AISLoaderDescriptor {
  name: string;
  loader: ItemLoader<AIS>;
}

const loaderDescriptors: { [id: string]: AISLoaderDescriptor } = {
  'ais-stream': {
    name: 'AIS Stream',
    loader: new AISLoaderAISStreamLocalJson(
      'AISStream AIS Loader (local sample)',
      aisStreamFile as unknown as string,
    ),
  },
};

export interface VizAISLoaderState extends ZirconVizState {
  type: typeof VIZ_AIS_LOADER_TYPE;
}

export type VizAISLoaderEventRegistry = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: PickEvents<
      CatalogEngineEvents<AIS>,
      'COLLECTION_CATALOG_CREATE_REQUEST'
    >;
  },
  ZirconVizEventRegistry
>;

export class VizAISLoader<
  R extends VizAISLoaderEventRegistry = VizAISLoaderEventRegistry,
> extends ZirconViz<R> {
  private _div: HTMLDivElement = null;
  private _fetchButton: IonButton = null;
  private _dataSelector: HTMLSelectElement = null;

  /**
   * constructor
   */
  constructor(state?: VizAISLoaderState) {
    super(state);
  }

  public override getType(): string {
    return VIZ_AIS_LOADER_TYPE;
  }

  public updateData(): boolean {
    // this.fetchData(URL_CELESTRACK);
    return true;
  }

  public update(): void {}

  public start(): void {}

  public close(): void {}

  private getDataSelector(): HTMLSelectElement {
    if (this._dataSelector) return this._dataSelector;
    this._dataSelector = document.createElement('select');
    Object.keys(loaderDescriptors).forEach((descriptorId: string) => {
      const desc: AISLoaderDescriptor = loaderDescriptors[descriptorId];
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
    this._fetchButton.classList.add('loader-button');
    this._fetchButton.innerText = 'Load Data';
    this._fetchButton.addEventListener('click', async () => {
      const dataDescriptorId: string =
        this.getDataSelector().options[this.getDataSelector().selectedIndex]
          ?.value;
      if (!dataDescriptorId) throw new Error('Unable to fetch data');
      const dataDescriptor: AISLoaderDescriptor =
        loaderDescriptors[dataDescriptorId];
      if (!dataDescriptor || !dataDescriptor.loader)
        throw new Error('invalid AIS data loader');
      const aisData: AIS[] = await dataDescriptor.loader.getData();

      this.emit('COLLECTION_CATALOG_CREATE_REQUEST', {
        dataType: AIS_TYPE,
        catalogDescriptor: { name: dataDescriptor.name },
        elements: aisData,
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

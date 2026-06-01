import './viz-loader.css';
import { v4 as uuid } from 'uuid';
import { IonButton } from '@ionic/core/components/ion-button';

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

/**
 * Descriptor for a loadable dataset
 */
export interface LoaderDescriptor<T> {
  name: string;
  loader: ItemLoader<T>;
}

/**
 * Event registry
 */
export type VizLoaderEventRegistry<T> = MergeZirconRegistries<
  {
    incoming: {};
    outgoing: PickEvents<
      CatalogEngineEvents<T>,
      'CATALOG_ENGINE_COLLECTION_CREATE_REQUEST'
    >;
  },
  ZirconVizEventRegistry
>;

/**
 * State
 */
export interface VizLoaderState extends ZirconVizState {
  type: string;
}

/**
 * Generic loader visualizer
 */
export class VizLoader<
  T,
  R extends VizLoaderEventRegistry<T> = VizLoaderEventRegistry<T>,
> extends ZirconViz<R> {
  private _div: HTMLDivElement = null;
  private _fetchButton: IonButton = null;
  private _dataSelector: HTMLSelectElement = null;
  private _statusDiv: HTMLDivElement = null;

  private _loadingStartTime = 0;

  constructor(
    private readonly _itemType: string,
    private readonly _loaderDescriptors: {
      [id: string]: LoaderDescriptor<T>;
    },
    state?: VizLoaderState,
  ) {
    super(state);
  }

  // ---------------------------
  // Lifecycle
  // ---------------------------

  public updateData(): boolean {
    return true;
  }

  public update(): void {}
  public start(): void {}
  public close(): void {}

  // ---------------------------
  // Status UI
  // ---------------------------

  private getStatusDiv(): HTMLDivElement {
    if (this._statusDiv) return this._statusDiv;

    this._statusDiv = document.createElement('div');
    this._statusDiv.classList.add('loader-status');

    return this._statusDiv;
  }

  private setStatusIdle(message: string): void {
    this.getStatusDiv().innerHTML = `${message}`;
    this.getStatusDiv().className = 'loader-status idle';
  }

  private setStatusLoading(message: string): void {
    this.getStatusDiv().innerHTML = `${message}`;
    this.getStatusDiv().className = 'loader-status loading';
  }

  private setStatusSuccess(message: string): void {
    this.getStatusDiv().innerHTML = `${message}`;
    this.getStatusDiv().className = 'loader-status success';
  }

  private setStatusError(message: string): void {
    this.getStatusDiv().innerHTML = `${message}`;
    this.getStatusDiv().className = 'loader-status error';
  }

  // ---------------------------
  // Selector
  // ---------------------------

  protected getDataSelector(): HTMLSelectElement {
    if (this._dataSelector) return this._dataSelector;

    this._dataSelector = document.createElement('select');

    Object.entries(this._loaderDescriptors).forEach(
      ([descriptorId, descriptor]) => {
        const option = document.createElement('option');
        option.value = descriptorId;
        option.innerHTML = descriptor.name;
        this._dataSelector.appendChild(option);
      },
    );

    // default selection
    if (this._dataSelector.options.length > 0) {
      this._dataSelector.selectedIndex = 0;
    }

    this._dataSelector.addEventListener('change', () => {
      this.updateHintMessage();
    });

    return this._dataSelector;
  }

  private updateHintMessage(): void {
    const select = this.getDataSelector();
    const descriptorId = select.options[select.selectedIndex]?.value;

    if (!descriptorId) return;

    const descriptor = this._loaderDescriptors[descriptorId];
    if (!descriptor) return;

    this.setStatusIdle(`Click to load "${descriptor.name}"`);
  }

  // ---------------------------
  // Button
  // ---------------------------

  protected getFetchButton(): HTMLElement {
    if (this._fetchButton) return this._fetchButton;

    this._fetchButton = document.createElement('ion-button');
    this._fetchButton.classList.add('loader-button');
    this._fetchButton.innerText = 'Load Data';

    this._fetchButton.addEventListener('click', async () => {
      const select = this.getDataSelector();
      const descriptorId = select.options[select.selectedIndex]?.value;

      if (!descriptorId) {
        throw new Error('Unable to determine selected loader');
      }

      const descriptor = this._loaderDescriptors[descriptorId];

      if (!descriptor) {
        throw new Error(`Unknown descriptor: ${descriptorId}`);
      }

      this._loadingStartTime = performance.now();
      this.setStatusLoading(`Loading "${descriptor.name}"...`);

      try {
        const items = await descriptor.loader.getData();

        const duration = this.formatDuration(
          performance.now() - this._loadingStartTime,
        );

        this.setStatusSuccess(
          `${descriptor.name} loaded (${items.length} items) in ${duration}`,
        );

        this.emit('CATALOG_ENGINE_COLLECTION_CREATE_REQUEST', {
          itemCollectionDescriptor: {
            itemType: this._itemType,
            name: descriptor.name,
          },
          items,
        });
      } catch (error) {
        const duration = this.formatDuration(
          performance.now() - this._loadingStartTime,
        );

        this.setStatusError(
          `Failed after ${duration}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        this.emit('UNCAUGHT_EXCEPTION', {
          error: `Error fetching ${descriptor.name}: ${String(error)}`,
        });
      }
    });

    return this._fetchButton;
  }

  // ---------------------------
  // Helpers
  // ---------------------------

  private formatDuration(ms: number): string {
    if (ms < 1000) return `${Math.round(ms)}ms`;

    const sec = ms / 1000;

    if (sec < 60) return `${sec.toFixed(2)}s`;

    const min = Math.floor(sec / 60);
    const remainingSec = Math.round(sec % 60);

    return `${min}m ${remainingSec}s`;
  }

  // ---------------------------
  // UI
  // ---------------------------

  public getContainer(): HTMLDivElement {
    if (this._div) return this._div;

    this._div = document.createElement('div');
    this._div.id = uuid();
    this._div.classList.add('loader-container');

    const selectorDiv = document.createElement('div');
    selectorDiv.appendChild(this.getDataSelector());

    const buttonDiv = document.createElement('div');
    buttonDiv.appendChild(this.getFetchButton());

    this._div.appendChild(selectorDiv);
    this._div.appendChild(buttonDiv);
    this._div.appendChild(this.getStatusDiv());

    this.updateHintMessage();

    return this._div;
  }

  public override updateResize(): boolean {
    return true;
  }
}

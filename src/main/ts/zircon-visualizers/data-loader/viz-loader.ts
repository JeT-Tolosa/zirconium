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
  private __div: HTMLDivElement = null;
  private __fetchButton: IonButton = null;
  private __dataSelector: HTMLSelectElement = null;
  private __statusDiv: HTMLDivElement = null;

  private __loadingStartTime = 0;

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
    if (this.__statusDiv) {
      return this.__statusDiv;
    }

    this.__statusDiv = document.createElement('div');
    this.__statusDiv.classList.add('loader-status');

    return this.__statusDiv;
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
    if (this.__dataSelector) {
      return this.__dataSelector;
    }

    this.__dataSelector = document.createElement('select');

    Object.entries(this._loaderDescriptors).forEach(
      ([descriptorId, descriptor]) => {
        const option = document.createElement('option');
        option.value = descriptorId;
        option.innerHTML = descriptor.name;
        this.__dataSelector.appendChild(option);
      },
    );

    // default selection
    if (this.__dataSelector.options.length > 0) {
      this.__dataSelector.selectedIndex = 0;
    }

    this.__dataSelector.addEventListener('change', () => {
      this.updateHintMessage();
    });

    return this.__dataSelector;
  }

  private updateHintMessage(): void {
    const select = this.getDataSelector();
    const descriptorId = select.options[select.selectedIndex]?.value;

    if (!descriptorId) {
      return;
    }

    const descriptor = this._loaderDescriptors[descriptorId];
    if (!descriptor) {
      return;
    }

    this.setStatusIdle(`Click to load "${descriptor.name}"`);
  }

  // ---------------------------
  // Button
  // ---------------------------

  protected getFetchButton(): HTMLElement {
    if (this.__fetchButton) {
      return this.__fetchButton;
    }

    this.__fetchButton = document.createElement('ion-button');
    this.__fetchButton.classList.add('loader-button');
    this.__fetchButton.innerText = 'Load Data';

    this.__fetchButton.addEventListener('click', async () => {
      const select = this.getDataSelector();
      const descriptorId = select.options[select.selectedIndex]?.value;

      if (!descriptorId) {
        throw new Error('Unable to determine selected loader');
      }

      const descriptor = this._loaderDescriptors[descriptorId];

      if (!descriptor) {
        throw new Error(`Unknown descriptor: ${descriptorId}`);
      }

      this.__loadingStartTime = performance.now();
      this.setStatusLoading(`Loading "${descriptor.name}"...`);

      try {
        const items = await descriptor.loader.getData();

        const duration = this.formatDuration(
          performance.now() - this.__loadingStartTime,
        );

        this.setStatusSuccess(
          `${descriptor.name} loaded (${items.length} items) in ${duration}. Id=${descriptorId}`,
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
          performance.now() - this.__loadingStartTime,
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

    return this.__fetchButton;
  }

  // ---------------------------
  // Helpers
  // ---------------------------

  private formatDuration(ms: number): string {
    if (ms < 1000) {
      return `${Math.round(ms)}ms`;
    }

    const sec = ms / 1000;

    if (sec < 60) {
      return `${sec.toFixed(2)}s`;
    }

    const min = Math.floor(sec / 60);
    const remainingSec = Math.round(sec % 60);

    return `${min}m ${remainingSec}s`;
  }

  // ---------------------------
  // UI
  // ---------------------------

  public getContainer(): HTMLDivElement {
    if (this.__div) {
      return this.__div;
    }

    this.__div = document.createElement('div');
    this.__div.id = uuid();
    this.__div.classList.add('loader-container');

    const selectorDiv = document.createElement('div');
    selectorDiv.appendChild(this.getDataSelector());

    const buttonDiv = document.createElement('div');
    buttonDiv.appendChild(this.getFetchButton());

    this.__div.appendChild(selectorDiv);
    this.__div.appendChild(buttonDiv);
    this.__div.appendChild(this.getStatusDiv());

    this.updateHintMessage();

    return this.__div;
  }

  public override updateResize(): boolean {
    return true;
  }
}

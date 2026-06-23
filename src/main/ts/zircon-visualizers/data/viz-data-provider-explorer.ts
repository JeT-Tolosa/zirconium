import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import {
  ZirconViz,
  ZirconVizEventRegistry,
} from '../../zirconium/zircon-ui/zircon-visualizer';
import { v4 as uuid } from 'uuid';

import './viz-data-provider-explorer.css';

import { ZirconApplication } from '../../zirconium/zircon-core/zircon-app';
import {
  ZirconDataProvider,
  ZirconDataProviderDescriptor,
  ZirconDataProviderEvents,
} from '../../zirconium/zircon-data/zircon-data-provider';
import {
  MergePickEvents,
  MergeZirconRegistries,
  PickEvents,
} from '../../zirconium/zircon-event';
// import { ZirconDataProviderManagerEvents } from '../../zirconium/zircon-data/zircon-data-provider-manager';
import { ZirconDataProviderManagerEvents } from '../../zirconium/zircon-data/zircon-data-provider-manager';

export interface VizDataProviderExplorerState {
  type: typeof VizDataProviderExplorer.DATA_EXPLORER_VISUALIZER_TYPE;
  id?: string;
  name?: string;
}

export type VizDataProviderExplorerEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconDataProviderManagerEvents,
          | 'DATA_PROVIDER_MANAGER_DESCRIPTORS'
          | 'DATA_PROVIDER_MANAGER_PROVIDER_REGISTERED'
        >,
        PickEvents<ZirconDataProviderEvents, 'DATA_PROVIDER_FULL_CONTENT'>,
      ]
    >;

    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconDataProviderEvents,
          'DATA_PROVIDER_FULL_CONTENT_REQUEST'
        >,
      ]
    >;
  },
  ZirconVizEventRegistry
>;

export class VizDataProviderExplorer<
  R extends VizDataProviderExplorerEventRegistry =
    VizDataProviderExplorerEventRegistry,
> extends ZirconViz<R> {
  public static readonly DATA_EXPLORER_VISUALIZER_TYPE =
    'data-provider-explorer-visualizer-type';

  private _jsonEditorContainer: HTMLDivElement = null;
  private _jsonEditor: JSONEditor = null;
  private _div: HTMLDivElement = null;
  private _dataProviderSelect: HTMLSelectElement = null;
  private _refreshButton: HTMLIonButtonElement = null;
  private _output: HTMLParagraphElement = null;
  private _app: ZirconApplication = null;
  private _currentSelectedDataProviderId: string = null;

  constructor(app: ZirconApplication, state?: VizDataProviderExplorerState) {
    super(state);
    this._app = app;
  }
  protected override listenToEvents(): void {
    super.listenToEvents();
    this.addListener('DATA_PROVIDER_MANAGER_DESCRIPTORS', (_arg) => {
      this.refreshDataProviderList();
    });
    this.addListener('DATA_PROVIDER_MANAGER_PROVIDER_REGISTERED', (_arg) => {
      this.refreshDataProviderList();
    });
    this.addListener('DATA_PROVIDER_FULL_CONTENT', (arg) => {
      this.onDATA_PROVIDER_FULL_CONTENT(arg.dataProviderDescriptor);
    });
  }
  public override getType(): string {
    return VizDataProviderExplorer.DATA_EXPLORER_VISUALIZER_TYPE;
  }

  private onDATA_PROVIDER_FULL_CONTENT(
    dataProviderDescriptor: ZirconDataProviderDescriptor,
  ) {
    if (
      !dataProviderDescriptor ||
      dataProviderDescriptor.id !== this.getSelectedProviderId()
    ) {
      return;
    }
    this.displaySelectedProvider();
  }

  private getApplication(): ZirconApplication {
    return this._app;
  }

  public updateDataProviderList(): boolean {
    this.refreshDataProviderList();
    return true;
  }

  public update(): void {}

  public start(): void {
    this.refreshDataProviderList();
  }

  public close(): void {
    this._jsonEditor?.destroy();
    this._jsonEditor = null;
  }

  private displayMessage(message: string, cssClass = 'info') {
    this.getOutputElement().className = 'provider-output';
    this.getOutputElement().classList.add(cssClass);
    this.getOutputElement().innerText = message;
  }

  private getJsonEditorContainer(): HTMLElement {
    if (this._jsonEditorContainer) {
      return this._jsonEditorContainer;
    }
    this._jsonEditorContainer = document.createElement('div');
    this._jsonEditorContainer.classList.add('provider-json-view');
    this._jsonEditor = new JSONEditor(this._jsonEditorContainer, {
      mode: 'tree',
      mainMenuBar: false,
      navigationBar: true,
      statusBar: true,
    });

    return this._jsonEditorContainer;
  }

  private async refreshDataProviderList(): Promise<void> {
    const select = this.getProviderSelector();
    const previousSelection = select.value;
    select.innerHTML = '';

    const manager = this.getApplication().getDataProviderManager();

    const dataProviderDescriptors: ZirconDataProviderDescriptor[] =
      manager.getDataProviderDescriptors();

    dataProviderDescriptors.forEach((dataProviderDescriptor) => {
      const option = document.createElement('option');
      option.value = dataProviderDescriptor.id;
      option.text = dataProviderDescriptor.name;
      select.appendChild(option);
    });
    if (
      previousSelection &&
      dataProviderDescriptors.some((d) => d.id === previousSelection)
    ) {
      select.value = previousSelection;
    }
    if (dataProviderDescriptors.length > 0) {
      select.selectedIndex = Math.max(select.selectedIndex, 0);
      await this.displaySelectedProvider();
    }
  }

  private getSelectedProviderId(): string {
    return this._dataProviderSelect?.value;
  }

  private async displaySelectedProvider(): Promise<void> {
    try {
      const providerId = this.getSelectedProviderId();
      if (!providerId) {
        return;
      }

      const obj: ZirconDataProvider = this.getApplication()
        .getDataProviderManager()
        .getDataProvider(providerId);
      // const obj = this.getApplication()
      //   .getObjectManager()
      //   .getExistingInstance(providerId);
      if (!obj) {
        return;
      }

      const provider: ZirconDataProvider = obj;

      if (!provider) {
        this._currentSelectedDataProviderId = null;
        this._jsonEditor?.set({});
        this.displayMessage('Provider not found', 'warning');
        return;
      }

      const data = await provider.getData();
      if (!data) {
        this.emit('DATA_PROVIDER_FULL_CONTENT_REQUEST', {
          dataProviderId: providerId,
        });
        this.displayMessage('No data stored, waiting for content');
        return;
      }
      this._jsonEditor?.set(data);
      const count =
        data && typeof data === 'object' ? Object.keys(data).length : 0;
      this.displayMessage(
        `Provider "${providerId}" loaded (${count} properties)`,
        'success',
      );
    } catch (error) {
      this.displayMessage(`Failed to display provider: ${error}`, 'error');
    }
  }

  private getRefreshButton(): HTMLIonButtonElement {
    if (this._refreshButton) {
      return this._refreshButton;
    }
    this._refreshButton = document.createElement('ion-button');
    this._refreshButton.classList.add('provider-refresh-button');
    this._refreshButton.innerText = 'Refresh';
    this._refreshButton.addEventListener('click', () => {
      this.refreshDataProviderList();
      this.displaySelectedProvider();
    });
    return this._refreshButton;
  }

  private getProviderSelector(): HTMLSelectElement {
    if (this._dataProviderSelect) {
      return this._dataProviderSelect;
    }
    this._dataProviderSelect = document.createElement('select');
    this._dataProviderSelect.classList.add('provider-selector');
    this._dataProviderSelect.addEventListener('change', () =>
      this.displaySelectedProvider(),
    );

    return this._dataProviderSelect;
  }

  private getOutputElement(): HTMLParagraphElement {
    if (this._output) {
      return this._output;
    }
    this._output = document.createElement('p');
    this._output.classList.add('provider-output');
    return this._output;
  }

  public getContainer(): HTMLDivElement {
    if (this._div) {
      return this._div;
    }

    this._div = document.createElement('div');
    this._div.id = uuid();
    this._div.classList.add('provider-container');
    const toolbar = document.createElement('div');
    toolbar.classList.add('provider-toolbar');
    toolbar.appendChild(this.getProviderSelector());
    toolbar.appendChild(this.getRefreshButton());
    this._div.appendChild(toolbar);
    this._div.appendChild(this.getJsonEditorContainer());
    this._div.appendChild(this.getOutputElement());

    return this._div;
  }
}

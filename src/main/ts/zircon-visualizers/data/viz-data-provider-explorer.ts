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
} from '../../zirconium/zircon-event/zircon-event';
// import { ZirconDataProviderManagerEvents } from '../../zirconium/zircon-data/zircon-data-provider-manager';
import { ZirconDataProviderManagerEvents } from '../../zirconium/zircon-data/zircon-data-provider-manager';
import '@ui5/webcomponents/dist/Button.js';
import '@ui5/webcomponents/dist/Select.js';
import '@ui5/webcomponents/dist/Option.js';
import '@ui5/webcomponents/dist/Text.js';
import '@ui5/webcomponents-icons/dist/refresh.js';
import Button from '@ui5/webcomponents/dist/Button.js';
import Select from '@ui5/webcomponents/dist/Select.js';
import Option from '@ui5/webcomponents/dist/Option.js';
import Text from '@ui5/webcomponents/dist/Text.js';
declare global {
  interface HTMLElementTagNameMap {
    'ui5-button': Button;
    'ui5-select': Select;
    'ui5-option': Option;
    'ui5-text': Text;
  }
}
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

  private __jsonEditorContainer: HTMLDivElement = null;
  private __jsonEditor: JSONEditor = null;

  private __div: HTMLDivElement = null;

  private __dataProviderSelect: HTMLElementTagNameMap['ui5-select'] = null;

  private __refreshButton: HTMLElementTagNameMap['ui5-button'] = null;

  private __output: HTMLElementTagNameMap['ui5-text'] = null;

  private __app: ZirconApplication = null;

  private _currentSelectedDataProviderId: string = null;

  constructor(app: ZirconApplication) {
    super();
    this.__app = app;
  }

  protected override listenToEvents(): void {
    super.listenToEvents();

    this.addListener('DATA_PROVIDER_MANAGER_DESCRIPTORS', () => {
      this.refreshDataProviderList();
    });

    this.addListener('DATA_PROVIDER_MANAGER_PROVIDER_REGISTERED', () => {
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
    return this.__app;
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
    this.__jsonEditor?.destroy();

    this.__jsonEditor = null;
  }

  private displayMessage(message: string, cssClass = 'info') {
    const output = this.getOutputElement();

    output.className = 'provider-output';

    output.classList.add(cssClass);

    output.textContent = message;
  }

  private getJsonEditorContainer(): HTMLElement {
    if (this.__jsonEditorContainer) {
      return this.__jsonEditorContainer;
    }

    this.__jsonEditorContainer = document.createElement('div');

    this.__jsonEditorContainer.classList.add('provider-json-view');

    this.__jsonEditor = new JSONEditor(this.__jsonEditorContainer, {
      mode: 'tree',
      mainMenuBar: false,
      navigationBar: true,
      statusBar: true,
    });

    return this.__jsonEditorContainer;
  }

  private async refreshDataProviderList(): Promise<void> {
    const select = this.getProviderSelector();

    const previousSelection = select.value;

    select.innerHTML = '';

    const manager = this.getApplication().getDataProviderManager();

    const dataProviderDescriptors: ZirconDataProviderDescriptor[] =
      manager.getDataProviderDescriptors();

    dataProviderDescriptors.forEach((dataProviderDescriptor) => {
      const option = document.createElement(
        'ui5-option',
      ) as HTMLElementTagNameMap['ui5-option'];

      option.value = dataProviderDescriptor.id;

      option.textContent = dataProviderDescriptor.name;

      select.appendChild(option);
    });

    if (
      previousSelection &&
      dataProviderDescriptors.some((d) => d.id === previousSelection)
    ) {
      select.value = previousSelection;
    } else if (dataProviderDescriptors.length > 0) {
      select.value = dataProviderDescriptors[0].id;
    }

    if (dataProviderDescriptors.length > 0) {
      await this.displaySelectedProvider();
    }
  }

  private getSelectedProviderId(): string {
    return this.__dataProviderSelect?.value ?? null;
  }

  private async displaySelectedProvider(): Promise<void> {
    try {
      const providerId = this.getSelectedProviderId();

      if (!providerId) {
        return;
      }

      const provider: ZirconDataProvider = this.getApplication()
        .getDataProviderManager()
        .getDataProvider(providerId);

      if (!provider) {
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

      this.__jsonEditor?.set(data);

      const count = typeof data === 'object' ? Object.keys(data).length : 0;

      this.displayMessage(
        `Provider "${providerId}" loaded (${count} properties)`,
        'success',
      );
    } catch (error) {
      this.displayMessage(`Failed to display provider: ${error}`, 'error');
    }
  }

  private getRefreshButton(): HTMLElementTagNameMap['ui5-button'] {
    if (this.__refreshButton) {
      return this.__refreshButton;
    }

    this.__refreshButton = document.createElement('ui5-button');

    this.__refreshButton.classList.add('provider-refresh-button');

    this.__refreshButton.textContent = 'Refresh';

    this.__refreshButton.setAttribute('icon', 'refresh');

    this.__refreshButton.addEventListener('click', () => {
      this.refreshDataProviderList();

      this.displaySelectedProvider();
    });

    return this.__refreshButton;
  }

  private getProviderSelector(): HTMLElementTagNameMap['ui5-select'] {
    if (this.__dataProviderSelect) {
      return this.__dataProviderSelect;
    }

    this.__dataProviderSelect = document.createElement('ui5-select');

    this.__dataProviderSelect.classList.add('provider-selector');

    this.__dataProviderSelect.addEventListener('change', () =>
      this.displaySelectedProvider(),
    );

    return this.__dataProviderSelect;
  }

  private getOutputElement(): HTMLElementTagNameMap['ui5-text'] {
    if (this.__output) {
      return this.__output;
    }

    this.__output = document.createElement('ui5-text');

    this.__output.classList.add('provider-output');

    return this.__output;
  }

  public getContainer(): HTMLDivElement {
    if (this.__div) {
      return this.__div;
    }

    this.__div = document.createElement('div');

    this.__div.id = uuid();

    this.__div.classList.add('provider-container');

    const toolbar = document.createElement('div');

    toolbar.classList.add('provider-toolbar');

    toolbar.appendChild(this.getProviderSelector());

    toolbar.appendChild(this.getRefreshButton());

    this.__div.appendChild(toolbar);

    this.__div.appendChild(this.getJsonEditorContainer());

    this.__div.appendChild(this.getOutputElement());

    return this.__div;
  }
}

// export class VizDataProviderExplorer<
//   R extends VizDataProviderExplorerEventRegistry =
//     VizDataProviderExplorerEventRegistry,
// > extends ZirconViz<R> {
//   public static readonly DATA_EXPLORER_VISUALIZER_TYPE =
//     'data-provider-explorer-visualizer-type';

//   private __jsonEditorContainer: HTMLDivElement = null;
//   private __jsonEditor: JSONEditor = null;
//   private __div: HTMLDivElement = null;
//   private __dataProviderSelect: HTMLSelectElement = null;
//   private __refreshButton: HTMLIonButtonElement = null;
//   private __output: HTMLParagraphElement = null;
//   private __app: ZirconApplication = null;
//   private _currentSelectedDataProviderId: string = null;

//   constructor(app: ZirconApplication, state?: VizDataProviderExplorerState) {
//     super();
//     this.__app = app;
//   }
//   protected override listenToEvents(): void {
//     super.listenToEvents();
//     this.addListener('DATA_PROVIDER_MANAGER_DESCRIPTORS', (_arg) => {
//       this.refreshDataProviderList();
//     });
//     this.addListener('DATA_PROVIDER_MANAGER_PROVIDER_REGISTERED', (_arg) => {
//       this.refreshDataProviderList();
//     });
//     this.addListener('DATA_PROVIDER_FULL_CONTENT', (arg) => {
//       this.onDATA_PROVIDER_FULL_CONTENT(arg.dataProviderDescriptor);
//     });
//   }
//   public override getType(): string {
//     return VizDataProviderExplorer.DATA_EXPLORER_VISUALIZER_TYPE;
//   }

//   private onDATA_PROVIDER_FULL_CONTENT(
//     dataProviderDescriptor: ZirconDataProviderDescriptor,
//   ) {
//     if (
//       !dataProviderDescriptor ||
//       dataProviderDescriptor.id !== this.getSelectedProviderId()
//     ) {
//       return;
//     }
//     this.displaySelectedProvider();
//   }

//   private getApplication(): ZirconApplication {
//     return this.__app;
//   }

//   public updateDataProviderList(): boolean {
//     this.refreshDataProviderList();
//     return true;
//   }

//   public update(): void {}

//   public start(): void {
//     this.refreshDataProviderList();
//   }

//   public close(): void {
//     this.__jsonEditor?.destroy();
//     this.__jsonEditor = null;
//   }

//   private displayMessage(message: string, cssClass = 'info') {
//     this.getOutputElement().className = 'provider-output';
//     this.getOutputElement().classList.add(cssClass);
//     this.getOutputElement().innerText = message;
//   }

//   private getJsonEditorContainer(): HTMLElement {
//     if (this.__jsonEditorContainer) {
//       return this.__jsonEditorContainer;
//     }
//     this.__jsonEditorContainer = document.createElement('div');
//     this.__jsonEditorContainer.classList.add('provider-json-view');
//     this.__jsonEditor = new JSONEditor(this.__jsonEditorContainer, {
//       mode: 'tree',
//       mainMenuBar: false,
//       navigationBar: true,
//       statusBar: true,
//     });

//     return this.__jsonEditorContainer;
//   }

//   private async refreshDataProviderList(): Promise<void> {
//     const select = this.getProviderSelector();
//     const previousSelection = select.value;
//     select.innerHTML = '';

//     const manager = this.getApplication().getDataProviderManager();

//     const dataProviderDescriptors: ZirconDataProviderDescriptor[] =
//       manager.getDataProviderDescriptors();

//     dataProviderDescriptors.forEach((dataProviderDescriptor) => {
//       const option = document.createElement('option');
//       option.value = dataProviderDescriptor.id;
//       option.text = dataProviderDescriptor.name;
//       select.appendChild(option);
//     });
//     if (
//       previousSelection &&
//       dataProviderDescriptors.some((d) => d.id === previousSelection)
//     ) {
//       select.value = previousSelection;
//     }
//     if (dataProviderDescriptors.length > 0) {
//       select.selectedIndex = Math.max(select.selectedIndex, 0);
//       await this.displaySelectedProvider();
//     }
//   }

//   private getSelectedProviderId(): string {
//     return this.__dataProviderSelect?.value;
//   }

//   private async displaySelectedProvider(): Promise<void> {
//     try {
//       const providerId = this.getSelectedProviderId();
//       if (!providerId) {
//         return;
//       }

//       const obj: ZirconDataProvider = this.getApplication()
//         .getDataProviderManager()
//         .getDataProvider(providerId);
//       // const obj = this.getApplication()
//       //   .getObjectManager()
//       //   .getExistingInstance(providerId);
//       if (!obj) {
//         return;
//       }

//       const provider: ZirconDataProvider = obj;

//       if (!provider) {
//         this._currentSelectedDataProviderId = null;
//         this.__jsonEditor?.set({});
//         this.displayMessage('Provider not found', 'warning');
//         return;
//       }

//       const data = await provider.getData();
//       if (!data) {
//         this.emit('DATA_PROVIDER_FULL_CONTENT_REQUEST', {
//           dataProviderId: providerId,
//         });
//         this.displayMessage('No data stored, waiting for content');
//         return;
//       }
//       this.__jsonEditor?.set(data);
//       const count =
//         data && typeof data === 'object' ? Object.keys(data).length : 0;
//       this.displayMessage(
//         `Provider "${providerId}" loaded (${count} properties)`,
//         'success',
//       );
//     } catch (error) {
//       this.displayMessage(`Failed to display provider: ${error}`, 'error');
//     }
//   }

//   private getRefreshButton(): HTMLIonButtonElement {
//     if (this.__refreshButton) {
//       return this.__refreshButton;
//     }
//     this.__refreshButton = document.createElement('ion-button');
//     this.__refreshButton.classList.add('provider-refresh-button');
//     this.__refreshButton.innerText = 'Refresh';
//     this.__refreshButton.addEventListener('click', () => {
//       this.refreshDataProviderList();
//       this.displaySelectedProvider();
//     });
//     return this.__refreshButton;
//   }

//   private getProviderSelector(): HTMLSelectElement {
//     if (this.__dataProviderSelect) {
//       return this.__dataProviderSelect;
//     }
//     this.__dataProviderSelect = document.createElement('select');
//     this.__dataProviderSelect.classList.add('provider-selector');
//     this.__dataProviderSelect.addEventListener('change', () =>
//       this.displaySelectedProvider(),
//     );

//     return this.__dataProviderSelect;
//   }

//   private getOutputElement(): HTMLParagraphElement {
//     if (this.__output) {
//       return this.__output;
//     }
//     this.__output = document.createElement('p');
//     this.__output.classList.add('provider-output');
//     return this.__output;
//   }

//   public getContainer(): HTMLDivElement {
//     if (this.__div) {
//       return this.__div;
//     }

//     this.__div = document.createElement('div');
//     this.__div.id = uuid();
//     this.__div.classList.add('provider-container');
//     const toolbar = document.createElement('div');
//     toolbar.classList.add('provider-toolbar');
//     toolbar.appendChild(this.getProviderSelector());
//     toolbar.appendChild(this.getRefreshButton());
//     this.__div.appendChild(toolbar);
//     this.__div.appendChild(this.getJsonEditorContainer());
//     this.__div.appendChild(this.getOutputElement());

//     return this.__div;
//   }
// }

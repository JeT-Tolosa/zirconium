import './zircon-param-window.css';
import {
  MergeZirconRegistries,
  MergePickEvents,
  PickEvents,
} from '../zircon-event';
import { ZirconApplication } from '../zircon-core/zircon-app';
import {
  ZirconWindow,
  ZirconWindowEventRegistry,
  ZirconWindowState,
} from '../zircon-ui/zircon-window';
import { IJSPanelInstance } from 'jspanel4';
import { ZIRCON_PARAMETER_WINDOW_TYPE } from '../zircon-core/zircon-types';
import { ZirconStateEditor } from './zircon-state-editor';
import {
  ZirconObjectEvents,
  ZirconObjectState,
} from '../zircon-core/zircon-object';
import '@ui5/webcomponents/dist/Button.js';
import type Button from '@ui5/webcomponents/dist/Button.js';
import '@ui5/webcomponents/dist/CheckBox.js';
import type CheckBox from '@ui5/webcomponents/dist/CheckBox.js';
import '@ui5/webcomponents/dist/Option.js';
import type Option from '@ui5/webcomponents/dist/Option.js';
import '@ui5/webcomponents/dist/Select.js';
import type Select from '@ui5/webcomponents/dist/Select.js';
declare global {
  interface HTMLElementTagNameMap {
    'ui5-button': Button;
    'ui5-checkbox': CheckBox;
    'ui5-option': Option;
    'ui5-select': Select;
  }
}
export const ZIRCON_PARAMETER_WINDOW_CLASS = 'zircon-param';

export interface ZirconParamWindowState extends ZirconWindowState {
  sourceId: string; // object to display state editors for
}

export type ZirconParamWindowEvents = {};

export type ZirconParamWindowEventRegistry = MergeZirconRegistries<
  {
    incoming: MergePickEvents<
      [
        PickEvents<
          ZirconObjectEvents,
          'ZIRCON_OBJECT_STATE_CHANGED' | 'ZIRCON_OBJECT_STATE'
        >,
        // PickEvents<
        //   ZirconObjectManagerEvents,
        //   'STATE_SNAPSHOT_MODIFIED' | 'STATE_SNAPSHOT'
        // >,
      ]
    >;
    outgoing: MergePickEvents<
      [
        PickEvents<
          ZirconObjectEvents,
          'ZIRCON_OBJECT_SET_STATE_REQUEST' | 'ZIRCON_OBJECT_GET_STATE_REQUEST'
        >,
      ]
    >;
  },
  ZirconWindowEventRegistry
>;

export class ZirconParamWindow<
  R extends ZirconParamWindowEventRegistry = ZirconParamWindowEventRegistry,
> extends ZirconWindow<R> {
  //private _compIds: string[] = [];
  private _sourceId: string = null;
  private _selectedObjId: string = null;
  private __mainContainer: HTMLDivElement = null;
  private __viewContainer: HTMLDivElement = null;
  private __headerContainer: HTMLDivElement = null;
  private __footerContainer: HTMLDivElement = null;
  private __objIdSelect: Select = null;
  private __objEditorSelect: Select = null;
  private __autoApplyCheckbox: CheckBox = null;
  private __applyButton: Button = null;

  private __objectEditors: {
    [objId: string]: {
      sourceObjName: string;
      editors: ZirconStateEditor[];
      selectedEditorId: string;
    };
  } = {};

  constructor(app: ZirconApplication) {
    super(app);
  }

  public override listenToEvents(): void {
    this.addListener('ZIRCON_OBJECT_STATE', (arg) => {
      this.onStateChanged(arg.state?.id, arg.state);
    });
    this.addListener('ZIRCON_OBJECT_STATE_CHANGED', (arg) => {
      this.onStateChanged(arg.id, arg.state);
    });
  }

  private onStateChanged(objId: string, state: ZirconObjectState) {
    if (Object.keys(this.__objectEditors).indexOf(objId) === -1) {
      return;
    }
    const editors: ZirconStateEditor[] = this.__objectEditors[objId].editors;
    editors.forEach((editor) => {
      editor.setSourceObjState(state);
      editor.updateUI();
    });
  }

  // public setWindow(window: ZirconWindow): void {
  //   // TODO remove previous display if necessary
  //   this._source = window;
  //   if (this.__windowPanel) {
  //     this._source.getParameterParameterComponent(this.__windowPanel.content);
  //   }
  // }

  // private addStateEditors(objId: string): void {
  //   this.__objectEditors[objId] = {
  //     name: objId,
  //     editors: this.getApplication()
  //       .getStateEditorManager()
  //       .getStateEditorsById(objId),
  //   };

  //   this.reconstructUI();
  //   this.requestObjectState();

  //   // this.getApplication()
  //   //   .getParameterEditorManager(objId)
  //   //   .getParameterEditors()
  //   //   .forEach((comp) => {
  //   //     this.__comp[comp.getId()] = comp;
  //   //   });
  // }

  /**
   * @fires ZIRCON_OBJECT_GET_STATE_REQUEST
   */
  private requestEditedObjectStates(): void {
    Object.keys(this.__objectEditors).forEach((objId) => {
      this.emit('ZIRCON_OBJECT_GET_STATE_REQUEST', {
        id: objId,
      });
    });
  }

  public override async setState(state: ZirconParamWindowState): Promise<void> {
    if (!state) {
      return;
    }
    await super.setState(state);
    await this.setSourceId(state.sourceId);
  }

  /**
   * Get the state of this window Object
   * @returns The state of the window
   */
  public override generateCurrentState(): ZirconParamWindowState {
    return {
      ...super.generateCurrentState(),
      type: ZIRCON_PARAMETER_WINDOW_TYPE,
      sourceId: this.getSourceId(),
    };
  }

  private getSourceId(): string {
    return this._sourceId;
  }

  public setSourceId(sourceId: string): void {
    if (!sourceId) {
      return;
    }
    if (this._sourceId === sourceId) {
      return;
    }
    this._sourceId = sourceId;
    this.reconstructUI();
  }

  public override getType(): string {
    return ZIRCON_PARAMETER_WINDOW_TYPE;
  }

  protected override async onPanelCreated(
    panel: IJSPanelInstance,
  ): Promise<void> {
    super.onPanelCreated(panel);
    if (!panel) {
      throw new Error(
        `panel should not be null in Param window Creation ID: ${this.getId()} name: ${this.getName()}`,
      );
    }
    panel.classList.add(ZIRCON_PARAMETER_WINDOW_CLASS);
    this.getWindowContent().appendChild(this.getMainContainer());
    this.reconstructUI();
  }

  // public override getWindowContent(): HTMLDivElement {
  //   return this.getMainContainer();
  // }

  // private generateViewElement(editor: ZirconStateEditor): HTMLDivElement {
  //   if (!editor) {
  //     return null;
  //   }
  //   const viewElement = document.createElement('div');
  //   viewElement.appendChild(editor.getContainer());
  //   return viewElement;
  // }

  // private generateHeaderElement(
  //   editor: ZirconStateEditor,
  // ): HTMLIonSegmentButtonElement {
  //   if (!editor) {
  //     return null;
  //   }
  //   const headerElement = document.createElement('ion-segment-button');
  //   headerElement.value = editor.getId();
  //   headerElement.textContent = editor.getName();
  //   return headerElement;
  // }

  private getHeaderContainer(): HTMLDivElement {
    if (this.__headerContainer) {
      return this.__headerContainer;
    }
    this.__headerContainer = document.createElement('div');
    this.__headerContainer.classList.add('header');
    this.__headerContainer.appendChild(this.getObjIdSelect());
    this.__headerContainer.appendChild(this.getObjEditorSelect());
    return this.__headerContainer;
  }

  private getObjIdSelect(): Select {
    if (this.__objIdSelect) {
      return this.__objIdSelect;
    }
    this.__objIdSelect = document.createElement('ui5-select');
    this.__objIdSelect.disabled = true;
    this.__objIdSelect.addEventListener('change', () => {
      this.fillEditorsSelect();
    });
    this.fillObjIdsSelect();
    return this.__objIdSelect;
  }

  private getObjEditorSelect(): Select {
    if (this.__objEditorSelect) {
      return this.__objEditorSelect;
    }
    this.__objEditorSelect = document.createElement('ui5-select');
    this.__objEditorSelect.disabled = true;
    this.__objEditorSelect.addEventListener('change', () => {
      this.fillViewContent();
    });
    return this.__objEditorSelect;
  }

  private fillObjIdsSelect(): void {
    if (!this._sourceId) {
      return;
    }
    if (!this.__objIdSelect) {
      return;
    }
    this.__objIdSelect.disabled = true;
    this.__objIdSelect.replaceChildren();

    let firstOptionId: string = null;
    for (const [objId, objDescriptors] of Object.entries(
      this.__objectEditors,
    )) {
      const option = document.createElement('ui5-option') as Option;
      option.textContent = objDescriptors.sourceObjName;
      option.value = objId;
      this.__objIdSelect.append(option);
      if (!firstOptionId) {
        firstOptionId = option.value;
      }
    }
    // NB: Do not use select.options it is updated when rendered
    if (this.__objIdSelect.children.length > 0) {
      this.__objIdSelect.disabled = false;
    }

    this.__objIdSelect.value = this._selectedObjId || firstOptionId;
    // setting value programmatically does not trigger event: launch update manually
    this.fillEditorsSelect();
  }

  private fillEditorsSelect(): void {
    if (!this._sourceId) {
      return;
    }
    if (!this.__objIdSelect) {
      return;
    }
    if (!this.__objEditorSelect) {
      return;
    }
    if (!this.__objectEditors) {
      return;
    }
    this.__objEditorSelect.disabled = true;
    this.__objEditorSelect.replaceChildren();
    const objId = this.__objIdSelect.value;
    if (!objId) {
      return;
    }
    const editors = this.__objectEditors[objId]?.editors ?? [];

    // Add editors options
    for (const editor of editors) {
      const option = document.createElement('ui5-option') as Option;
      option.textContent = editor.getEditorName();
      option.value = editor.getId();
      // option.setAttribute('data-editor-id', editor.getId());
      this.__objEditorSelect.append(option);
    }
    // NB: Do not use select.options it is updated when rendered
    if (this.__objEditorSelect.children.length > 0) {
      this.__objEditorSelect.disabled = false;
    }

    if (editors.length > 0) {
      this.__objEditorSelect.value =
        this.__objectEditors[objId]?.selectedEditorId || editors[0].getId();
    }
    this.fillViewContent();
  }

  private fillViewContent(): void {
    this.getViewContainer().replaceChildren();
    const objId = this.getObjIdSelect().value;
    if (!objId) {
      return;
    }
    const editorId = this.getObjEditorSelect().value;
    if (!editorId) {
      return;
    }

    const editor = this.__objectEditors[objId]?.editors?.find(
      (e) => e.getId() === editorId,
    );
    if (!editor) {
      return;
    }
    this.getViewContainer().append(editor.getContainer());
    editor.updateUI();
  }

  private async reconstructUI(): Promise<void> {
    if (!this.isDisplayed()) {
      return;
    }
    this.retrieveAllEditors();
    this.fillObjIdsSelect();
    this.requestEditedObjectStates();
    return;
  }

  private getViewContainer(): HTMLDivElement {
    if (this.__viewContainer) {
      return this.__viewContainer;
    }
    this.__viewContainer = document.createElement('div');
    this.__viewContainer.classList.add('view');
    return this.__viewContainer;
  }

  private getFooterContainer(): HTMLDivElement {
    if (this.__footerContainer) {
      return this.__footerContainer;
    }
    this.__footerContainer = document.createElement('div');
    this.__footerContainer.classList.add('footer');

    this.__footerContainer.appendChild(this.getAutoApplyCheckbox());
    this.__footerContainer.appendChild(this.getApplyButton());
    return this.__footerContainer;
  }

  private getAutoApplyCheckbox(): CheckBox {
    if (this.__autoApplyCheckbox) {
      return this.__autoApplyCheckbox;
    }
    this.__autoApplyCheckbox = document.createElement('ui5-checkbox');
    this.__autoApplyCheckbox.text = 'auto apply';
    return this.__autoApplyCheckbox;
  }

  private getApplyButton(): Button {
    if (this.__applyButton) {
      return this.__applyButton;
    }
    this.__applyButton = document.createElement('ui5-button');
    this.__applyButton.textContent = 'Apply';
    // this.__applyButton.design = 'Emphasized';
    this.__applyButton.addEventListener('click', () => {
      const objId = this.getObjIdSelect().value;
      const editorId = this.getObjEditorSelect().value;
      const editor = this.__objectEditors[objId]?.editors?.find(
        (e) => e.getId() === editorId,
      );
      // TODO: minimal verifications: id & type exists
      const newState = editor.getEditedState() as ZirconObjectState;
      this.emit('ZIRCON_OBJECT_SET_STATE_REQUEST', {
        id: objId,
        state: newState,
      });
    });
    return this.__applyButton;
  }

  // public setActiveCompId(objId: string): void {
  //   if (!objId) {
  //     return;
  //   }
  //   if (this._activeCompId === objId) {
  //     return;
  //   }
  //   this._activeCompId = objId;
  //   this.displayActiveComp();
  // }

  // private displayActiveComp() {
  //   if (!this._activeCompId) {
  //     return;
  //   }
  //   this.__segment.value = this._activeCompId;
  //   Object.values(this.__editors).forEach((editors) => {
  //     if (!editors || editors.length === 0) {
  //       return;
  //     }
  //     const editor = editors[0];
  //     if (editor?.getId() === this._activeCompId) {
  //       this.showParameterComponent(editor);
  //     } else {
  //       this.hideParameterComponent(editor);
  //     }
  //   });
  // }

  private showParameterComponent(editor: ZirconStateEditor) {
    if (!editor) {
      return;
    }
    editor.getContainer().style.display = 'block';
  }

  private hideParameterComponent(editor: ZirconStateEditor) {
    if (!editor) {
      return;
    }
    editor.getContainer().style.display = 'none';
  }

  private getMainContainer(): HTMLDivElement {
    if (this.__mainContainer) {
      return this.__mainContainer;
    }
    this.__mainContainer = document.createElement('div');
    this.__mainContainer.classList.add('main');
    this.__mainContainer.appendChild(this.getHeaderContainer());
    this.__mainContainer.appendChild(this.getViewContainer());
    this.__mainContainer.appendChild(this.getFooterContainer());
    return this.__mainContainer;
  }

  private retrieveAllEditors(): void {
    // stores selected editor ID for each objIds (if they exist)
    const selectedEditorId: { [objId: string]: string } = {};
    if (this.__objectEditors) {
      Object.entries(this.__objectEditors).forEach(
        ([objId, editorsDescriptor]) => {
          selectedEditorId[objId] = editorsDescriptor.selectedEditorId;
        },
      );
    }
    // get all new objIds/editors for all _sourceId
    this.__objectEditors = {};
    const allEditors = this.getApplication()
      .getStateEditorManager()
      .getStateEditorsById(this.getSourceId());
    if (!allEditors) {
      return;
    }
    Object.entries(allEditors).forEach(([objId, editors]) => {
      let name = objId;
      const instance = this.getApplication()
        .getObjectManager()
        .getExistingInstance(objId);
      if (instance) {
        name = instance.getName();
      }
      this.__objectEditors[objId] = {
        sourceObjName: name,
        editors: editors,
        selectedEditorId:
          selectedEditorId[objId] || Object.values(editors)[0]?.getId(),
      };
    });
  }
}

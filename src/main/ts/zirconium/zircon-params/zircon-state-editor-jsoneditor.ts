import JSONEditor from 'jsoneditor';
import 'jsoneditor/dist/jsoneditor.css';
import { ZirconObject } from '../zircon-core/zircon-object';
import { ZirconStateEditor } from './zircon-state-editor';
import { ZirconStateEditorFactory } from './zircon-state-editor-factory';

export class ZirconStateJsonEditorFactory extends ZirconStateEditorFactory {
  constructor() {
    super();
  }

  public generateNewEditor(obj: ZirconObject): ZirconStateEditor {
    return new ZirconStateEditorJSonEditor(obj);
  }
}

export class ZirconStateEditorJSonEditor extends ZirconStateEditor {
  private __mainContainer: HTMLDivElement = null;
  private __jsonEditor: JSONEditor = null;

  constructor(obj: ZirconObject) {
    super(obj);
  }

  public override getEditorName(): string {
    return 'JSON Editor';
  }

  public override getContainer(): HTMLElement {
    if (this.__mainContainer) {
      return this.__mainContainer;
    }
    this.__mainContainer = document.createElement('div');
    this.__mainContainer.style.width = '100%';
    this.__mainContainer.style.height = '100%';
    return this.__mainContainer;
  }

  private getJsonEditor(): JSONEditor {
    if (this.__jsonEditor) {
      return this.__jsonEditor;
    }
    if (!this.__mainContainer) {
      return null;
    }
    this.__jsonEditor = new JSONEditor(this.__mainContainer, {
      mode: 'tree',
      mainMenuBar: false,
      navigationBar: true,
      statusBar: true,
    });
    return this.__jsonEditor;
  }

  public override updateUI(): void {
    if (!this.__mainContainer) {
      return;
    }
    this.getJsonEditor().set(this.getSourceObjState());
  }

  public override getEditedState(): unknown {
    return JSON.parse(this.__jsonEditor?.getText());
  }

  private close(): void {
    this.__jsonEditor?.destroy();
    this.__jsonEditor = null;
  }
}

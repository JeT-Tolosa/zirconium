import { ZirconObject } from '../zircon-core/zircon-object';
import { ZirconStateEditor } from './zircon-state-editor';
import { ZirconStateEditorFactory } from './zircon-state-editor-factory';

export class ZirconStateEditorPreFactory extends ZirconStateEditorFactory {
  constructor() {
    super();
  }

  public generateNewEditor(obj: ZirconObject): ZirconStateEditor {
    return new ZirconStateEditorPre(obj);
  }
}

export class ZirconStateEditorPre extends ZirconStateEditor {
  private _pre: HTMLPreElement = null;

  constructor(obj: ZirconObject) {
    super(obj);
  }

  public override getEditorName(): string {
    return 'pre (readonly)';
  }

  public override getContainer(): HTMLElement {
    if (this._pre) {
      return this._pre;
    }
    this._pre = document.createElement('pre');
    this.updateUI();
    return this._pre;
  }

  public override getEditedState(): unknown {
    return this.getSourceObjState();
  }

  public override updateUI(): void {
    if (this._pre) {
      this._pre.innerText = JSON.stringify(this.getSourceObjState(), null, 2);
    }
  }
}

import { ZirconObject } from '../zircon-core/zircon-object';
import { ZirconStateEditor, ZirconStateEditorPre } from './zircon-state-editor';

export abstract class ZirconStateEditorFactory {
  constructor() {}

  public abstract generateNewEditor(obj: ZirconObject): ZirconStateEditor;
}

export class ZirconStateEditorFactoryPre extends ZirconStateEditorFactory {
  private _pre: HTMLPreElement = null;

  constructor() {
    super();
  }

  public generateNewEditor(obj: ZirconObject): ZirconStateEditor {
    return new ZirconStateEditorPre(obj);
  }
}
